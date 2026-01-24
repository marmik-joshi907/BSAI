//  Edit by kush for print history
const BACKEND_URL = "http://localhost:8000";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Shield,
  FileText,
  TrendingUp,
  XCircle,
  AlertCircle,
  Info,
  Copy,
  ExternalLink,
  Filter,
  Download,
} from "lucide-react";
import { useVulnerability } from "../context/VulnerabilityContext";

export default function Dashboard() {
  const { scanResults } = useVulnerability();

  // 🔹 ADDED BY ME (history support)
  const [history, setHistory] = useState<any[]>([]);
  const [selectedScan, setSelectedScan] = useState<any>(null);

  const [selectedVulnerability, setSelectedVulnerability] = useState<
    string | null
  >(null);
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  // 🔹 FETCH HISTORY FROM BACKEND (ADDED)
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/scans/history`)
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
        if (!scanResults && data.length > 0) {
          setSelectedScan(data[0]); // default to latest scan
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // 🔹 Decide which scan to show (current OR history)
  const activeScan = scanResults || selectedScan;

  if (!activeScan) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            No Scan Results
          </h2>
          <p className="text-gray-400 mb-8">
            Run a security scan to see your results here.
          </p>
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
      case "Critical":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      case "High":
        return "text-orange-400 bg-orange-500/20 border-orange-500/30";
      case "Medium":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "Low":
        return "text-blue-400 bg-blue-500/20 border-blue-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Critical":
        return <XCircle className="h-4 w-4" />;
      case "High":
        return <AlertTriangle className="h-4 w-4" />;
      case "Medium":
        return <AlertCircle className="h-4 w-4" />;
      case "Low":
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return "text-red-400";
    if (score >= 60) return "text-orange-400";
    if (score >= 40) return "text-yellow-400";
    return "text-green-400";
  };

  const filteredVulnerabilities = activeScan.vulnerabilities.filter(
    (vuln: any) => severityFilter === "all" || vuln.severity === severityFilter,
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // 🔽 Download Scan Report (JSON)
  const downloadReport = () => {
    const data = activeScan;
    if (!data) return;

    const fileData = JSON.stringify(data, null, 2);
    const blob = new Blob([fileData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `BugShield_Report_${new Date().toISOString()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 🔹 SCAN HISTORY SECTION (ADDED) */}
        {history.length > 0 && (
          <div className="mb-8 bg-white/10 rounded-xl p-4 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Scan History
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {history.map((scan) => (
                <button
                  key={scan._id}
                  onClick={() => {
                    setSelectedScan(scan);
                    setSelectedVulnerability(null);
                  }}
                  className="text-left p-3 bg-black/30 hover:bg-black/50 rounded-lg border border-white/10"
                >
                  <p className="text-white font-medium">{scan.file_name}</p>
                  <p className="text-sm text-gray-400">
                    Issues: {scan.total_issues}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(scan.scan_date).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* EVERYTHING BELOW IS YOUR ORIGINAL UI (UNCHANGED) */}

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Security Dashboard
          </h1>
          <p className="text-lg text-gray-400">
            Comprehensive analysis of your code security
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <p className="text-gray-400 text-sm">Files Scanned</p>
            <p className="text-2xl font-bold text-white">
              {activeScan.totalFiles}
            </p>
          </div>

          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <p className="text-gray-400 text-sm">Vulnerabilities</p>
            <p className="text-2xl font-bold text-white">
              {activeScan.vulnerabilities.length}
            </p>
          </div>

          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <p className="text-gray-400 text-sm">Risk Score</p>
            <p
              className={`text-2xl font-bold ${getRiskScoreColor(activeScan.summary.riskScore)}`}
            >
              {activeScan.summary.riskScore}/100
            </p>
          </div>

          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <p className="text-gray-400 text-sm">Critical Issues</p>
            <p className="text-2xl font-bold text-red-400">
              {activeScan.summary.critical}
            </p>
          </div>
        </div>

        {/* Vulnerabilities List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/10 rounded-xl border border-white/20">
              {/* 🔽 HEADER WITH DOWNLOAD BUTTON */}
              <div className="p-6 border-b border-white/20 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  Vulnerabilities
                </h3>

                {/* ⭐ DOWNLOAD BUTTON ⭐ */}
                <button
                  onClick={downloadReport}
                  className="flex items-center space-x-2 px-3 py-1 
                     bg-orange-500/20 text-orange-400 
                     rounded-lg hover:bg-orange-500/30 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm">Download Report</span>
                </button>
              </div>

              {/* EXISTING LIST */}
              <div className="divide-y divide-white/20">
                {filteredVulnerabilities.map((vuln: any) => (
                  <div
                    key={vuln.id}
                    className="p-6 cursor-pointer hover:bg-white/5"
                    onClick={() => setSelectedVulnerability(vuln.id)}
                  >
                    <h4 className="text-lg font-medium text-white">
                      {vuln.type}
                    </h4>
                    <p className="text-gray-400">{vuln.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE PANEL */}
            <div className="lg:col-span-1 bg-white/10 p-6 rounded-xl border border-white/20">
              <p className="text-gray-400">
                Select a vulnerability to view details
              </p>
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1 bg-white/10 p-6 rounded-xl border border-white/20">
            <p className="text-gray-400">
              Select a vulnerability to view details
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
