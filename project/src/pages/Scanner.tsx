import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Github, 
  FileText, 
  Code, 
  AlertCircle,
  CheckCircle,
  Loader2,
  X
} from 'lucide-react';
import { useVulnerability } from '../context/VulnerabilityContext';

export default function Scanner() {
  const navigate = useNavigate();
  const { setScanResults } = useVulnerability();
  const [isScanning, setIsScanning] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [githubUrl, setGithubUrl] = useState('');
  const [scanMode, setScanMode] = useState<'upload' | 'github'>('upload');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleScan = async () => {
    setIsScanning(true);
    
    // Simulate scanning process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock scan results
    const mockResults = {
      totalFiles: scanMode === 'upload' ? uploadedFiles.length : 15,
      vulnerabilities: [
        {
          id: '1',
          type: 'SQL Injection',
          severity: 'Critical' as const,
          file: 'login.php',
          line: 42,
          description: 'Direct user input is passed to SQL query without sanitization',
          code: `$query = "SELECT * FROM users WHERE username = '" . $_POST['username'] . "' AND password = '" . $_POST['password'] . "'";`,
          suggestion: 'Use prepared statements to prevent SQL injection attacks',
          fixedCode: `$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
$stmt->execute([$_POST['username'], hash('sha256', $_POST['password'])]);`
        },
        {
          id: '2',
          type: 'Cross-Site Scripting (XSS)',
          severity: 'High' as const,
          file: 'profile.html',
          line: 28,
          description: 'User input is displayed without proper encoding',
          code: `<h2>Welcome, ${username}!</h2>`,
          suggestion: 'Always encode user input before displaying in HTML',
          fixedCode: `<h2>Welcome, <%= escapeHtml(username) %>!</h2>`
        },
        {
          id: '3',
          type: 'Hardcoded Secret',
          severity: 'High' as const,
          file: 'config.js',
          line: 15,
          description: 'API key is hardcoded in source code',
          code: `const API_KEY = "sk-1234567890abcdef";`,
          suggestion: 'Store secrets in environment variables',
          fixedCode: `const API_KEY = process.env.API_KEY || '';`
        },
        {
          id: '4',
          type: 'Insecure Authentication',
          severity: 'Medium' as const,
          file: 'auth.py',
          line: 67,
          description: 'Password stored without proper hashing',
          code: `user.password = request.form['password']`,
          suggestion: 'Use bcrypt or similar to hash passwords',
          fixedCode: `user.password = bcrypt.hashpw(request.form['password'].encode('utf-8'), bcrypt.gensalt())`
        }
      ],
      summary: {
        critical: 1,
        high: 2,
        medium: 1,
        low: 0,
        riskScore: 85
      }
    };

    setScanResults(mockResults);
    setIsScanning(false);
    navigate('/dashboard');
  };

  const supportedFormats = [
    { ext: '.html', icon: <FileText className="h-4 w-4" />, name: 'HTML' },
    { ext: '.js', icon: <Code className="h-4 w-4" />, name: 'JavaScript' },
    { ext: '.php', icon: <Code className="h-4 w-4" />, name: 'PHP' },
    { ext: '.py', icon: <Code className="h-4 w-4" />, name: 'Python' },
    { ext: '.jsx', icon: <Code className="h-4 w-4" />, name: 'React' },
    { ext: '.ts', icon: <Code className="h-4 w-4" />, name: 'TypeScript' }
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Security Scanner</h1>
          <p className="text-lg text-gray-400">
            Upload your code files or connect a GitHub repository to scan for vulnerabilities
          </p>
        </div>

        {/* Scan Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
            <button
              onClick={() => setScanMode('upload')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                scanMode === 'upload'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Upload Files
            </button>
            <button
              onClick={() => setScanMode('github')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                scanMode === 'github'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Github className="h-4 w-4 inline mr-2" />
              GitHub Repository
            </button>
          </div>
        </div>

        {scanMode === 'upload' ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-8">
            <div className="text-center">
              <div className="border-2 border-dashed border-gray-400 rounded-lg p-12 hover:border-orange-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Upload Your Code Files</h3>
                <p className="text-gray-400 mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept=".html,.js,.jsx,.ts,.tsx,.php,.py,.css,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg cursor-pointer transition-colors"
                >
                  Choose Files
                </label>
              </div>
            </div>

            {/* Supported Formats */}
            <div className="mt-6">
              <p className="text-sm text-gray-400 mb-3">Supported formats:</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {supportedFormats.map((format, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-white/5 rounded-lg p-2 border border-white/10"
                  >
                    <span className="text-orange-400">{format.icon}</span>
                    <span className="text-xs text-gray-300">{format.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-white mb-3">Uploaded Files:</h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-orange-400" />
                        <span className="text-gray-300">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-8">
            <div className="text-center mb-6">
              <Github className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Connect GitHub Repository</h3>
              <p className="text-gray-400">
                Enter the URL of your GitHub repository to scan
              </p>
            </div>
            <div className="max-w-md mx-auto">
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Scan Button */}
        <div className="text-center">
          <button
            onClick={handleScan}
            disabled={
              isScanning || 
              (scanMode === 'upload' && uploadedFiles.length === 0) ||
              (scanMode === 'github' && !githubUrl.trim())
            }
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 mr-2" />
                Start Security Scan
              </>
            )}
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-blue-500/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-6 w-6 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-white font-medium mb-2">Privacy & Security</h4>
              <p className="text-blue-200 text-sm">
                Your code is processed securely and is never stored on our servers. 
                All analysis happens in real-time and results are only visible to you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}