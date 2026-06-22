import React, { useState, useEffect } from 'react';
import Navbar from './dashboard/components/Navbar';
import StatusCard from './dashboard/components/StatusCard';
import TrendChart from './dashboard/components/TrendChart';
import PredictionChart from './dashboard/components/PredictionChart';
import Loader from './dashboard/components/Loader';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'predictions'>('dashboard');
  const [systemTime, setSystemTime] = useState<Date>(new Date());
  
  // Telemetry simulation states (Atmospheric O2 values, standard temp, humidity)
  const [oxygen, setOxygen] = useState(20.8);
  const [temperature, setTemperature] = useState(25.5);
  const [humidity, setHumidity] = useState(48.1);
  const [mockAnomaly, setMockAnomaly] = useState(false);

  // Telemetry history states for live graphing (pre-populated with realistic atmospheric values)
  const [oxygenHistory, setOxygenHistory] = useState<number[]>(() => 
    Array.from({ length: 15 }, () => 20.6 + Math.random() * 0.3)
  );
  const [tempHistory, setTempHistory] = useState<number[]>(() => 
    Array.from({ length: 15 }, () => 25.1 + Math.random() * 0.6)
  );
  const [humidityHistory, setHumidityHistory] = useState<number[]>(() => 
    Array.from({ length: 15 }, () => 47.5 + Math.random() * 1.0)
  );

  // System clock timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Telemetry simulation loop (runs continuously in online state with 10s intervals mock update)
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      if (mockAnomaly) {
        // Drift smoothly to warning/danger zone values
        setOxygen(prev => Math.max(19.1, prev - 0.12));
        setTemperature(prev => Math.min(36.8, prev + 0.6));
        setHumidity(prev => Math.min(67.5, prev + 0.9));
      } else {
        // Drift towards normal nominal values
        setOxygen(prev => {
          if (prev < 20.4) return prev + 0.15;
          const delta = (Math.random() - 0.5) * 0.08;
          const next = prev + delta;
          return Math.max(20.4, Math.min(21.0, next));
        });
        setTemperature(prev => {
          if (prev > 26.2) return prev - 0.5;
          const delta = (Math.random() - 0.5) * 0.2;
          const next = prev + delta;
          return Math.max(24.8, Math.min(26.2, next));
        });
        setHumidity(prev => {
          if (prev > 49.2) return prev - 0.8;
          const delta = (Math.random() - 0.5) * 0.4;
          const next = prev + delta;
          return Math.max(47.0, Math.min(49.2, next));
        });
      }
    }, 1500); // simulation tick rate

    return () => clearInterval(simulationInterval);
  }, [mockAnomaly]);

  // Sync historical buffers
  useEffect(() => {
    setOxygenHistory(prev => [...prev.slice(1), oxygen]);
    setTempHistory(prev => [...prev.slice(1), temperature]);
    setHumidityHistory(prev => [...prev.slice(1), humidity]);
  }, [oxygen, temperature, humidity]);

  // Determine individual status flags
  const getOxygenStatus = () => {
    if (oxygen >= 19.5 && oxygen <= 23.5) return 'normal';
    return 'danger';
  };

  const getTemperatureStatus = () => {
    if (temperature <= 28) return 'normal';
    if (temperature <= 35) return 'warning';
    return 'danger';
  };

  const getHumidityStatus = () => {
    if (humidity <= 55) return 'normal';
    if (humidity <= 65) return 'warning';
    return 'danger';
  };

  // Determine aggregate overall safety status
  const getOverallStatus = () => {
    const o2 = getOxygenStatus();
    const temp = getTemperatureStatus();
    const hum = getHumidityStatus();

    if (o2 === 'danger' || temp === 'danger' || hum === 'danger') return 'danger';
    if (o2 === 'warning' || temp === 'warning' || hum === 'warning') return 'warning';
    return 'normal';
  };

  const overallStatus = getOverallStatus();

  // Predict Oxygen Values (Targeting Current: 20.8%, 30m: 20.7%, 60m: 20.5%)
  const getOxygenPredictions = () => {
    const pred30 = 20.7;
    const pred1h = 20.5;
    
    // Project points drifting from current oxygen down to pred1h
    const proj = Array.from({ length: 15 }, (_, i) => {
      const t = i / 14;
      const val = oxygen + (pred1h - oxygen) * t;
      const noise = (Math.random() - 0.5) * 0.02 * Math.sin(t * Math.PI);
      return Math.max(20.0, val + noise);
    });

    return { pred30, pred1h, projection: proj };
  };

  const { pred30: predO2_30m, pred1h: predO2_1h, projection: o2Projection } = getOxygenPredictions();

  // System Diagnostics logs
  const [logs, setLogs] = useState<string[]>(() => {
    const now = new Date();
    const format = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return [
      `[${format(new Date(now.getTime() - 20000))}] Telemetry core initialized.`,
      `[${format(new Date(now.getTime() - 15000))}] Calibrating Oxygen sensor array...`,
      `[${format(new Date(now.getTime() - 10000))}] Sensors calibrated: Oxygen 20.8%, Temp 25.5°C, Hum 48.1%.`,
      `[${format(new Date(now.getTime() - 5000))}] Telemetry link established. Status nominal.`
    ];
  });

  // Log updater loop
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let alertMsg = '';
    if (oxygen < 19.5) alertMsg = ` [ALERT] Oxygen level low: ${oxygen.toFixed(1)}%!`;
    else if (oxygen > 23.5) alertMsg = ` [ALERT] Oxygen level high: ${oxygen.toFixed(1)}%!`;
    else if (temperature > 28) alertMsg = ` [ALERT] High thermal load: ${temperature.toFixed(1)}°C!`;
    else if (humidity > 55) alertMsg = ` [ALERT] Elevated moisture: ${humidity.toFixed(1)}%!`;

    const updateMessage = alertMsg 
      ? `[${timestamp}]${alertMsg}`
      : `[${timestamp}] Sync check: O₂ ${oxygen.toFixed(1)}% | Temp ${temperature.toFixed(1)}°C | Hum ${humidity.toFixed(1)}%`;
      
    setLogs(prev => [...prev.slice(-14), updateMessage]);
  }, [oxygen, temperature, humidity]);

  const getAlertState = () => {
    if (oxygen < 19.5) {
      return { level: 'danger', message: `CRITICAL: Atmospheric Oxygen level is dangerously low (${oxygen.toFixed(1)}%). Evacuate area immediately!` };
    }
    if (oxygen > 23.5) {
      return { level: 'danger', message: `CRITICAL: Atmospheric Oxygen level is dangerously high (${oxygen.toFixed(1)}%). Fire hazard risk!` };
    }
    if (temperature > 35) {
      return { level: 'danger', message: `CRITICAL: Temperature exceeds safety limits (${temperature.toFixed(1)}°C). Immediate thermal hazard!` };
    }
    if (humidity > 65) {
      return { level: 'danger', message: `CRITICAL: Relative Humidity exceeds safety limits (${humidity.toFixed(1)}%). System moisture damage risk!` };
    }
    if (temperature > 28) {
      return { level: 'warning', message: `WARNING: Ambient temperature is elevated (${temperature.toFixed(1)}°C). Check cooling systems.` };
    }
    if (humidity > 55) {
      return { level: 'warning', message: `WARNING: Relative Humidity is elevated (${humidity.toFixed(1)}%). Verify dehumidifier link.` };
    }
    return null;
  };
  
  const activeAlert = getAlertState();

  // Helper colors for trend graphs (scientific blue standard)
  const getTrendColor = (status: 'normal' | 'warning' | 'danger') => {
    if (status === 'normal') return 'var(--ios-system-blue)';
    if (status === 'warning') return 'var(--ios-system-orange)';
    return 'var(--ios-system-red)';
  };

  return (
    <div className="app-layout">
      {loading && <Loader onComplete={() => setLoading(false)} />}
      <Navbar 
        isOnline={true} 
        systemTime={systemTime} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertsCount={activeAlert ? 1 : 0}
      />
      
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px 16px' }}>
        
        {/* Alert Banner */}
        {activeAlert && (
          <div className={`alert-banner alert-${activeAlert.level}`} style={{
            padding: '12px 18px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'pulse-glow 2.5s infinite',
            fontSize: '0.86rem',
            fontWeight: 600
          }}>
            <span style={{ fontSize: '1.1rem' }}>
              {activeAlert.level === 'danger' ? '🚨' : '⚠️'}
            </span>
            <span style={{ flex: 1 }}>{activeAlert.message}</span>
          </div>
        )}

        {/* iOS Title Area */}
        <div style={{ margin: '5px 0 5px 0' }}>
          <span className="section-label" style={{ color: 'var(--ios-system-blue)' }}>
            <span className="beacon-dot beacon-pulse" style={{ width: '6px', height: '6px', '--status-color': 'var(--ios-system-blue)' } as React.CSSProperties} />
            O₂ Sentinel
          </span>
          <h2 style={{ 
            fontSize: '1.9rem', 
            fontWeight: 700, 
            margin: '4px 0 0 0', 
            letterSpacing: '-0.03em',
            color: 'var(--ios-label-primary)' 
          }}>
            Environmental Monitoring Dashboard
          </h2>
        </div>

        {/* 2-Column Responsive Dashboard Arrangement */}
        <div className="dashboard-grid">
          
          {/* Left Column: Sidebar Controls & Metrics */}
          <div className="sidebar-column">
            
            {/* System Status card (Visible on Dashboard and Analytics tabs) */}
            {(activeTab === 'dashboard' || activeTab === 'analytics') && (
              <div>
                <span className="section-label">System Status</span>
                <div className="ios-blur-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--ios-label-tertiary)', margin: '0 0 2px 0', letterSpacing: '0.04em' }}>
                    Sensor Status
                  </h3>
                  
                  {/* Sensor Status Indicator */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ios-separator)', paddingBottom: '12px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--ios-label-secondary)', fontWeight: 500 }}>
                      Telemetry Link
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="beacon-dot beacon-pulse" style={{ width: '8px', height: '8px', '--status-color': 'var(--ios-system-blue)' } as React.CSSProperties} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ios-system-blue)' }}>
                        Sensors Online
                      </span>
                    </div>
                  </div>

                  {/* Sampling Interval */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--ios-label-primary)' }}>
                      Sampling Interval
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ios-label-secondary)' }}>
                      10 seconds
                    </span>
                  </div>

                  {/* Simulation Control */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--ios-separator)', paddingTop: '12px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--ios-label-primary)' }}>
                      Simulate Drift/Anomaly
                    </span>
                    <label className="ios-switch">
                      <input 
                        type="checkbox" 
                        checked={mockAnomaly} 
                        onChange={(e) => setMockAnomaly(e.target.checked)} 
                      />
                      <span className="ios-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Forecast Metrics card (Visible on Predictions tab) */}
            {activeTab === 'predictions' && (
              <div>
                <span className="section-label">OXYGEN FORECAST</span>
                <div className="ios-blur-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--ios-label-tertiary)', margin: 0, letterSpacing: '0.04em' }}>
                    Atmospheric Forecast
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Current Oxygen */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ios-separator)', paddingBottom: '10px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--ios-label-secondary)', fontWeight: 500 }}>Current Oxygen Level</span>
                      <span style={{ fontSize: '1.15rem', color: 'var(--ios-label-primary)', fontWeight: 700 }}>
                        {oxygen.toFixed(1)}%
                      </span>
                    </div>

                    {/* Predicted 30m */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ios-separator)', paddingBottom: '10px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--ios-label-secondary)', fontWeight: 500 }}>Predicted After 30 Minutes</span>
                      <span style={{ 
                        fontSize: '1.15rem', 
                        color: 'var(--ios-system-blue)', 
                        fontWeight: 700 
                      }}>
                        {predO2_30m.toFixed(1)}%
                      </span>
                    </div>

                    {/* Predicted 1h */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--ios-label-secondary)', fontWeight: 500 }}>Predicted After 60 Minutes</span>
                      <span style={{ 
                        fontSize: '1.15rem', 
                        color: 'var(--ios-system-blue)', 
                        fontWeight: 700 
                      }}>
                        {predO2_1h.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Monitors & Grids */}
          <div className="main-column">
            
            {/* CURRENT ENVIRONMENTAL CONDITIONS */}
            {activeTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <span className="section-label">Current Environmental Conditions</span>
                  <div className="metrics-grid">
                    {/* 1. Oxygen Level (Prominent highlight) */}
                    <StatusCard 
                      title="Oxygen Level"
                      value={oxygen.toFixed(1)}
                      unit="%"
                      status={getOxygenStatus()}
                      progress={((oxygen - 15) / 10) * 100} // scale progress focus on safe levels 15-25%
                      helperText="Safe Range: 19.5% – 23.5%"
                      subtitle="Atmospheric Concentration"
                      icon={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      }
                    />

                    {/* 2. Temperature */}
                    <StatusCard 
                      title="Temperature"
                      value={temperature.toFixed(1)}
                      unit="°C"
                      status={getTemperatureStatus()}
                      progress={(temperature / 50) * 100}
                      subtitle="Ambient Temperature"
                      icon={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                        </svg>
                      }
                    />

                    {/* 3. Humidity */}
                    <StatusCard 
                      title="Humidity"
                      value={humidity.toFixed(1)}
                      unit="%"
                      status={getHumidityStatus()}
                      progress={humidity}
                      subtitle="Relative Humidity"
                      icon={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z" />
                        </svg>
                      }
                    />

                    {/* 4. Overall Safety */}
                    <StatusCard 
                      title="Overall Safety"
                      value={overallStatus === 'normal' ? 'SAFE' : 'ALERT'}
                      status={overallStatus}
                      subtitle="All environmental parameters within acceptable limits."
                      icon={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      }
                    />
                  </div>
                </div>

                {/* System Activity Log */}
                <div>
                  <span className="section-label">SYSTEM ACTIVITY LOG</span>
                  <div className="ios-blur-card" style={{ padding: '16px' }}>
                    <div style={{
                      background: '#040406',
                      border: '1px solid var(--ios-separator)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      fontFamily: 'var(--font-digital)',
                      fontSize: '0.78rem',
                      color: '#30d158',
                      height: '115px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.8)'
                    }}>
                      {logs.map((log, idx) => (
                        <div key={idx} style={{ lineBreak: 'anywhere' }}>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Trend Grid */}
            {activeTab === 'analytics' && (
              <div>
                <span className="section-label">Analytics & Trends</span>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '16px'
                }}>
                  {/* Row 1 Col 1: Oxygen Trend */}
                  <TrendChart 
                    title="Oxygen Concentration Trend"
                    subtitle="Last 24 Hours"
                    data={oxygenHistory}
                    min={18}
                    max={25}
                    color="var(--ios-system-blue)"
                    unit="%"
                    currentValue={oxygen.toFixed(1)}
                    safeMin={19.5}
                    safeMax={23.5}
                  />

                  {/* Row 1 Col 2: Temperature Trend */}
                  <TrendChart 
                    title="Temperature Trend"
                    subtitle="Last 24 Hours"
                    data={tempHistory}
                    min={15}
                    max={45}
                    color="var(--ios-system-blue)"
                    unit="°C"
                    currentValue={temperature.toFixed(1)}
                    safeMin={15}
                    safeMax={28}
                  />

                  {/* Row 2 Col 1: Humidity Trend */}
                  <TrendChart 
                    title="Humidity Trend"
                    subtitle="Last 24 Hours"
                    data={humidityHistory}
                    min={20}
                    max={80}
                    color="var(--ios-system-blue)"
                    unit="%"
                    currentValue={humidity.toFixed(1)}
                    safeMin={20}
                    safeMax={55}
                  />
                </div>
              </div>
            )}

            {/* Predictions Forecast */}
            {activeTab === 'predictions' && (
              <div>
                <span className="section-label">Predictions & Forecasting</span>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '16px'
                }}>
                  <PredictionChart 
                    title="OXYGEN CONCENTRATION FORECAST"
                    history={oxygenHistory}
                    projection={o2Projection}
                    min={18}
                    max={25}
                    color="var(--ios-system-blue)"
                    unit="%"
                    summaryText={`Current: ${oxygen.toFixed(1)}% | +30 min: ${predO2_30m.toFixed(1)}% | +60 min: ${predO2_1h.toFixed(1)}%`}
                  />
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <footer style={{ marginTop: '20px', padding: '16px 0', textAlign: 'center', color: 'var(--ios-label-tertiary)', fontSize: '0.78rem', borderTop: '1px solid var(--ios-separator)' }}>
          <p>O₂ Sentinel Dashboard</p>
        </footer>
      </div>
    </div>
  );
}
