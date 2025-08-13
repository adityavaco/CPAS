import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StarRating.css'; // optional for better star style

export default function Step3Interview() {
  const navigate = useNavigate();
  const [popup, setPopup] = useState(null);
  const [selection, setSelection] = useState("");
  const [statusColor, setStatusColor] = useState("");
  const [feedbacks, setFeedbacks] = useState({});
  const [jdRatings, setJdRatings] = useState({
    experience: 0,
    skillset: 0,
    communication: 0,
    interview: 0,
    aptitude: 0,
    decision: null
  });
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/interviews/get-candidates-stageone');
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setCandidates(result.data);
        } else {
          setCandidates([]);
        }
      } catch (err) {
        setCandidates([]);
      }
      setLoading(false);
    };
    fetchCandidates();
  }, []);

  const openPopup = (stage) => {
    setPopup(stage);
  };

  const closePopup = () => {
    setPopup(null);
    setJdRatings({
      experience: 0,
      skillset: 0,
      communication: 0,
      interview: 0,
      aptitude: 0,
      decision: null
    });
  };

  const handleFeedbackChange = (e, stage) => {
    setFeedbacks({
      ...feedbacks,
      [stage]: {
        ...feedbacks[stage],
        feedback: e.target.value
      }
    });
  };

  const handleSelectionChange = (e, stage) => {
    setFeedbacks({
      ...feedbacks,
      [stage]: {
        ...feedbacks[stage],
        selection: e.target.value
      }
    });
  };

  /*const handleSubmit = () => {
    closePopup();
  };*/

  const handleSubmit = async (stage) => {
    if (stage === "JD") {
      // Find the candidate for which the popup is open
      const candidate = candidates[0];
      if (!candidate) return closePopup();
      const avgScore = parseFloat(calculateAverage());
      const decision = jdRatings.decision;
      // Use a non-empty feedback string for backend validation
      const feedback = `JD Evaluation: Avg Score ${avgScore}`;
      try {
        const response = await fetch('http://localhost:5000/interviews/candidate-stage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidate_id: candidate.candidate_id,
            stage: 'JD',
            status: decision,
            final_average_score: avgScore,
            feedback
          })
        });
        const result = await response.json();
        if (result.success) {
          alert('JD evaluation submitted successfully!');
          closePopup();
        } else {
          alert('Failed to submit JD evaluation: ' + result.message);
        }
      } catch (err) {
        alert('Failed to submit JD evaluation: ' + err.message);
      }
    } else {
      if (selection === "Selected") {
        setStatusColor("green");
      } else {
        setStatusColor("red");
      }
      closePopup();
    }
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

  const getColorClass = (stage) => {
    if (!feedbacks[stage]) return '';
    const selected = feedbacks[stage].selection;
    return selected === 'Selected' ? 'btn-success' : selected === 'Not Selected' ? 'btn-danger' : '';
  };

  const getRowColor = () => {
    return jdRatings.decision === 'Selected'
      ? 'table-success'
      : jdRatings.decision === 'Rejected'
      ? 'table-danger'
      : '';
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
          >★</span>
        ))}
      </div>
    );
  };

  return (
    <div className="mb-4 px-0">
      <div className="card shadow-sm border-0 rounded-0">
        <div className="card-header bg-secondary text-white fw-semibold fs-5">
          Interview Progress Tracker
        </div>
        <div className="card-body bg-light">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Candid</th>
                <th>Candidate Name</th>
                <th>Interview Date & Time</th>
                <th>JD Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4}>Loading...</td></tr>
              ) : candidates.length === 0 ? (
                <tr><td colSpan={4}>No candidates found.</td></tr>
              ) : (
                candidates.map((row, idx) => (
                  <tr key={row.candidate_id} className={getRowColor()}>
                    <td>{row.candidate_id}</td>
                    <td>{row.candidate_name}</td>
                    <td>{row.l1_interview_date ? new Date(row.l1_interview_date).toLocaleString() : ''}</td>
                    <td>
                      <button
                        className={`btn btn-sm m-1 ${getColorClass('JD')}`}
                        onClick={() => openPopup('JD')}
                      >
                        JD
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="d-flex justify-content-between mt-3">
            <button className="btn btn-secondary" onClick={() => navigate('/recruitment')}>
              Previous
            </button>
            <button className="btn btn-success" onClick={() => navigate('/step4offerbgv')}>
              Next Page
            </button>
          </div>
          {popup && (
            <div className="modal d-block" tabIndex="-1">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{popup === 'JD' ? 'JD Evaluation' : `${popup} Feedback`}</h5>
                    <button className="btn-close" onClick={closePopup}></button>
                  </div>
                  <div className="modal-body">
                    {popup === 'JD' ? (
                      <div>
                        <div className="mb-3">
                          <label>Relevant Years of Experience</label>
                          {renderStars('experience')}
                        </div>
                        <div className="mb-3">
                          <label>Techstack / Skillset</label>
                          {renderStars('skillset')}
                        </div>
                        <div className="mb-3">
                          <label>Communication Skills</label>
                          {renderStars('communication')}
                        </div>
                        <div className="mb-3">
                          <label>Interview</label>
                          {renderStars('interview')}
                        </div>
                        <div className="mb-3">
                          <label>Aptitude</label>
                          {renderStars('aptitude')}
                        </div>
                        <div className="mb-3">
                          <strong>Average Score: {calculateAverage()} / 5</strong>
                        </div>
                        <div className="mb-3">
                          <label>Final Decision:</label>
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
                    ) : (
                      <div>
                        <textarea
                          className="form-control mb-2"
                          placeholder={`${popup} feedback`}
                          value={feedbacks[popup]?.feedback || ''}
                          onChange={(e) => handleFeedbackChange(e, popup)}
                        />
                        <label className="form-label">Candidate Decision</label>
                        <select
                          className="form-select"
                          value={feedbacks[popup]?.selection || ''}
                          onChange={(e) => handleSelectionChange(e, popup)}
                        >
                          <option value="">Select</option>
                          <option value="Selected">Selected</option>
                          <option value="Not Selected">Not Selected</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
                    <button className="btn btn-secondary" onClick={closePopup}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

