import React from 'react';

export default function Navbar({ isOnline = true, lastUpdated = null, systemTime = null, activeTab = 'dashboard', setActiveTab, alertsCount = 0 }) {
  const formatTime = (time) => {
    if (!time) return 'N/A';
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    },
    { 
      id: 'analytics', 
      label: 'Analytics',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      )
    },
    { 
      id: 'predictions', 
      label: 'Predictions',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    }
  ];

  return (
    <header className="navbar-header">
      <div className="navbar-content">
        {/* iOS-style Logo Group */}
        <div className="navbar-logo-group">
          <div style={{
            background: 'linear-gradient(149deg, var(--ios-system-blue) 0%, #0a84ff 100%)',
            width: '32px',
            height: '32px',
            borderRadius: '8px', // Apple squircle ratio
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(10, 132, 255, 0.3)',
            flexShrink: 0
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.05rem', 
              fontWeight: 700, 
              letterSpacing: '-0.02em', 
              color: 'var(--ios-label-primary)',
              lineHeight: 1.1
            }}>
              O₂ Sentinel
            </h1>
            <span style={{ 
              fontSize: '0.62rem', 
              color: 'var(--ios-label-tertiary)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.04em',
              fontWeight: 600
            }}>
              Environmental Monitoring
            </span>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <nav className="navbar-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`navbar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              <span className="navbar-nav-item-text">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* System Diagnostics panel (Visible only on desktop sidebar) */}
        <div className="navbar-diagnostics">
          <h4 className="navbar-diagnostics-title">System Diagnostics</h4>
          <div className="navbar-diagnostics-item">
            <span className="navbar-diagnostics-label">Uptime</span>
            <span className="navbar-diagnostics-value">99.98%</span>
          </div>
          <div className="navbar-diagnostics-item">
            <span className="navbar-diagnostics-label">Active Alerts</span>
            <span className={`navbar-diagnostics-value ${alertsCount > 0 ? 'alert-active' : ''}`}>
              {alertsCount}
            </span>
          </div>
          <div className="navbar-diagnostics-item">
            <span className="navbar-diagnostics-label">Calibration</span>
            <span className="navbar-diagnostics-value" style={{ color: 'var(--ios-system-blue)' }}>Nominal</span>
          </div>
        </div>

        {/* Info & Status Controls */}
        <div className="navbar-info-group">
          {/* iOS Clock / Sync Timestamp */}
          <div className="navbar-info-sync">
            <span className="navbar-info-label">Last Sync</span>
            <span className="navbar-info-value">
              {systemTime ? formatTime(systemTime) : (lastUpdated ? formatTime(lastUpdated) : 'Live')}
            </span>
          </div>

          {/* Separator (visible on mobile only) */}
          <div className="navbar-info-separator" />

          {/* iOS Pill Badge */}
          <div className="navbar-status-badge">
            <span 
              className="beacon-dot beacon-pulse" 
              style={{ 
                '--status-color': isOnline ? 'var(--ios-system-blue)' : 'var(--ios-system-red)',
                width: '6px',
                height: '6px'
              }}
            />
            <span className="navbar-status-text">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
