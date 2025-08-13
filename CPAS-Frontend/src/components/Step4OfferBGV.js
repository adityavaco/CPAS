import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStageOneCandidates, updateStageOneStatus } from '../store/candidateSlice';

export default function Step4OfferBGV() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { stageOneCandidates: candidates, loading, statusMap: status } = useSelector(state => state.candidates);

  useEffect(() => {
    dispatch(fetchStageOneCandidates());
  }, [dispatch]);

  const fetchCandidates = async () => {
    try {
      const response = await fetch('http://localhost:5000/interviews/stage-one-candidates');
      const data = await response.json();
      if (data.success) {
        setCandidates(data.candidates);
        // Initialize status for each candidate
        const initialStatus = {};
        data.candidates.forEach(candidate => {
          initialStatus[candidate.candid] = {
            offer: candidate.offer_status || null,
            bgv: candidate.bgv_status || null,
            loi: candidate.loi_status || null,
            additional: candidate.additional_status || null,
          };
        });
        setStatus(initialStatus);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setLoading(false);
    }
  };

  const handleSelection = async (candid, field, value) => {
    try {
      const response = await fetch('http://localhost:5000/interviews/update-stage-one', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: candid,
          field: field,
          status: value === 'right' ? 'completed' : 'rejected'
        })
      });

      const data = await response.json();
      if (data.success) {
        setStatus(prev => ({
          ...prev,
          [candid]: {
            ...prev[candid],
            [field]: value
          }
        }));
        // Refresh candidate list to get latest status
        await fetchCandidates();
      } else {
        alert('Failed to update status: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  const getBgColor = (candid, field) => {
    if (!status[candid]) return 'transparent';
    if (status[candid][field] === 'right') return '#d4edda'; // green
    if (status[candid][field] === 'cross') return '#f8d7da'; // red
    return 'transparent'; // default
  };

  const renderButtons = (candid, field) => {
    if (!status[candid] || status[candid][field]) return null; // already selected
    return (
      <>
        <button 
          className="btn btn-sm btn-outline-success me-1" 
          onClick={() => handleSelection(candid, field, 'right')}
        >
          ✅
        </button>
        <button 
          className="btn btn-sm btn-outline-danger" 
          onClick={() => handleSelection(candid, field, 'cross')}
        >
          ❌
        </button>
      </>
    );
  };

  const handleCompleteRecruitment = async (candid) => {
    try {
      const response = await fetch('http://localhost:5000/interviews/complete-recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate_id: candid })
      });
      if (response.ok) {
        fetchCandidates(); // Refresh the list
      }
    } catch (error) {
      console.error('Error completing recruitment:', error);
    }
  };

  const handleRejectCandidate = async (candid) => {
    if (!window.confirm('Are you sure you want to reject this candidate?')) {
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/interviews/reject-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate_id: candid })
      });
      const data = await response.json();
      if (data.success) {
        await fetchCandidates(); // Refresh the list
      } else {
        alert('Failed to reject candidate: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error rejecting candidate:', error);
      alert('Error rejecting candidate. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h3>Recruitment Step 4: HR Final Steps</h3>
      {candidates.length === 0 ? (
        <div className="alert alert-info">No candidates in stage one.</div>
      ) : (
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Candidate ID</th>
              <th>Name</th>
              <th>Offer Letter</th>
              <th>BGV</th>
              <th>Letter of Intent</th>
              <th>Additional Stages</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(candidate => (
              <tr key={candidate.candid}>
                <td>{candidate.candid}</td>
                <td>{candidate.name}</td>
                <td style={{ backgroundColor: getBgColor(candidate.candid, 'offer') }}>
                  {status[candidate.candid]?.offer ? (
                    <input type="checkbox" checked disabled />
                  ) : (
                    renderButtons(candidate.candid, 'offer')
                  )}
                </td>
                <td style={{ backgroundColor: getBgColor(candidate.candid, 'bgv') }}>
                  {status[candidate.candid]?.bgv ? (
                    <input type="checkbox" checked disabled />
                  ) : (
                    renderButtons(candidate.candid, 'bgv')
                  )}
                </td>
                <td style={{ backgroundColor: getBgColor(candidate.candid, 'loi') }}>
                  {status[candidate.candid]?.loi ? (
                    <input type="checkbox" checked disabled />
                  ) : (
                    renderButtons(candidate.candid, 'loi')
                  )}
                </td>
                <td style={{ backgroundColor: getBgColor(candidate.candid, 'additional') }}>
                  {status[candidate.candid]?.additional ? (
                    <input type="checkbox" checked disabled />
                  ) : (
                    renderButtons(candidate.candid, 'additional')
                  )}
                </td>
                <td>
                  <button 
                    className="btn btn-danger btn-sm m-1"
                    onClick={() => handleRejectCandidate(candidate.candid)}
                  >
                    Reject Candidate
                  </button>
                  <button 
                    className="btn btn-success btn-sm m-1"
                    onClick={() => handleCompleteRecruitment(candidate.candid)}
                    disabled={!status[candidate.candid]?.offer || !status[candidate.candid]?.bgv || !status[candidate.candid]?.loi}
                  >
                    Complete Recruitment
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>Previous</button>
    </div>
  );
}
