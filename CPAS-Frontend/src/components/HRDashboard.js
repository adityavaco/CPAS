// components/HRDashboard.js


import React, { useState } from 'react';
import Step1Upload from './Step1Upload';
import Step2AssignManager from './Step2AssignManager';
import Step3Interview from './Step3Interview';
import Step4OfferBGV from './Step4OfferBGV';

export default function HRDashboard({ reloadKey }) {
  return (
    <div>
      {/* Enhanced Assign Manager Section - Full width */}
      <div className="mb-4 px-0">
        <div className="card shadow-sm border-0 rounded-0">
          <div className="card-header bg-secondary text-white fw-semibold fs-5">
            Interview Progress Tracker
          </div>
          <div className="card-body bg-light">
            <Step2AssignManager reloadKey={reloadKey} />
          </div>
        </div>
      </div>
    </div>
  );
}
