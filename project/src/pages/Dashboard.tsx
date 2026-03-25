// https://github.com/OWASP/WebGoat
const BACKEND_URL = "http://localhost:8000";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Shield,
  XCircle,
  AlertCircle,
  Info,
  Download,
} from "lucide-react";
import { useVulnerability } from "../context/VulnerabilityContext";

export default function Dashboard() {
  const { scanResults } = useVulnerability();

  const [history, setHistory] = useState<any[]>([]);
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [selectedVulnerability, setSelectedVulnerability] =
    useState<any>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/scans/history`)
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
        if (!scanResults && data.length > 0) {
          setSelectedScan(data[0]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const activeScan = scanResults || selectedScan;

  if (!activeScan) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <Shield className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold">No Scan Results</h2>
      </div>
    );
  }

  // ✅ Calculate risk score dynamically
const total = activeScan.total_issues;

let riskScore = 100;

if (total > 0) {
  const severityWeight =
    activeScan.summary.critical * 4 +
    activeScan.summary.high * 3 +
    activeScan.summary.medium * 2 +
    activeScan.summary.low * 1;

  riskScore = 100 - (severityWeight / total) * 10;
}

riskScore = Math.max(0, Math.min(100, riskScore));

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Critical":
        return <XCircle className="h-4 w-4 text-red-400" />;
      case "High":
        return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      case "Medium":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const filteredVulnerabilities =
    activeScan.vulnerabilities.filter(
      (v: any) => severityFilter === "all" || v.severity === severityFilter
    );

  const downloadReport = () => {
    const blob = new Blob([JSON.stringify(activeScan, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BugShield_Report_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-8 px-6 text-white">
      {/* History */}
      {history.length > 0 && (
        <div className="mb-8 bg-white/10 p-4 rounded-xl">
          <h3 className="mb-4 font-semibold">Scan History</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {history.map((scan) => (
              <button
                key={scan._id}
                onClick={() => {
                  setSelectedScan(scan);
                  setSelectedVulnerability(null);
                }}
                className="p-3 bg-black/30 rounded-lg text-left"
              >
                <p>{scan.file_name}</p>
                <p className="text-sm text-gray-400">
                  Issues: {scan.total_issues}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 p-6 rounded-xl">
          <p className="text-gray-400 text-sm">Files Scanned</p>
          <p className="text-2xl font-bold">1</p>
        </div>

        <div className="bg-white/10 p-6 rounded-xl">
          <p className="text-gray-400 text-sm">Vulnerabilities</p>
          <p className="text-2xl font-bold">
            {activeScan.total_issues}
          </p>
        </div>

        <div className="bg-white/10 p-6 rounded-xl">
          <p className="text-gray-400 text-sm">Risk Score</p>
          <p className="text-2xl font-bold text-red-400">
            {riskScore}/100
          </p>
        </div>

        <div className="bg-white/10 p-6 rounded-xl">
          <p className="text-gray-400 text-sm">Critical Issues</p>
          <p className="text-2xl font-bold text-red-400">
            {activeScan.summary.critical}
          </p>
        </div>
      </div>

      {/* Vulnerability List */}
      <div className="bg-white/10 rounded-xl p-6">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-semibold">Vulnerabilities</h3>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 rounded-lg"
          >
            <Download size={16} />
            Download Report
          </button>
        </div>

        {filteredVulnerabilities.length === 0 ? (
          <p className="text-gray-400">No vulnerabilities found.</p>
        ) : (
          filteredVulnerabilities.map((vuln: any, index: number) => (
            <div
              key={index}
              className="p-4 bg-black/30 rounded-lg mb-4"
            >
              <div className="flex items-center gap-2 mb-2">
                {getSeverityIcon(vuln.severity)}
                <h4 className="font-semibold">{vuln.type}</h4>
              </div>
              <p className="text-sm text-gray-400">
                Line: {vuln.line}
              </p>
              <p className="text-sm text-gray-400">
                {vuln.message}
              </p>
              <pre className="text-xs bg-black/50 p-2 mt-2 rounded">
                {vuln.code}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}