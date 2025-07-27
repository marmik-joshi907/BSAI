import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Code, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  Upload,
  Github,
  Zap,
  Eye,
  BookOpen
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Multi-Format Support",
      description: "Upload HTML, JavaScript, PHP, Python, and more. Or connect directly to GitHub repositories."
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Smart Detection",
      description: "Advanced algorithms detect SQL injection, XSS, hardcoded secrets, and authentication flaws."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI-Powered Insights",
      description: "Get natural language explanations and contextual suggestions for secure coding."
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Educational Focus",
      description: "Perfect for students and teams learning secure development practices."
    }
  ];

  const vulnerabilityTypes = [
    { name: "SQL Injection", severity: "Critical", count: "147" },
    { name: "Cross-Site Scripting (XSS)", severity: "High", count: "89" },
    { name: "Hardcoded Secrets", severity: "High", count: "56" },
    { name: "Insecure Authentication", severity: "Medium", count: "34" },
    { name: "CSRF Vulnerabilities", severity: "Medium", count: "23" },
    { name: "Path Traversal", severity: "Low", count: "12" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Shield className="h-20 w-20 text-orange-400 animate-pulse" />
                <div className="absolute inset-0 bg-orange-400/20 rounded-full animate-ping"></div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                BugShield AI
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Smart Vulnerability Detector for Web Projects
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Detect and fix security vulnerabilities before they become threats. 
              Upload your code or connect GitHub repositories for comprehensive security analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/scanner"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Scanning
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Comprehensive Security Analysis
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Advanced vulnerability detection powered by AI to keep your applications secure
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-orange-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vulnerability Types Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What We Detect
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Comprehensive coverage of common web security vulnerabilities
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vulnerabilityTypes.map((vuln, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{vuln.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      vuln.severity === 'Critical'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : vuln.severity === 'High'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : vuln.severity === 'Medium'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {vuln.severity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Detected instances</span>
                  <span className="text-2xl font-bold text-orange-400">{vuln.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/30">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Secure Your Code?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Join thousands of developers who trust BugShield AI to keep their applications secure
            </p>
            <Link
              to="/scanner"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Your First Scan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center items-center mb-4">
            <Shield className="h-6 w-6 text-orange-400 mr-2" />
            <span className="text-lg font-semibold text-white">BugShield AI</span>
          </div>
          <p className="text-gray-400">
            Making web development more secure, one scan at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}