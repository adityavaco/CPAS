// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import Sidebar from './components/Sidebar';
import HRDashboard from './components/HRDashboard';
import Step3Interview from './components/Step3Interview';
import Step4OfferBGV from './components/Step4OfferBGV';
import Onboarding from './pages/Onboarding';
import Offboarding from './pages/Offboarding';

function App() {
  const handleLogout = () => {
    alert('Logged out!');
  };

  return (
    <Provider store={store}>
      <Router>
        {/* Global Navbar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary" style={{borderRadius: 0}}>
          <span className="navbar-brand fw-bold ps-3">CPAS Dashboard</span>
        <button
          className="btn btn-outline-light ms-auto me-3"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
      <div className="d-flex">
        <Sidebar />
        <div className="p-4 flex-grow-1">
          <Routes>
            <Route path="/" element={<Navigate to="/recruitment" />} />
            <Route path="/recruitment" element={<HRDashboard />} />
            <Route path="/step3interview" element={<Step3Interview />} />
            <Route path="/step4offerbgv" element={<Step4OfferBGV />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/offboarding" element={<Offboarding />} />
          </Routes>
        </div>
      </div>
    </Router>
    </Provider>
  );
}

export default App;
