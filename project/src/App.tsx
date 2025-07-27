import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import Scanner from './pages/Scanner';
import Dashboard from './pages/Dashboard';
import { VulnerabilityProvider } from './context/VulnerabilityContext';

function App() {
  return (
    <VulnerabilityProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          <Header />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </VulnerabilityProvider>
  );
}

export default App;