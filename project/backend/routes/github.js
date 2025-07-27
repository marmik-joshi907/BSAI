import express from 'express';
import axios from 'axios';
import { optionalAuth } from '../middleware/auth.js';
import { scanCode } from '../services/vulnerabilityScanner.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Helper function to parse GitHub URL
const parseGitHubUrl = (url) => {
  const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
  const match = url.match(regex);
  
  if (!match) {
    throw new Error('Invalid GitHub URL format');
  }
  
  return {
    owner: match[1],
    repo: match[2].replace('.git', '')
  };
};

// Helper function to get file content from GitHub
const getFileContent = async (owner, repo, path, ref = 'main') => {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          'Authorization': GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : undefined,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: { ref }
      }
    );

    if (response.data.type === 'file') {
      // Decode base64 content
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      return {
        path: response.data.path,
        content,
        size: response.data.size
      };
    }
    
    return null;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// Helper function to get repository tree
const getRepoTree = async (owner, repo, ref = 'main') => {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${ref}`,
      {
        headers: {
          'Authorization': GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : undefined,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: { recursive: 1 }
      }
    );

    return response.data.tree;
  } catch (error) {
    logger.error('Error fetching repository tree:', error);
    throw error;
  }
};

// Scan GitHub repository
router.post('/scan', optionalAuth, async (req, res) => {
  try {
    const { repositoryUrl, branch = 'main' } = req.body;

    if (!repositoryUrl) {
      return res.status(400).json({
        error: 'Missing Repository URL',
        message: 'Please provide a GitHub repository URL'
      });
    }

    logger.info(`Starting GitHub scan for: ${repositoryUrl}`);

    // Parse GitHub URL
    const { owner, repo } = parseGitHubUrl(repositoryUrl);

    // Get repository information
    const repoResponse = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
      {
        headers: {
          'Authorization': GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : undefined,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    const repoInfo = repoResponse.data;

    // Get repository tree
    const tree = await getRepoTree(owner, repo, branch);

    // Filter for scannable files
    const scannableExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.html', '.htm', '.php', '.py', 
      '.rb', '.java', '.c', '.cpp', '.css', '.scss', '.sql', '.json'
    ];

    const scannableFiles = tree.filter(item => 
      item.type === 'blob' && 
      scannableExtensions.some(ext => item.path.endsWith(ext)) &&
      item.size < 1024 * 1024 // Skip files larger than 1MB
    );

    logger.info(`Found ${scannableFiles.length} scannable files`);

    const scanResults = {
      repository: {
        name: repoInfo.name,
        fullName: repoInfo.full_name,
        url: repoInfo.html_url,
        branch,
        language: repoInfo.language,
        size: repoInfo.size,
        lastUpdated: repoInfo.updated_at
      },
      totalFiles: scannableFiles.length,
      vulnerabilities: [],
      summary: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        riskScore: 0
      },
      scanId: `github-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    // Limit the number of files to scan to prevent timeout
    const filesToScan = scannableFiles.slice(0, 50);
    
    // Scan files
    for (const file of filesToScan) {
      try {
        const fileContent = await getFileContent(owner, repo, file.path, branch);
        
        if (fileContent && fileContent.content) {
          const vulnerabilities = await scanCode(fileContent.content, file.path);
          
          // Add file information to each vulnerability
          vulnerabilities.forEach(vuln => {
            vuln.file = file.path;
            vuln.id = `${scanResults.scanId}-${scanResults.vulnerabilities.length + 1}`;
            vuln.repositoryUrl = repositoryUrl;
            vuln.branch = branch;
          });

          scanResults.vulnerabilities.push(...vulnerabilities);
        }
      } catch (error) {
        logger.error(`Error scanning file ${file.path}:`, error);
        // Continue with other files
      }
    }

    // Calculate summary statistics
    scanResults.vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'Critical':
          scanResults.summary.critical++;
          break;
        case 'High':
          scanResults.summary.high++;
          break;
        case 'Medium':
          scanResults.summary.medium++;
          break;
        case 'Low':
          scanResults.summary.low++;
          break;
      }
    });

    // Calculate risk score
    const totalVulns = scanResults.vulnerabilities.length;
    if (totalVulns > 0) {
      const weightedScore = (
        scanResults.summary.critical * 10 +
        scanResults.summary.high * 7 +
        scanResults.summary.medium * 4 +
        scanResults.summary.low * 1
      );
      scanResults.summary.riskScore = Math.min(100, Math.round((weightedScore / totalVulns) * 10));
    }

    logger.info(`GitHub scan completed: ${scanResults.vulnerabilities.length} vulnerabilities found`);

    res.json({
      message: 'GitHub repository scan completed',
      results: scanResults
    });

  } catch (error) {
    logger.error('GitHub scan error:', error);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Repository Not Found',
        message: 'The specified GitHub repository could not be found or is private'
      });
    }

    if (error.response?.status === 403) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Unable to access the repository. It may be private or rate limited.'
      });
    }

    res.status(500).json({
      error: 'GitHub Scan Failed',
      message: 'Unable to scan GitHub repository'
    });
  }
});

// Get repository information
router.get('/repo-info', optionalAuth, async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        error: 'Missing URL',
        message: 'Please provide a repository URL'
      });
    }

    const { owner, repo } = parseGitHubUrl(url);

    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
      {
        headers: {
          'Authorization': GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : undefined,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    const repoData = response.data;

    res.json({
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description,
      language: repoData.language,
      size: repoData.size,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      lastUpdated: repoData.updated_at,
      isPrivate: repoData.private,
      url: repoData.html_url
    });

  } catch (error) {
    logger.error('Repository info error:', error);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Repository Not Found',
        message: 'The specified repository could not be found'
      });
    }

    res.status(500).json({
      error: 'Failed to Get Repository Info',
      message: 'Unable to retrieve repository information'
    });
  }
});

export default router;