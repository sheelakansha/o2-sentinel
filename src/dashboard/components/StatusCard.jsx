import React from 'react';

export default function StatusCard({ title, value, unit, status = 'normal', icon, subtitle, progress, helperText }) {
  // Determine color theme based on status
  const getStatusColor = () => {
    switch (status) {
      case 'normal': return 'var(--ios-system-blue)';
      case 'warning': return 'var(--ios-system-orange)';
      case 'danger': return 'var(--ios-system-red)';
      default: return 'var(--ios-system-gray)';
    }
  };

  const isSafetyCard = title === 'Overall Safety';
  const glowShadow = status === 'normal'
    ? '0 0 20px rgba(10, 132, 255, 0.3)' // Safe blue glow
    : '0 0 20px rgba(255, 69, 58, 0.4)'; // Alert red glow
  const glowBorder = status === 'normal'
    ? 'rgba(10, 132, 255, 0.45)'
    : 'rgba(255, 69, 58, 0.55)';

  return (
    <div className="ios-blur-card" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '140px',
      gap: '12px',
      transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      borderColor: isSafetyCard ? glowBorder : (status !== 'normal' ? getStatusColor() : 'var(--ios-separator)'),
      borderWidth: '1px',
      boxShadow: isSafetyCard 
        ? glowShadow 
        : (status !== 'normal' ? `0 4px 20px ${getStatusColor()}15` : '0 8px 24px rgba(0, 0, 0, 0.25)')
    }}>
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ 
          fontSize: '0.72rem', 
          fontWeight: 600, 
          color: 'var(--ios-label-tertiary)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.04em' 
        }}>
          {title}
        </span>
        <div style={{
          color: getStatusColor(),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
      </div>

      {/* Main Value Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ 
            fontSize: '2.2rem', 
            fontWeight: 700, 
            letterSpacing: '-0.02em', 
            color: 'var(--ios-label-primary)',
            lineHeight: '1'
          }}>
            {value}
          </span>
          {unit && (
            <span style={{ 
              fontSize: '1rem', 
              fontWeight: 500, 
              color: 'var(--ios-label-secondary)' 
            }}>
              {unit}
            </span>
          )}
        </div>
        {helperText && (
          <div style={{ 
            fontSize: '0.72rem', 
            color: 'var(--ios-label-tertiary)',
            fontWeight: 500
          }}>
            {helperText}
          </div>
        )}
      </div>

      {/* Progress visual or subtitle */}
      <div>
        {progress !== undefined ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ 
              height: '8px', 
              width: '100%', 
              background: 'rgba(255, 255, 255, 0.08)', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                height: '100%', 
                width: `${Math.min(100, Math.max(0, progress))}%`, 
                background: getStatusColor(),
                borderRadius: '4px',
                transition: 'width 0.5s ease-in-out'
              }} />
            </div>
            {subtitle && (
              <span style={{ fontSize: '0.72rem', color: 'var(--ios-label-secondary)' }}>
                {subtitle}
              </span>
            )}
          </div>
        ) : (
          subtitle && (
            <span style={{ fontSize: '0.72rem', color: 'var(--ios-label-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="beacon-dot" style={{ width: '4px', height: '4px', '--status-color': getStatusColor() }} />
              {subtitle}
            </span>
          )
        )}
      </div>
    </div>
  );
}
