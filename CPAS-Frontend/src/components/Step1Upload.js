import React from 'react';

export default function Step1Upload({ onNext, onReload }) {
  // Function to handle fetch-from-sheet POST request
  const handleFetchFromSheet = async () => {
    try {
      const response = await fetch('http://localhost:5000/interviews/fetch-data-from-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Response from server:', data);
      if (data.success) {
        alert(data.message || 'Data fetched and inserted successfully!');
        if (onReload) onReload();
        if (onNext) onNext();
      } else {
        alert('Failed: ' + (data.message || 'Unknown error'));
        if (onReload) onReload(); // Still reload to reflect any changes
      }
    } catch (err) {
      alert('Error: ' + err.message);
      if (onReload) onReload();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <button
        className="btn btn-sm btn-primary"
        id="fetch-from-sheet"
        onClick={handleFetchFromSheet}
      >
        Click to Fetch from Sheet
      </button>
      <button className="btn btn-sm btn-secondary">Add Job ID</button>
      <button className="btn btn-sm btn-info">Check & Fetch Salary</button>
    </div>
  );
}
