// components/Sidebar.js
// components/Sidebar.js


import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Step1Upload from './Step1Upload';
import { BsGridFill } from 'react-icons/bs';

export default function Sidebar() {
  const location = useLocation();

  // Highlight Recruitment for all recruitment-related subpages
  const isRecruitmentActive = location.pathname.startsWith('/recruitment') || location.pathname.startsWith('/step3interview') || location.pathname.startsWith('/step4offerbgv');
  const linkClass = (path) => {
    if (path === '/recruitment') {
      return `nav-link px-3 py-2 my-1 d-flex align-items-center sidebar-link ${isRecruitmentActive ? 'fw-bold active-link' : ''}`;
    }
    return `nav-link px-3 py-2 my-1 d-flex align-items-center sidebar-link ${location.pathname === path ? 'fw-bold active-link' : ''}`;
  };

  const [showRecruitmentDropdown, setShowRecruitmentDropdown] = useState(false);
  return (
    <div
      className="p-0"
      style={{
        minHeight: '100vh',
        width: '250px',
        background: 'linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%)',
        color: '#1e293b',
        boxShadow: '2px 0 8px rgba(30,64,175,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
    >
      {/* Removed Menu heading and icon for a cleaner sidebar */}
      <ul className="nav flex-column px-2" style={{marginTop: '2rem'}}>
        <li className="nav-item d-flex align-items-center">
          <Link
            to="/recruitment"
            className={linkClass('/recruitment')}
            style={{ flex: 1, cursor: 'pointer', textDecoration: 'none' }}
          >
            Recruitment
          </Link>
          <span
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={e => { e.stopPropagation(); setShowRecruitmentDropdown(prev => !prev); }}
          >
            {showRecruitmentDropdown ? '\u25B2' : '\u25BC'}
          </span>
        </li>
        {showRecruitmentDropdown && (
          <li className="nav-item" style={{ paddingLeft: 32 }}>
            <Step1Upload />
          </li>
        )}
        <li className="nav-item">
          <Link to="/onboarding" className={linkClass('/onboarding')}>Onboarding</Link>
        </li>
        <li className="nav-item">
          <Link to="/offboarding" className={linkClass('/offboarding')}>Offboarding</Link>
        </li>
      </ul>

      {/* Sidebar custom styles */}
      <style>{`
        .sidebar-link {
          border-radius: 0.5rem;
          transition: background 0.2s, color 0.2s;
          color: #1e293b;
        }
        .sidebar-link:hover {
          background: #2563eb22;
          color: #2563eb;
        }
        .active-link {
          background: #2563eb !important;
          color: #fff !important;
          box-shadow: 0 2px 8px #2563eb22;
        }
      `}</style>
    </div>
  );
}
