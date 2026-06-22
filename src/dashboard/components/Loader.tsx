import React, { useEffect, useState } from 'react';

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing systems...');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Dynamic loading messages at different stages
    const getStatusMessage = (p: number) => {
      if (p < 25) return 'Initializing monitoring environment...';
      if (p < 50) return 'Connecting to sensor array...';
      if (p < 75) return 'Calibrating oxygen sensors...';
      if (p < 90) return 'Fetching telemetry history...';
      return 'Systems operational';
    };

    const interval = setInterval(() => {
      setProgress(prev => {
        // Increment randomly to feel like a real telemetry system connecting
        const increment = Math.floor(Math.random() * 6) + 6; // 6% to 11%
        const next = Math.min(100, prev + increment);
        setStatusText(getStatusMessage(next));
        
        if (next === 100) {
          clearInterval(interval);
          // Wait a moment for visual confirmation of 100% completion
          setTimeout(() => {
            setFadeOut(true);
            // Trigger complete after transition ends (500ms)
            setTimeout(() => {
              onComplete();
            }, 500);
          }, 300);
        }
        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`loader-overlay ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loader-container">
        <div className="loader-logo-wrapper">
          <div className="loader-logo-ring"></div>
          <div className="loader-logo-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
        </div>
        
        <h1 className="loader-title">O₂ Sentinel</h1>
        <p className="loader-subtitle">Environmental Monitoring Dashboard</p>
        
        <div className="loader-progress-track">
          <div className="loader-progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        
        <div className="loader-status-text">
          {statusText} <span style={{ fontWeight: 600, color: 'var(--ios-system-blue)' }}>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
