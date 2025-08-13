import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export default function Step2AssignManager() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { feedbackModal, jdModal } = useSelector(state => state.modals);
  const { list: candidates, loading } = useSelector(state => state.candidates);

  const openJDModal = (rowIdx) => {
    setJDModal({ show: true, rowIdx });
  };

  const closeJDModal = () => {
    setJDModal({ show: false, rowIdx: null });
    setJdRatings({
      experience: 0,
      skillset: 0,
      communication: 0,
      interview: 0,
      aptitude: 0,
      decision: null
    });
  };

  const handleStarRating = (criteria, value) => {
    setJdRatings(prev => ({
      ...prev,
      [criteria]: value
    }));
  };

  const calculateAverage = () => {
    const total =
      jdRatings.experience +
      jdRatings.skillset +
      jdRatings.communication +
      jdRatings.interview +
      jdRatings.aptitude;
    return (total / 5).toFixed(2);
  };

  const renderStars = (criteria) => {
    const value = jdRatings[criteria];
    return (
      <div>
        {[1, 2, 3, 4, 5].map(num => (
          <span
            key={num}
            className={`star ${num <= value ? 'filled' : ''}`}
            onClick={() => handleStarRating(criteria, num)}
            style={{ cursor: 'pointer', color: num <= value ? '#ffc107' : '#e4e5e9', fontSize: '24px' }}
          >★</span>
        ))}
      </div>
    );
  };

  const handleJDSubmit = async () => {
    const row = data[jdModal.rowIdx];
    if (!row) return closeJDModal();
    
    const avgScore = parseFloat(calculateAverage());
    const decision = jdRatings.decision;
    const feedback = `JD Evaluation: Avg Score ${avgScore}`;
    
    try {
      // Update JD evaluation first
      const jdResponse = await fetch('http://localhost:5000/interviews/candidate-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: row.candid,
          stage: 'JD',
          status: decision,
          final_average_score: avgScore,
          feedback
        })
      });
      
      if (!jdResponse.ok) {
        throw new Error('Failed to update JD evaluation');
      }

      const jdResult = await jdResponse.json();
      let stageOneResult = { success: true };
      
      // If JD evaluation is "Selected", update stage_one_status
      if (decision === 'Selected') {
        const stageOneResponse = await fetch('http://localhost:5000/interviews/candidate-stage-one', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidate_id: row.candid,
            stage_one_status: true
          })
        });
        stageOneResult = await stageOneResponse.json();
      }

      if (jdResult.success && stageOneResult.success) {
        // Update the local state to show the Accept button
        setData(prev => prev.map((r, i) => {
          if (i !== jdModal.rowIdx) return r;
          return {
            ...r,
            jd_evaluation_completed: true,
            jd_score: avgScore,
            jd_status: decision,
            stage_one_status: decision === 'Selected'
          };
        }));
        alert('JD evaluation submitted successfully!');
        closeJDModal();
        
        // If the candidate was selected, automatically navigate to Step 4
        if (decision === 'Selected') {
          navigate('/step4offerbgv');
        }
      } else {
        alert('Failed to submit JD evaluation: ' + (jdResult.message || stageOneResult.message));
      }
    } catch (err) {
      alert('Failed to submit JD evaluation: ' + err.message);
    }
  };
  const [data, setData] = useState([]);
  // Modal state from Redux
  const { modal, linkCopied } = useSelector(state => state.modals);

  // Use Redux dispatch for data fetching
  const fetchCandidates = () => {
    setLoading(true);
    fetch('http://localhost:5000/interviews/get-candidates')
      .then(res => res.json())
      .then(result => {
        if (result.success && Array.isArray(result.data)) {
          const mapped = result.data.map((c) => ({
            id: c.job_id,
            candid: c.candidate_id,
            name: c.candidate_name,
            l1_datetime: c.l1_interview_date || '',
            l1_status: (c.l1_status || 'pending').toLowerCase(),
            l1_feedback_status: c.l1_feedback_status ? c.l1_feedback_status.toLowerCase() : null,
            l2_datetime: c.l2_interview_date || '',
            l2_status: c.l2_interview_date ? (c.l2_status || 'pending').toLowerCase() : 'not_available',
            l2_feedback_status: c.l2_feedback_status ? c.l2_feedback_status.toLowerCase() : null,
            hr_datetime: c.hr_interview_date || '',
            hr_status: (c.hr_status || 'not_available').toLowerCase(),
            hr_feedback_status: (c.hr_feedback_status || '').toLowerCase(),
            manager: c.manager_assigned || '',
            interview_link: c.interview_link || ''
          }));
          setData(mapped);
        } else {
          setData([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching candidates:', err);
        setData([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCandidates();
  }, [reloadKey]);

  // Modal open/close helpers
  // Feedback modal open/close helpers
  const openFeedbackModal = (rowIdx, round) => {
    setFeedbackModal({ show: true, rowIdx, round });
    setFeedbackText(data[rowIdx]?.[`${round}_feedback`] || '');
    setFeedbackStatus(data[rowIdx]?.[`${round}_feedback_status`] || 'selected');
  };
  const closeFeedbackModal = () => {
    setFeedbackModal({ show: false, rowIdx: null, round: null });
    setFeedbackText('');
    setFeedbackStatus('selected');
  };
  // L2 Interview Modal state
  const [l2Modal, setL2Modal] = useState({ show: false, rowIdx: null });
  const [hrModal, setHRModal] = useState({ show: false, rowIdx: null });

  const openModal = (rowIdx, round, mode = 'schedule') => {
    if (round === 'l2') {
      setL2Modal({ show: true, rowIdx });
      setModalDate(data[rowIdx].l2_datetime || '');
    } else if (round === 'hr') {
      setHRModal({ show: true, rowIdx });
      setModalDate(data[rowIdx].hr_datetime || '');
    } else {
      setModal({ show: true, rowIdx, round, mode });
      if (mode === 'schedule') {
        setModalDate(data[rowIdx][`${round}_datetime`] || '');
      }
      setModalMeetLink(data[rowIdx]?.interview_link || '');
    }
  };
  const closeModal = () => {
    setModal({ show: false, rowIdx: null, round: null, mode: 'schedule' });
    setModalMeetLink('');
  };



  // Manager options for dropdown
  const managerOptions = [
    { value: 'Raj Kumar', label: 'Raj Kumar' },
    { value: 'Sneha Kapoor', label: 'Sneha Kapoor' },
    { value: 'Arjun Verma', label: 'Arjun Verma' }
  ];

  // Save the manager value directly to the db for the candidate (PATCH)
  const handleManagerChange = async (rowIdx, value, round) => {
    const row = data[rowIdx];
    // Format modalDate to 'YYYY-MM-DD HH:MM'
    let formattedDatetime = modalDate ? modalDate.replace('T', ' ') : '';
    let patchBody = {
      candidate_id: row.candid,
      round_type: round ? round.toUpperCase() : 'L1',
      interview_datetime: formattedDatetime
    };
    if (round === 'l1') patchBody.l1_panel = value;
    else if (round === 'l2') patchBody.l2_panel = value;
    else if (round === 'hr') patchBody.hr_panel = value;
    console.log('PATCH body for manager assignment:', patchBody);
    try {
      const response = await fetch('http://localhost:5000/interviews/interview-schedule', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchBody)
      });
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        result = { success: false, message: 'Invalid JSON response', raw: text };
      }
      console.log('PATCH response for manager assignment:', result);
    if (result.success) {
      // Update local state for manager and interview date
      setData(prev => prev.map((r, i) => {
        if (i !== rowIdx) return r;
        let updated = { ...r, manager: value };
        if (round === 'l1') updated.l1_datetime = formattedDatetime;
        else if (round === 'l2') updated.l2_datetime = formattedDatetime;
        else if (round === 'hr') updated.hr_datetime = formattedDatetime;
        return updated;
      }));
      // Force modal dropdown to show latest manager
      setModal(m => ({ ...m }));
    } else {
      alert('Failed to assign manager: ' + result.message);
    }
    } catch (err) {
      alert('Failed to assign manager: ' + err.message);
    }
  };


  // Reject candidate handler
  const handleRejectCandidate = async (candid, index) => {
    if (!window.confirm('Are you sure you want to reject this candidate?')) return;
    const response = await fetch(`http://localhost:5000/interviews/candidate-reject?candidate_id=${candid}`, { method: 'DELETE' });
    const result = await response.json();
    if (result.success) {
      setData(prev => prev.filter((r, i) => i !== index));
    } else {
      alert('Failed to reject candidate: ' + result.message);
    }
  };

  // Accept candidate handler
  const handleAcceptCandidate = async (candid, index) => {
    if (!window.confirm('Are you sure you want to accept this candidate for offer and BGV stage?')) return;
    try {
      // First update the stage_one_status
      const response = await fetch('http://localhost:5000/interviews/candidate-stage-one', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          candidate_id: candid,
          stage_one_status: true  // Set stage_one_status to true
        })
      });
      const result = await response.json();
      if (result.success) {
        setData(prev => prev.filter((r, i) => i !== index));
        // Automatically navigate to offer/BGV page after successful approval
        navigate('/step4offerbgv');
      } else {
        alert('Failed to accept candidate: ' + result.message);
      }
    } catch (err) {
      alert('Failed to accept candidate: ' + err.message);
    }
  };

  // Helper for tab color
  const getTabClass = (status, datetime) => {
    if (!datetime) return 'btn-outline-secondary'; // default if not scheduled
    if (status === 'pending' || status === 'not_available') return 'bg-warning text-dark';
    if (status === 'accepted' || status === 'selected') return 'bg-success text-white';
    if (status === 'rejected') return 'bg-danger text-white';
    return 'bg-secondary text-white';
  };

  if (loading) {
    return <div>Loading candidates...</div>;
  }

  return (
    <div>
      {data.length === 0 ? (
        <div className="alert alert-info">
          No candidates found.
        </div>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Candid</th>
              <th>Job ID</th>
              <th>Candidate Name</th>
              <th>Interview Status</th>
              <th>Feedback</th>
              <th>Final Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={row.candid}>
                <td>{row.candid}</td>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td id="interview-status">
                  {/* Tabs for L1, L2, HR */}
                  <div className="d-flex gap-2 mb-2">
                    <button
                      className={`btn btn-sm ${getTabClass(row.l1_status, row.l1_datetime)}`}
                      onClick={() => openModal(index, 'l1', row.l1_datetime ? 'status' : 'schedule')}
                      disabled={row.l1_feedback_status === 'rejected'} // Only disable if L1 feedback is rejected
                    >
                      L1
                    </button>
                    <button
                      className={`btn btn-sm ${getTabClass(row.l2_status, row.l2_datetime)}`}
                      disabled={
                        !row.l1_datetime || // Need L1 interview scheduled
                        !row.l1_feedback_status || // Need L1 feedback to be given
                        row.l1_feedback_status !== 'selected' || // Need L1 feedback to be selected
                        row.l2_feedback_status === 'rejected' // Disable if L2 is rejected
                      }
                      onClick={() => openModal(index, 'l2', row.l2_datetime ? 'status' : 'schedule')}
                    >
                      L2
                    </button>
                    <button
                      className={`btn btn-sm ${getTabClass(row.hr_status, row.hr_datetime)}`}
                      disabled={
                        !row.l2_datetime || // Need L2 interview scheduled
                        !row.l2_feedback_status || // Need L2 feedback given
                        row.l2_feedback_status !== 'selected' // Need L2 feedback to be selected
                      }
                      onClick={() => openModal(index, 'hr', row.hr_datetime ? 'status' : 'schedule')}
                    >
                      HR
                    </button>
                  </div>
                  
                </td>
                
                <td id="feedback">
                  <div className="d-flex gap-2 mb-2">
                    <button
                      className={`btn btn-sm ${getTabClass(row.l1_feedback_status || row.l1_status, row.l1_datetime)}`}
                      onClick={() => openFeedbackModal(index, 'l1')}
                      disabled={
                        !row.l1_datetime || // Need L1 interview scheduled
                        row.l1_feedback_status !== null // Only enable if no feedback given yet
                      }
                    >
                      L1
                    </button>
                    <button
                      className={`btn btn-sm ${getTabClass(row.l2_feedback_status || row.l2_status, row.l2_datetime)}`}
                      onClick={() => openFeedbackModal(index, 'l2')}
                      disabled={
                        !row.l2_datetime || // Need L2 interview scheduled
                        row.l1_feedback_status !== 'selected' || // Need L1 feedback to be selected
                        row.l2_feedback_status !== null // Only enable if no feedback given yet
                      }
                    >
                      L2
                    </button>
                    <button
                      className={`btn btn-sm ${getTabClass(row.hr_feedback_status || row.hr_status, row.hr_datetime)}`}
                      onClick={() => openFeedbackModal(index, 'hr')}
                      disabled={
                        !row.hr_datetime || // Need HR interview scheduled
                        !row.l2_feedback_status || // Need L2 feedback first
                        row.l2_feedback_status === 'rejected' || // Can't proceed if L2 rejected
                        row.hr_feedback_status // Can't give feedback if already given
                      }
                    >
                      HR
                    </button>
                  </div>
      {/* Feedback Modal for L1/L2/HR feedback input */}
      <Modal show={feedbackModal.show} onHide={closeFeedbackModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {feedbackModal.round ? `${feedbackModal.round.toUpperCase()} Feedback` : 'Feedback'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label className="form-label">Feedback</label>
          <input
            type="text"
            className="form-control mb-2"
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
          />
          <label className="form-label">Feedback Status</label>
          <select
            className="form-select mb-2"
            value={feedbackStatus}
            onChange={e => setFeedbackStatus(e.target.value)}
          >
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button
            variant="primary"
            className="mt-2"
            disabled={!feedbackText.trim()}
            onClick={async () => {
              // Save feedback and status to backend (custom endpoint if needed)
              const row = data[feedbackModal.rowIdx];
              await fetch('http://localhost:5000/interviews/candidate-stage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  candidate_id: row.candid,
                  stage: feedbackModal.round ? feedbackModal.round.toUpperCase() : 'L1',
                  feedback: feedbackText,
                  status: feedbackStatus
                })
              });
              setData(prev => prev.map((r, i) => {
                if (i !== feedbackModal.rowIdx) return r;
                let updated = {
                  ...r,
                  [`${feedbackModal.round}_feedback`]: feedbackText,
                  [`${feedbackModal.round}_feedback_status`]: feedbackStatus
                };
                // If L1 feedback is rejected, also set l1_status to 'rejected'
                if (feedbackModal.round === 'l1' && feedbackStatus === 'rejected') {
                  updated.l1_status = 'rejected';
                }
                // If L1 feedback is selected, set l1_status to 'accepted'
                if (feedbackModal.round === 'l1' && feedbackStatus === 'selected') {
                  updated.l1_status = 'accepted';
                }
                // If L2 feedback is rejected, also set l2_status to 'rejected'
                if (feedbackModal.round === 'l2' && feedbackStatus === 'rejected') {
                  updated.l2_status = 'rejected';
                }
                // If L2 feedback is selected, set l2_status to 'accepted'
                if (feedbackModal.round === 'l2' && feedbackStatus === 'selected') {
                  updated.l2_status = 'accepted';
                }
                // If HR feedback is selected, set hr_status to 'accepted'
                if (feedbackModal.round === 'hr' && feedbackStatus === 'selected') {
                  updated.hr_status = 'accepted';
                }
                // If HR feedback is rejected, set hr_status to 'rejected'
                if (feedbackModal.round === 'hr' && feedbackStatus === 'rejected') {
                  updated.hr_status = 'rejected';
                }
                return updated;
              }));
              closeFeedbackModal();
            }}
          >Submit</Button>
        </Modal.Body>
      </Modal>
                  
                </td>

                {/* Feedback column: input for L1 feedback only, can be extended for L2/HR if needed */}
                <td>
                  {/* Show JD button only after all interview rounds are completed with selected status */}
                  {row.l1_feedback_status === 'selected' && 
                   row.l2_feedback_status === 'selected' && 
                   row.hr_feedback_status === 'selected' && !row.jd_evaluation_completed && (
                    <button
                      className="btn btn-outline-primary me-2"
                      onClick={() => openJDModal(index)}
                    >
                      JD Evaluation
                    </button>
                  )}
                  {/* Show Accept button only if all rounds have selected feedback and JD evaluation is completed */}
                  {row.l1_feedback_status === 'selected' && 
                   row.l2_feedback_status === 'selected' && 
                   row.hr_feedback_status === 'selected' && 
                   row.jd_evaluation_completed && (
                    <button
                      className="btn btn-outline-success me-2"
                      onClick={() => handleAcceptCandidate(row.candid, index)}
                    >
                      Accept
                    </button>
                  )}
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => handleRejectCandidate(row.candid, index)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for scheduling/status for any round (L1, L2, HR) */}
      <Modal show={modal.show} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modal.round ? `${modal.round.toUpperCase()} Interview` : 'Interview'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label className="form-label">Select Date & Time</label>
            <input
              type="datetime-local"
              className="form-control mb-3"
              value={modalDate}
              onChange={e => setModalDate(e.target.value)}
            />

            {/* Assign Manager dropdown inside modal */}
            <div className="mb-3">
              <label className="form-label">Interviewer</label>
              <select
                className="form-select"
                value={(() => {
                  if (!modal.round || modal.rowIdx == null) return '';
                  if (modal.round === 'l1') return data[modal.rowIdx]?.l1_panel || '';
                  if (modal.round === 'l2') return data[modal.rowIdx]?.l2_panel || '';
                  if (modal.round === 'hr') return data[modal.rowIdx]?.hr_panel || '';
                  return '';
                })()}
                onChange={e => handleManagerChange(modal.rowIdx, e.target.value, modal.round)}
                disabled={!modalDate}
              >
                <option value="">Select Interviewer</option>
                {managerOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {(() => {
                if (!modal.round || modal.rowIdx == null) return null;
                let interviewer = '';
                if (modal.round === 'l1') interviewer = data[modal.rowIdx]?.l1_panel;
                if (modal.round === 'l2') interviewer = data[modal.rowIdx]?.l2_panel;
                if (modal.round === 'hr') interviewer = data[modal.rowIdx]?.hr_panel;
                return interviewer ? (
                  <div className="mt-2 text-success">
                    <small>Selected: {interviewer.replace('manager_', '').replace(/_/g, ' ')}</small>
                  </div>
                ) : null;
              })()}
              {/* Show warning if interview not scheduled */}
              {!modalDate && (
                <div className="mt-2 text-danger"><small>Select interview date before assigning interviewer.</small></div>
              )}
            </div>

            {/* Meeting Link field with copy button */}
            <div className="mb-3">
              <label className="form-label">Meeting Link</label>
              <div>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      cursor: data[modal.rowIdx]?.interview_link ? 'pointer' : 'default',
                      backgroundColor: data[modal.rowIdx]?.interview_link ? '#f8f9fa' : '#fff'
                    }}
                    value={data[modal.rowIdx]?.interview_link || ''}
                    readOnly
                    placeholder="Click Generate Link button to create a meeting link"
                    onClick={() => {
                      const link = data[modal.rowIdx]?.interview_link;
                      if (link) {
                        navigator.clipboard.writeText(link);
                        setLinkCopied(true);
                        setTimeout(() => setLinkCopied(false), 2000);
                      }
                    }}
                    title={data[modal.rowIdx]?.interview_link ? "Click to copy link" : ""}
                  />
                  <Button 
                    onClick={async () => {
                      const row = data[modal.rowIdx];
                      const response = await fetch('http://localhost:5000/interviews/generate-meeting-link', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ candidate_id: row.candid })
                      });
                      const result = await response.json();
                      if (result.success) {
                        setData(prev => prev.map((r, i) => 
                          i === modal.rowIdx ? { ...r, interview_link: result.meeting_url } : r
                        ));
                      }
                    }}
                  >
                    Generate Link
                  </Button>
                </div>
                {data[modal.rowIdx]?.interview_link && (
                  <div className="text-muted mt-1" style={{ fontSize: '0.875em' }}>
                    <small>{linkCopied ? "✓ Link copied to clipboard!" : "👆 Click on the link to copy to clipboard"}</small>
                  </div>
                )}
              </div>
            </div>
      {/* Feedback input removed from modal, now in table column */}
            {/* Action buttons row */}
            <div className="d-flex gap-2 mb-3 justify-content-between">
              <div>
                  <Button
                  className="me-2"
                  variant="primary"
                  onClick={async () => {
                    const row = data[modal.rowIdx];
                    const formattedDatetime = modalDate.replace('T', ' ');
                    
                    // First generate the meeting link
                    const meetingResponse = await fetch('http://localhost:5000/interviews/generate-meeting-link', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ candidate_id: row.candid })
                    });
                    const meetingResult = await meetingResponse.json();
                    const meetingUrl = meetingResult.success ? meetingResult.meeting_url : '';
                    
                    let patchBody = {
                      candidate_id: row.candid,
                      interview_datetime: formattedDatetime,
                      round_type: modal.round ? modal.round.toUpperCase() : 'L1',
                      interview_link: meetingUrl
                    };                    // Add initial status for each round
                    if (modal.round === 'l1') {
                      patchBody.l1_status = 'pending';
                    } else if (modal.round === 'l2') {
                      patchBody.l2_status = 'pending';
                      // Clear any existing L2 feedback when rescheduling
                      patchBody.l2_feedback = '';
                      patchBody.l2_feedback_status = '';
                    } else if (modal.round === 'hr') {
                      patchBody.hr_status = 'pending';
                      // Clear any existing HR feedback when rescheduling
                      patchBody.hr_feedback = '';
                      patchBody.hr_feedback_status = '';
                    }

                    const response = await fetch('http://localhost:5000/interviews/interview-schedule', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(patchBody)
                    });
                    const result = await response.json();
                    if (result.success) {
                      // Update local state before fetching
                      setData(prev => prev.map((r, i) => {
                        if (i !== modal.rowIdx) return r;
                        return {
                          ...r,
                          [`${modal.round}_datetime`]: formattedDatetime,
                          [`${modal.round}_status`]: 'pending'
                        };
                      }));
                      await fetchCandidates();
                      closeModal();
                    } else {
                      alert('Failed to schedule: ' + result.message);
                    }
                  }}
                  // Save is always enabled
                >
                  Save
                </Button>
                <Button
                  className="me-2"
                  variant="secondary"
                  onClick={async () => {
                    const row = data[modal.rowIdx];
                    // Always clear manager and meet link for L1 reset
                    let patchBody = {
                      candidate_id: row.candid,
                      interview_datetime: null,
                      round_type: modal.round ? modal.round.toUpperCase() : 'L1',
                      reset: true
                    };
                    if (modal.round === 'l1') {
                      patchBody.interview_link = '';
                    }
                    const response = await fetch('http://localhost:5000/interviews/interview-schedule', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(patchBody)
                    });
                    const result = await response.json();
                    if (result.success) {
                      // Always clear modal fields for L1
                      if (modal.round === 'l1') {
                        setModalMeetLink('');
                      }
                      setModalDate('');
                      setModalFeedback('');
                      // Wait for fetchCandidates to complete before closing modal
                      await fetchCandidates();
                      closeModal();
                    } else {
                      alert('Failed to reset: ' + result.message);
                    }
                  }}
                >Reset</Button>
              </div>
              <div>
                {modalFeedback.trim() && (
                  <>
                    <Button
                      className="me-2"
                      variant="success"
                      onClick={async () => {
                        const row = data[modal.rowIdx];
                        // 1. Save feedback to DB for the correct round
                        let feedbackField = '';
                        if (modal.round === 'l1') feedbackField = 'l1_feedback';
                        else if (modal.round === 'l2') feedbackField = 'l2_feedback';
                        else if (modal.round === 'hr') feedbackField = 'hr_feedback';
                        // PATCH feedback to DB
                        await fetch('http://localhost:5000/interviews/interview-schedule', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            candidate_id: row.candid,
                            round_type: modal.round ? modal.round.toUpperCase() : 'L1',
                            [feedbackField]: modalFeedback
                          })
                        });
                        // 2. Accept the round 
                        const response = await fetch('http://localhost:5000/interviews/candidate-stage', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            candidate_id: row.candid,
                            stage: modal.round ? modal.round.toUpperCase() : 'L1',
                            feedback: 'Accepted',
                            status: 'ACCEPTED'
                          })
                        });
                        const result = await response.json();
                        if (result.success) {
                          // 3. If L1, reset assign manager, meet link, and feedback fields in UI for this candidate
                        if (modal.round === 'l1') {
                          setData(prev => prev.map((r, i) => i === modal.rowIdx ? {
                            ...r,
                            interview_link: '',
                            // Optionally clear feedback field in UI too
                          } : r));
                        }
                          setModalFeedback('');
                          fetchCandidates();
                          closeModal();
                        } else {
                          alert('Failed to update status: ' + result.message);
                        }
                      }}
                    >Accept</Button>
                    <Button
                      variant="danger"
                      onClick={async () => {
                        const row = data[modal.rowIdx];
                        const response = await fetch('http://localhost:5000/interviews/candidate-stage', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            candidate_id: row.candid,
                            stage: modal.round ? modal.round.toUpperCase() : 'L1',
                            feedback: 'Rejected',
                            status: 'REJECTED'
                          })
                        });
                        const result = await response.json();
                        if (result.success) {
                          fetchCandidates();
                          closeModal();
                        } else {
                          alert('Failed to update status: ' + result.message);
                        }
                      }}
                    >Reject</Button>
                  </>
                )}
              </div>
            </div>
            {/* Status and Interview Date */}
            <div className="mb-2">
              Status: <span className={
                data[modal.rowIdx]?.[`${modal.round}_status`] === 'accepted' ? 'text-success' :
                data[modal.rowIdx]?.[`${modal.round}_status`] === 'rejected' ? 'text-danger' : 'text-warning'
              }>
                {data[modal.rowIdx]?.[`${modal.round}_status`] ? data[modal.rowIdx][`${modal.round}_status`].toUpperCase() : 'NOT AVAILABLE'}
              </span>
            </div>
            <div className="mb-2">
              Interview Date: <b>{data[modal.rowIdx]?.[`${modal.round}_datetime`] ? new Date(data[modal.rowIdx][`${modal.round}_datetime`]).toLocaleString() : 'Not set'}</b>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* L2 Interview Modal */}
      <Modal show={l2Modal.show} onHide={() => setL2Modal({ show: false, rowIdx: null })} centered>
        <Modal.Header closeButton>
          <Modal.Title>L2 Interview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label className="form-label">L2 Interview Date & Time</label>
            <input
              type="datetime-local"
              className="form-control mb-3"
              value={modalDate}
              onChange={e => setModalDate(e.target.value)}
            />

            {/* L2 Interviewer Selection */}
            <div className="mb-3">
              <label className="form-label">L2 Interviewer</label>
              <select
                className="form-select"
                value={l2Modal.rowIdx !== null ? data[l2Modal.rowIdx]?.l2_panel || '' : ''}
                onChange={e => handleManagerChange(l2Modal.rowIdx, e.target.value, 'l2')}
                disabled={!modalDate}
              >
                <option value="">Select L2 Interviewer</option>
                {managerOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {!modalDate && (
                <div className="mt-2 text-danger">
                  <small>Select interview date before assigning interviewer.</small>
                </div>
              )}
            </div>

            {/* L2 Interview Status */}
            {l2Modal.rowIdx !== null && (
              <div className="alert alert-info">
                <div>L1 Status: <strong>{data[l2Modal.rowIdx]?.l1_status?.toUpperCase() || 'N/A'}</strong></div>
                <div>L1 Feedback: <strong>{data[l2Modal.rowIdx]?.l1_feedback_status?.toUpperCase() || 'N/A'}</strong></div>
              </div>
            )}

            {/* Meeting Link field with copy button for L2 */}
            <div className="mb-3">
              <label className="form-label">Meeting Link</label>
              <div>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      cursor: data[l2Modal.rowIdx]?.interview_link ? 'pointer' : 'default',
                      backgroundColor: data[l2Modal.rowIdx]?.interview_link ? '#f8f9fa' : '#fff'
                    }}
                    value={data[l2Modal.rowIdx]?.interview_link || ''}
                    readOnly
                    placeholder="Click Generate Link button to create a meeting link"
                    onClick={() => {
                      const link = data[l2Modal.rowIdx]?.interview_link;
                      if (link) {
                        navigator.clipboard.writeText(link);
                        setLinkCopied(true);
                        setTimeout(() => setLinkCopied(false), 2000);
                      }
                    }}
                    title={data[l2Modal.rowIdx]?.interview_link ? "Click to copy link" : ""}
                  />
                  <Button 
                    onClick={async () => {
                      const row = data[l2Modal.rowIdx];
                      const response = await fetch('http://localhost:5000/interviews/generate-meeting-link', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ candidate_id: row.candid })
                      });
                      const result = await response.json();
                      if (result.success) {
                        setData(prev => prev.map((r, i) => 
                          i === l2Modal.rowIdx ? { ...r, interview_link: result.meeting_url } : r
                        ));
                      }
                    }}
                  >
                    Generate Link
                  </Button>
                </div>
                {data[l2Modal.rowIdx]?.interview_link && (
                  <div className="text-muted mt-1" style={{ fontSize: '0.875em' }}>
                    <small>{linkCopied ? "✓ Link copied to clipboard!" : "👆 Click on the link to copy to clipboard"}</small>
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex gap-2 mb-3">
              <div>
                <Button
                  variant="primary"
                  onClick={async () => {
                    const row = data[l2Modal.rowIdx];
                    const formattedDatetime = modalDate.replace('T', ' ');
                    const response = await fetch('http://localhost:5000/interviews/interview-schedule', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      candidate_id: row.candid,
                      interview_datetime: formattedDatetime,
                      round_type: 'L2',
                      l2_status: 'pending',
                      l2_feedback: '',
                      l2_feedback_status: ''
                    })
                  });
                  const result = await response.json();
                  if (result.success) {
                    setData(prev => prev.map((r, i) => {
                      if (i !== l2Modal.rowIdx) return r;
                      return {
                        ...r,
                        l2_datetime: formattedDatetime,
                        l2_status: 'pending',
                        l2_feedback: '',
                        l2_feedback_status: null
                      };
                    }));
                    setL2Modal({ show: false, rowIdx: null });
                  } else {
                    alert('Failed to schedule L2 interview: ' + result.message);
                  }
                }}
              >
                Save
              </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    const row = data[l2Modal.rowIdx];
                    // Only reset L2 specific fields while preserving L1 state
                    let patchBody = {
                      candidate_id: row.candid,
                      interview_datetime: null,
                      round_type: 'L2',
                      reset: true,
                      // Maintain L1's existing state
                      l1_status: row.l1_status,
                      l1_feedback: row.l1_feedback,
                      l1_feedback_status: row.l1_feedback_status,
                      // Only reset L2 fields
                      l2_datetime: null,
                      l2_panel: '',
                      // Keep L2 in pending if L1 was selected
                      l2_status: row.l1_feedback_status === 'selected' ? 'pending' : null,
                      l2_feedback: '',
                      l2_feedback_status: null,
                      interview_link: ''
                    };
                    const response = await fetch('http://localhost:5000/interviews/interview-schedule', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(patchBody)
                    });
                    const result = await response.json();
                    if (result.success) {
                      setModalDate('');
                      setData(prev => prev.map((r, i) => {
                        if (i !== l2Modal.rowIdx) return r;
                        return {
                          ...r,
                          // Explicitly maintain L1 state
                          l1_status: r.l1_status,
                          l1_feedback: r.l1_feedback,
                          l1_feedback_status: r.l1_feedback_status,
                          l1_panel: r.l1_panel,
                          l1_datetime: r.l1_datetime,
                          // Reset only L2 fields
                          l2_datetime: null,
                          l2_panel: '',
                          l2_status: r.l1_feedback_status === 'selected' ? 'pending' : null,
                          interview_link: ''
                        };
                      }));
                      await fetchCandidates();
                      setL2Modal({ show: false, rowIdx: null });
                    } else {
                      alert('Failed to reset: ' + result.message);
                    }
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* HR Interview Modal */}
      <Modal show={hrModal.show} onHide={() => setHRModal({ show: false, rowIdx: null })} centered>
        <Modal.Header closeButton>
          <Modal.Title>HR Interview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label className="form-label">HR Interview Date & Time</label>
            <input
              type="datetime-local"
              className="form-control mb-3"
              value={modalDate}
              onChange={e => setModalDate(e.target.value)}
            />

            {/* HR Interviewer Selection */}
            <div className="mb-3">
              <label className="form-label">HR Interviewer</label>
              <select
                className="form-select"
                value={hrModal.rowIdx !== null ? data[hrModal.rowIdx]?.hr_panel || '' : ''}
                onChange={e => handleManagerChange(hrModal.rowIdx, e.target.value, 'hr')}
                disabled={!modalDate}
              >
                <option value="">Select HR Interviewer</option>
                {managerOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {!modalDate && (
                <div className="mt-2 text-danger">
                  <small>Select interview date before assigning interviewer.</small>
                </div>
              )}
            </div>

            {/* Previous Interview Status */}
            {hrModal.rowIdx !== null && (
              <div className="alert alert-info">
                <div>L2 Status: <strong>{data[hrModal.rowIdx]?.l2_status?.toUpperCase() || 'N/A'}</strong></div>
                <div>L2 Feedback: <strong>{data[hrModal.rowIdx]?.l2_feedback_status?.toUpperCase() || 'N/A'}</strong></div>
              </div>
            )}

            {/* Meeting Link field with copy button for HR */}
            <div className="mb-3">
              <label className="form-label">Meeting Link</label>
              <div>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      cursor: data[hrModal.rowIdx]?.interview_link ? 'pointer' : 'default',
                      backgroundColor: data[hrModal.rowIdx]?.interview_link ? '#f8f9fa' : '#fff'
                    }}
                    value={data[hrModal.rowIdx]?.interview_link || ''}
                    readOnly
                    placeholder="Click Generate Link button to create a meeting link"
                    onClick={() => {
                      const link = data[hrModal.rowIdx]?.interview_link;
                      if (link) {
                        navigator.clipboard.writeText(link);
                        setLinkCopied(true);
                        setTimeout(() => setLinkCopied(false), 2000);
                      }
                    }}
                    title={data[hrModal.rowIdx]?.interview_link ? "Click to copy link" : ""}
                  />
                  <Button 
                    onClick={async () => {
                      const row = data[hrModal.rowIdx];
                      const response = await fetch('http://localhost:5000/interviews/generate-meeting-link', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ candidate_id: row.candid })
                      });
                      const result = await response.json();
                      if (result.success) {
                        setData(prev => prev.map((r, i) => 
                          i === hrModal.rowIdx ? { ...r, interview_link: result.meeting_url } : r
                        ));
                      }
                    }}
                  >
                    Generate Link
                  </Button>
                </div>
                {data[hrModal.rowIdx]?.interview_link && (
                  <div className="text-muted mt-1" style={{ fontSize: '0.875em' }}>
                    <small>{linkCopied ? "✓ Link copied to clipboard!" : "👆 Click on the link to copy to clipboard"}</small>
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex gap-2 mb-3">
              <div>
                <Button
                  variant="primary"
                  onClick={async () => {
                    const row = data[hrModal.rowIdx];
                    const formattedDatetime = modalDate.replace('T', ' ');
                    const response = await fetch('http://localhost:5000/interviews/interview-schedule', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      candidate_id: row.candid,
                      interview_datetime: formattedDatetime,
                      round_type: 'HR',
                      hr_status: 'pending',
                      hr_feedback: '',
                      hr_feedback_status: ''
                    })
                  });
                  const result = await response.json();
                  if (result.success) {
                    setData(prev => prev.map((r, i) => {
                      if (i !== hrModal.rowIdx) return r;
                      return {
                        ...r,
                        hr_datetime: formattedDatetime,
                        hr_status: 'pending',
                        hr_feedback: '',
                        hr_feedback_status: null
                      };
                    }));
                    setHRModal({ show: false, rowIdx: null });
                  } else {
                    alert('Failed to schedule HR interview: ' + result.message);
                  }
                }}
              >
                Save
              </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    const row = data[hrModal.rowIdx];
                    let patchBody = {
                      candidate_id: row.candid,
                      interview_datetime: null,
                      round_type: 'HR',
                      reset: true,
                      hr_status: null,
                      hr_feedback: '',
                      hr_feedback_status: null,
                      hr_panel: ''
                    };
                    const response = await fetch('http://localhost:5000/interviews/interview-schedule', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(patchBody)
                    });
                    const result = await response.json();
                    if (result.success) {
                      setModalDate('');
                      setData(prev => prev.map((r, i) => {
                        if (i !== hrModal.rowIdx) return r;
                        return {
                          ...r,
                          hr_datetime: null,
                          hr_status: null,
                          hr_feedback: '',
                          hr_feedback_status: null,
                          hr_panel: '',
                          interview_link: ''
                        };
                      }));
                      await fetchCandidates();
                      setHRModal({ show: false, rowIdx: null });
                    } else {
                      alert('Failed to reset: ' + result.message);
                    }
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* JD Evaluation Modal */}
      <Modal show={jdModal.show} onHide={closeJDModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>JD Evaluation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <div className="mb-3">
              <label className="form-label">Relevant Years of Experience</label>
              {renderStars('experience')}
            </div>
            <div className="mb-3">
              <label className="form-label">Techstack / Skillset</label>
              {renderStars('skillset')}
            </div>
            <div className="mb-3">
              <label className="form-label">Communication Skills</label>
              {renderStars('communication')}
            </div>
            <div className="mb-3">
              <label className="form-label">Interview</label>
              {renderStars('interview')}
            </div>
            <div className="mb-3">
              <label className="form-label">Aptitude</label>
              {renderStars('aptitude')}
            </div>
            <div className="mb-3">
              <strong>Average Score: {calculateAverage()} / 5</strong>
            </div>
            <div className="mb-3">
              <label className="form-label">Final Decision:</label>
              <select
                className="form-select"
                value={jdRatings.decision || ''}
                onChange={(e) =>
                  setJdRatings({ ...jdRatings, decision: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleJDSubmit} disabled={!jdRatings.decision}>Submit</Button>
          <Button variant="secondary" onClick={closeJDModal}>Close</Button>
        </Modal.Footer>
      </Modal>

      <div className="d-flex justify-content-end mt-4">
        <Button variant="primary" onClick={() => {
          // Always navigate to Step 4 (OfferBGV)
          navigate('/step4offerbgv');
        }}>
          Next
        </Button>
      </div>
    </div>
  );
}