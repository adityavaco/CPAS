import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ResignationPage() {
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    managerEmail: '',
    teamName: '',
    lastWorkingDay: '',
    reason: ''
  });

  // Preloaded dummy resignation entries
  const [resignationList, setResignationList] = useState([
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
      status: 'Approved'
    },
    {
      employeeId: 'EMP103',
      name: 'Carol Williams',
      manager: 'mike.b@company.com',
      team: 'Design',
      lastWorkingDay: '2025-09-01',
      status: 'Declined'
    }
  ]);

  useEffect(() => {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 2);
    const formatted = currentDate.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, lastWorkingDay: formatted }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newEntry = {
      employeeId: formData.employeeId,
      name: formData.name,
      manager: formData.managerEmail,
      team: formData.teamName,
      lastWorkingDay: formData.lastWorkingDay,
      status: 'Pending'
    };

    setResignationList(prev => [...prev, newEntry]);

    alert('Resignation Submitted!');
    setFormData(prev => ({
      ...prev,
      employeeId: '',
      name: '',
      managerEmail: '',
      teamName: '',
      reason: ''
    }));
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'declined':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container py-5" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div className="row justify-content-center mb-5">
        <div className="col-md-6">
          <div className="card shadow rounded-4 border-0">
            <div className="card-header bg-primary text-white text-center rounded-top-4">
              <h4 className="mb-0">Resignation Form</h4>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="employeeId" className="form-label">Employee ID</label>
                  <input
                    type="text"
                    className="form-control"
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="managerEmail" className="form-label">Manager Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="managerEmail"
                    name="managerEmail"
                    value={formData.managerEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="teamName" className="form-label">Team Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="teamName"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="lastWorkingDay" className="form-label">Last Working Day</label>
                  <input
                    type="date"
                    className="form-control"
                    id="lastWorkingDay"
                    name="lastWorkingDay"
                    value={formData.lastWorkingDay}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="reason" className="form-label">Reason for Resignation</label>
                  <textarea
                    className="form-control"
                    id="reason"
                    name="reason"
                    rows="4"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    Submit Resignation
                  </button>
                </div>
              </form>
            </div>
            <div className="card-footer text-muted text-center small rounded-bottom-4">
              Your resignation will be handled confidentially.
            </div>
          </div>
        </div>
      </div>

      {/* Status Table */}
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-secondary text-white rounded-top-4 text-center">
              <h5 className="mb-0">Resignation Status</h5>
            </div>
            <div className="card-body p-3 table-responsive">
              <table className="table table-bordered table-hover align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Manager</th>
                    <th>Team</th>
                    <th>Last Working Day</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {resignationList.map((resignation, index) => (
                    <tr key={index}>
                      <td>{resignation.employeeId}</td>
                      <td>{resignation.name}</td>
                      <td>{resignation.manager}</td>
                      <td>{resignation.team}</td>
                      <td>{resignation.lastWorkingDay}</td>
                      <td>
                        <span className={`badge bg-${getStatusColor(resignation.status)}`}>
                          {resignation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {resignationList.length === 0 && (
                <p className="text-center text-muted">No resignations submitted yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
