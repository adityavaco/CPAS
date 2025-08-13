import React, { useState } from 'react';
import ResignationForm from './offboarding/ResignationForm';
import ManagerDashboard from './offboarding/ManagerDashboard';

export default function Offboarding() {
  const [currentView, setCurrentView] = useState('main');

  const handleResignationClick = () => {
    setCurrentView('resignation');
  };

  const handleManagerDashboardClick = () => {
    setCurrentView('managerDashboard');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  if (currentView === 'resignation') {
    return (
      <div>
        <div style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
          <button 
            onClick={handleBackToMain}
            style={{
              ...buttonStyle,
              backgroundColor: '#6c757d',
              marginBottom: '10px'
            }}
          >
            ← Back to Offboarding
          </button>
        </div>
        <ResignationForm />
      </div>
    );
  }

  if (currentView === 'managerDashboard') {
    return (
      <div>
        <div style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
          <button 
            onClick={handleBackToMain}
            style={{
              ...buttonStyle,
              backgroundColor: '#6c757d',
              marginBottom: '10px'
            }}
          >
            ← Back to Offboarding
          </button>
        </div>
        <ManagerDashboard />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3>Offboarding Module</h3>
      <div style={{ marginTop: '20px' }}>
        <button 
          style={buttonStyle}
          onClick={handleResignationClick}
        >
          Resignation
        </button>
        <button style={{ ...buttonStyle, marginLeft: '10px' }} onClick={handleManagerDashboardClick}>
          Manager Dashboard
        </button>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  backgroundColor: '#007bff',
  color: '#fff',
  cursor: 'pointer'
};