import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Generate vulnerability report
router.post('/generate', optionalAuth, async (req, res) => {
  try {
    const { scanResults, format = 'json' } = req.body;

    if (!scanResults) {
      return res.status(400).json({
        error: 'Missing Scan Results',
        message: 'Please provide scan results to generate a report'
      });
    }

    logger.info(`Generating ${format} report for scan ${scanResults.scanId}`);

    const report = {
      metadata: {
        reportId: `report-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        scanId: scanResults.scanId,
        format: format.toUpperCase()
      },
      executive_summary: {
        total_files_scanned: scanResults.totalFiles,
        total_vulnerabilities: scanResults.vulnerabilities.length,
        risk_score: scanResults.summary.riskScore,
        severity_breakdown: {
          critical: scanResults.summary.critical,
          high: scanResults.summary.high,
          medium: scanResults.summary.medium,
          low: scanResults.summary.low
        }
      },
      detailed_findings: scanResults.vulnerabilities.map(vuln => ({
        id: vuln.id,
        type: vuln.type,
        severity: vuln.severity,
        file: vuln.file,
        line: vuln.line,
        description: vuln.description,
        vulnerable_code: vuln.code,
        recommendation: vuln.suggestion,
        secure_code_example: vuln.fixedCode
      })),
      recommendations: generateRecommendations(scanResults),
      compliance_notes: generateComplianceNotes(scanResults)
    };

    // Format-specific processing
    if (format.toLowerCase() === 'csv') {
      const csvData = generateCSVReport(report);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="security-report-${report.metadata.reportId}.csv"`);
      return res.send(csvData);
    }

    if (format.toLowerCase() === 'html') {
      const htmlReport = generateHTMLReport(report);
      res.setHeader('Content-Type', 'text/html');
      return res.send(htmlReport);
    }

    // Default JSON format
    res.json({
      message: 'Report generated successfully',
      report
    });

  } catch (error) {
    logger.error('Report generation error:', error);
    res.status(500).json({
      error: 'Report Generation Failed',
      message: 'Unable to generate vulnerability report'
    });
  }
});

// Helper function to generate recommendations
const generateRecommendations = (scanResults) => {
  const recommendations = [];

  if (scanResults.summary.critical > 0) {
    recommendations.push({
      priority: 'Critical',
      action: 'Immediately address all critical vulnerabilities before deploying to production',
      impact: 'Critical vulnerabilities can lead to complete system compromise'
    });
  }

  if (scanResults.summary.high > 0) {
    recommendations.push({
      priority: 'High',
      action: 'Address high-severity vulnerabilities within 24-48 hours',
      impact: 'High-severity issues can lead to data breaches and unauthorized access'
    });
  }

  if (scanResults.vulnerabilities.some(v => v.type.includes('SQL Injection'))) {
    recommendations.push({
      priority: 'High',
      action: 'Implement parameterized queries and input validation',
      impact: 'SQL injection can lead to database compromise and data theft'
    });
  }

  if (scanResults.vulnerabilities.some(v => v.type.includes('XSS'))) {
    recommendations.push({
      priority: 'High',
      action: 'Implement proper output encoding and Content Security Policy',
      impact: 'XSS attacks can steal user sessions and sensitive data'
    });
  }

  return recommendations;
};

// Helper function to generate compliance notes
const generateComplianceNotes = (scanResults) => {
  const notes = [];

  if (scanResults.summary.critical > 0 || scanResults.summary.high > 0) {
    notes.push({
      standard: 'OWASP Top 10',
      note: 'Critical and high-severity vulnerabilities may violate OWASP security guidelines'
    });
  }

  if (scanResults.vulnerabilities.some(v => v.type.includes('Hardcoded Secret'))) {
    notes.push({
      standard: 'PCI DSS',
      note: 'Hardcoded secrets violate PCI DSS requirements for secure key management'
    });
  }

  return notes;
};

// Helper function to generate CSV report
const generateCSVReport = (report) => {
  const headers = ['ID', 'Type', 'Severity', 'File', 'Line', 'Description', 'Recommendation'];
  const rows = [headers.join(',')];

  report.detailed_findings.forEach(finding => {
    const row = [
      finding.id,
      `"${finding.type}"`,
      finding.severity,
      `"${finding.file}"`,
      finding.line,
      `"${finding.description.replace(/"/g, '""')}"`,
      `"${finding.recommendation.replace(/"/g, '""')}"`
    ];
    rows.push(row.join(','));
  });

  return rows.join('\n');
};

// Helper function to generate HTML report
const generateHTMLReport = (report) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BugShield AI Security Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
        .critical { color: #dc3545; }
        .high { color: #fd7e14; }
        .medium { color: #ffc107; }
        .low { color: #17a2b8; }
        .vulnerability { border: 1px solid #ddd; margin-bottom: 20px; border-radius: 6px; }
        .vuln-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #ddd; }
        .vuln-content { padding: 15px; }
        .code-block { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
        .recommendations { background: #e7f3ff; padding: 20px; border-radius: 6px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ BugShield AI Security Report</h1>
            <p>Generated on ${new Date(report.metadata.generatedAt).toLocaleString()}</p>
            <p>Report ID: ${report.metadata.reportId}</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Files Scanned</h3>
                <div style="font-size: 2em; font-weight: bold;">${report.executive_summary.total_files_scanned}</div>
            </div>
            <div class="summary-card">
                <h3>Vulnerabilities</h3>
                <div style="font-size: 2em; font-weight: bold;">${report.executive_summary.total_vulnerabilities}</div>
            </div>
            <div class="summary-card">
                <h3>Risk Score</h3>
                <div style="font-size: 2em; font-weight: bold; color: ${report.executive_summary.risk_score >= 80 ? '#dc3545' : report.executive_summary.risk_score >= 60 ? '#fd7e14' : '#28a745'};">${report.executive_summary.risk_score}/100</div>
            </div>
        </div>

        <h2>Severity Breakdown</h2>
        <div class="summary">
            <div class="summary-card critical">
                <h4>Critical</h4>
                <div style="font-size: 1.5em; font-weight: bold;">${report.executive_summary.severity_breakdown.critical}</div>
            </div>
            <div class="summary-card high">
                <h4>High</h4>
                <div style="font-size: 1.5em; font-weight: bold;">${report.executive_summary.severity_breakdown.high}</div>
            </div>
            <div class="summary-card medium">
                <h4>Medium</h4>
                <div style="font-size: 1.5em; font-weight: bold;">${report.executive_summary.severity_breakdown.medium}</div>
            </div>
            <div class="summary-card low">
                <h4>Low</h4>
                <div style="font-size: 1.5em; font-weight: bold;">${report.executive_summary.severity_breakdown.low}</div>
            </div>
        </div>

        <h2>Detailed Findings</h2>
        ${report.detailed_findings.map(finding => `
            <div class="vulnerability">
                <div class="vuln-header">
                    <h3>${finding.type} <span class="${finding.severity.toLowerCase()}">[${finding.severity}]</span></h3>
                    <p><strong>File:</strong> ${finding.file} <strong>Line:</strong> ${finding.line}</p>
                </div>
                <div class="vuln-content">
                    <p><strong>Description:</strong> ${finding.description}</p>
                    <p><strong>Vulnerable Code:</strong></p>
                    <div class="code-block">${finding.vulnerable_code}</div>
                    <p><strong>Recommendation:</strong> ${finding.recommendation}</p>
                    <p><strong>Secure Code Example:</strong></p>
                    <div class="code-block">${finding.secure_code_example}</div>
                </div>
            </div>
        `).join('')}

        <div class="recommendations">
            <h2>Recommendations</h2>
            ${report.recommendations.map(rec => `
                <div style="margin-bottom: 15px;">
                    <h4 class="${rec.priority.toLowerCase()}">${rec.priority} Priority</h4>
                    <p><strong>Action:</strong> ${rec.action}</p>
                    <p><strong>Impact:</strong> ${rec.impact}</p>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
};

export default router;