import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  FileText, 
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Copy,
  ExternalLink,
  Filter,
  Download
} from 'lucide-react';
import { useVulnerability } from '../context/VulnerabilityContext';

export default function Dashboard() {
  const { scanResults } = useVulnerability();
  const [selectedVulnerability, setSelectedVulnerability] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  if (!scanResults) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">No Scan Results</h2>
          <p className="text-gray-400 mb-8">Run a security scan to see your results here.</p>
          <a
            href="/scanner"
            className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
          >
            Start New Scan
          </a>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'High': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'Low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return <XCircle className="h-4 w-4" />;
      case 'High': return <AlertTriangle className="h-4 w-4" />;
      case 'Medium': return <AlertCircle className="h-4 w-4" />;
      case 'Low': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const filteredVulnerabilities = scanResults.vulnerabilities.filter(vuln => 
    severityFilter === 'all' || vuln.severity === severityFilter
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Security Dashboard</h1>
          <p className="text-lg text-gray-400">
            Comprehensive analysis of your code security
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Files Scanned</p>
                <p className="text-2xl font-bold text-white">{scanResults.totalFiles}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Vulnerabilities</p>
                <p className="text-2xl font-bold text-white">{scanResults.vulnerabilities.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Risk Score</p>
                <p className={`text-2xl font-bold ${getRiskScoreColor(scanResults.summary.riskScore)}`}>
                  {scanResults.summary.riskScore}/100
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Critical Issues</p>
                <p className="text-2xl font-bold text-red-400">{scanResults.summary.critical}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">Severity Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">{scanResults.summary.critical}</div>
              <div className="text-sm text-gray-400">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">{scanResults.summary.high}</div>
              <div className="text-sm text-gray-400">High</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">{scanResults.summary.medium}</div>
              <div className="text-sm text-gray-400">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{scanResults.summary.low}</div>
              <div className="text-sm text-gray-400">Low</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vulnerabilities List */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Vulnerabilities</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-gray-400" />
                      <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="all">All Severities</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <button className="flex items-center space-x-2 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors">
                      <Download className="h-4 w-4" />
                      <span className="text-sm">Export</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-white/20">
                {filteredVulnerabilities.map((vulnerability) => (
                  <div
                    key={vulnerability.id}
                    className={`p-6 cursor-pointer hover:bg-white/5 transition-colors ${
                      selectedVulnerability === vulnerability.id ? 'bg-white/10' : ''
                    }`}
                    onClick={() => setSelectedVulnerability(vulnerability.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(vulnerability.severity)}`}>
                            {getSeverityIcon(vulnerability.severity)}
                            <span className="ml-1">{vulnerability.severity}</span>
                          </span>
                          <h4 className="text-lg font-medium text-white">{vulnerability.type}</h4>
                        </div>
                        <p className="text-gray-400 mb-2">{vulnerability.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>📁 {vulnerability.file}</span>
                          <span>📍 Line {vulnerability.line}</span>
                        </div>
                      </div>
                      <ExternalLink className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vulnerability Details */}
          <div className="lg:col-span-1">
            {selectedVulnerability ? (
              (() => {
                const vuln = scanResults.vulnerabilities.find(v => v.id === selectedVulnerability);
                if (!vuln) return null;
                
                return (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 sticky top-24">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(vuln.severity)}`}>
                        {getSeverityIcon(vuln.severity)}
                        <span className="ml-1">{vuln.severity}</span>
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-semibold text-white mb-4">{vuln.type}</h4>
                    
                    <div className="space-y-6">
                      <div>
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Description</h5>
                        <p className="text-gray-400 text-sm">{vuln.description}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium text-gray-300">Vulnerable Code</h5>
                          <button
                            onClick={() => copyToClipboard(vuln.code)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="bg-black/40 rounded-lg p-3 border border-red-500/30">
                          <code className="text-red-300 text-sm">{vuln.code}</code>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Recommendation</h5>
                        <p className="text-gray-400 text-sm mb-3">{vuln.suggestion}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium text-gray-300">Secure Code</h5>
                          <button
                            onClick={() => copyToClipboard(vuln.fixedCode)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="bg-black/40 rounded-lg p-3 border border-green-500/30">
                          <code className="text-green-300 text-sm whitespace-pre-wrap">{vuln.fixedCode}</code>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-white mb-2">Select a Vulnerability</h4>
                <p className="text-gray-400 text-sm">
                  Click on a vulnerability from the list to see detailed information and remediation suggestions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}