import express from 'express';
import { readFile } from 'fs/promises';
import { join } from 'path';
import upload from '../middleware/upload.js';
import { optionalAuth } from '../middleware/auth.js';
import { scanCode } from '../services/vulnerabilityScanner.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Scan uploaded files
router.post('/files', optionalAuth, upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No Files',
        message: 'Please upload at least one file to scan'
      });
    }

    logger.info(`Starting scan for ${req.files.length} files`);

    const scanResults = {
      totalFiles: req.files.length,
      vulnerabilities: [],
      summary: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        riskScore: 0
      },
      scanId: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    // Process each file
    for (const file of req.files) {
      try {
        const content = await readFile(file.path, 'utf-8');
        const fileVulnerabilities = await scanCode(content, file.originalname);
        
        // Add file information to each vulnerability
        fileVulnerabilities.forEach(vuln => {
          vuln.file = file.originalname;
          vuln.id = `${scanResults.scanId}-${scanResults.vulnerabilities.length + 1}`;
        });

        scanResults.vulnerabilities.push(...fileVulnerabilities);
      } catch (error) {
        logger.error(`Error scanning file ${file.originalname}:`, error);
        // Continue with other files even if one fails
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

    // Calculate risk score (0-100)
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

    logger.info(`Scan completed: ${scanResults.vulnerabilities.length} vulnerabilities found`);

    res.json({
      message: 'Scan completed successfully',
      results: scanResults
    });

  } catch (error) {
    logger.error('File scan error:', error);
    res.status(500).json({
      error: 'Scan Failed',
      message: 'Unable to complete vulnerability scan'
    });
  }
});

// Scan code snippet
router.post('/snippet', optionalAuth, async (req, res) => {
  try {
    const { code, language, filename } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        error: 'No Code',
        message: 'Please provide code to scan'
      });
    }

    logger.info(`Starting snippet scan for ${language || 'unknown'} code`);

    const vulnerabilities = await scanCode(code, filename || `snippet.${language || 'txt'}`);
    
    const scanResults = {
      totalFiles: 1,
      vulnerabilities: vulnerabilities.map((vuln, index) => ({
        ...vuln,
        id: `snippet-${Date.now()}-${index + 1}`,
        file: filename || `snippet.${language || 'txt'}`
      })),
      summary: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        riskScore: 0
      },
      scanId: `snippet-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    // Calculate summary
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

    logger.info(`Snippet scan completed: ${scanResults.vulnerabilities.length} vulnerabilities found`);

    res.json({
      message: 'Code snippet scan completed',
      results: scanResults
    });

  } catch (error) {
    logger.error('Snippet scan error:', error);
    res.status(500).json({
      error: 'Scan Failed',
      message: 'Unable to scan code snippet'
    });
  }
});

// Get scan history (requires authentication)
router.get('/history', optionalAuth, (req, res) => {
  // This would typically fetch from a database
  // For now, return empty history
  res.json({
    message: 'Scan history retrieved',
    scans: [],
    total: 0
  });
});

export default router;