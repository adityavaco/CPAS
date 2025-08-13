import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ManagerDashboard() {
  const [resignations, setResignations] = useState([
    {
      employeeId: 'EMP101',
      name: 'Alice Johnson',
      manager: 'john.doe@company.com',
      team: 'Engineering',
      lastWorkingDay: '2025-09-15',
      status: 'Pending'
    },
    {
      employeeId: 'EMP102',
      name: 'Bob Smith',
      manager: 'lisa.w@company.com',
      team: 'Product',
      lastWorkingDay: '2025-08-20',
      status: 'Pending'
    },
    {
      employeeId: 'EMP103',
      name: 'Carol Williams',
      manager: 'mike.b@company.com',
      team: 'Design',
      lastWorkingDay: '2025-09-01',
      status: 'Pending'
    }
  ]);

  const handleAction = (index, action) => {
    setResignations(prev =>
      prev.map((entry, i) =>
        i === index ? { ...entry, status: action } : entry
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'declined':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <h3 className="fw-bold">Manager Dashboard</h3>
        <p className="text-muted">Review and manage resignation requests</p>
      </div>

      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-primary text-white rounded-top-4 text-center">
          <h5 className="mb-0">Resignation Requests</h5>
        </div>
        <div className="card-body table-responsive p-4">
          <table className="table table-striped table-hover align-middle text-center rounded">
            <thead className="table-secondary">
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Manager</th>
                <th>Team</th>
                <th>Last Working Day</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {resignations.map((resignation, index) => (
                <tr key={index}>
                  <td>{resignation.employeeId}</td>
                  <td>{resignation.name}</td>
                  <td>{resignation.manager}</td>
                  <td>{resignation.team}</td>
                  <td>{resignation.lastWorkingDay}</td>
                  <td>
                    <span className={`badge bg-${getStatusColor(resignation.status)} px-3 py-2`}>
                      {resignation.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleAction(index, 'Approved')}
                        disabled={resignation.status !== 'Pending'}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleAction(index, 'Declined')}
                        disabled={resignation.status !== 'Pending'}
                      >
                        Decline
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {resignations.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-muted">
                    No resignation requests available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="card-footer text-center text-muted small rounded-bottom-4">
          Showing {resignations.length} requests
        </div>
      </div>
    </div>
  );
}
