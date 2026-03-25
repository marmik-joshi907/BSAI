import React, { useState } from "react";
import {
  Upload,
  Zap,
  Check,
  AlertTriangle,
  FileCode,
  ArrowRight,
  Loader2,
} from "lucide-react";

type Suggestion = {
  type: string;
  message: string;
};

type Metrics = {
  original_complexity: string;
  optimized_complexity: string;
  improvement_score: string;
};

const CodeOptimizer = () => {
  const [code, setCode] = useState("");
  const [optimizedCode, setOptimizedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;

      setCode(text);
      setOptimizedCode("");
      setSuggestions([]);
      setMetrics(null);
    };

    reader.readAsText(file);
  };

  const detectLanguage = () => {
    if (fileName.endsWith(".py")) return "python";
    if (fileName.endsWith(".ts")) return "typescript";
    if (fileName.endsWith(".jsx")) return "javascript";
    if (fileName.endsWith(".tsx")) return "typescript";
    return "javascript";
  };

  const handleOptimize = async () => {
    if (!code.trim()) return;

    setLoading(true);

    setOptimizedCode("");
    setSuggestions([]);
    setMetrics(null);

    try {
      const language = detectLanguage();

      const response = await fetch("http://localhost:8000/api/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      console.log("API RESPONSE:", data);

      if (data?.success && data?.data) {
        setOptimizedCode(data.data.optimized_code || "");
        setSuggestions(data.data.suggestions || []);
        setMetrics(data.data.metrics || null);
      } else {
        console.error("Invalid response format");
      }
    } catch (error) {
      console.error("Optimization failed:", error);
      alert("Optimization failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-white min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
          AI Code Optimizer
        </h1>
        <p className="text-gray-400">
          Upload your code and let our AI improve security, performance and
          coding practices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* INPUT PANEL */}

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileCode className="text-cyan-400" />
              Source Code
            </h2>

            <div className="relative">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                accept=".js,.ts,.py,.jsx,.tsx"
              />

              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <Upload size={16} />
                Upload File
              </label>
            </div>
          </div>

          <textarea
            className="w-full h-96 bg-slate-900 border border-slate-700 rounded-xl p-4 font-mono text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste your code here or upload file"
          />

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleOptimize}
              disabled={loading || !code}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                loading || !code
                  ? "bg-slate-700 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Zap />
                  Optimize Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* OUTPUT PANEL */}

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Check className="text-green-400" />
            Optimized Result
          </h2>

          {optimizedCode ? (
            <>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 font-mono text-sm text-green-300 h-96 overflow-auto mb-4">
                <pre>{optimizedCode}</pre>
              </div>

              {metrics && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-400">Complexity</div>
                    <div className="text-lg font-bold text-yellow-400">
                      {metrics.original_complexity}
                      <ArrowRight className="inline w-3 h-3 mx-1" />
                      {metrics.optimized_complexity}
                    </div>
                  </div>

                  <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-400">Improvement</div>
                    <div className="text-lg font-bold text-green-400">
                      {metrics.improvement_score}
                    </div>
                  </div>

                  <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-400">Suggestions</div>
                    <div className="text-lg font-bold text-cyan-400">
                      {suggestions.length}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-slate-700/20 p-3 rounded-lg border border-slate-700"
                  >
                    {s.type === "security" ? (
                      <AlertTriangle className="text-red-400 mt-1" size={16} />
                    ) : (
                      <Zap className="text-yellow-400 mt-1" size={16} />
                    )}

                    <div>
                      <div className="text-sm font-medium text-gray-200 capitalize">
                        {s.type} Suggestion
                      </div>

                      <div className="text-xs text-gray-400">{s.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-slate-700 rounded-xl">
              <Zap size={48} className="mb-4 opacity-20" />
              <p>Optimized code will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeOptimizer;
