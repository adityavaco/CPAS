import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchCandidates = createAsyncThunk(
  'candidates/fetchCandidates',
  async () => {
    const response = await fetch('http://localhost:5000/interviews/get-candidates');
    const data = await response.json();
    return data.data;
  }
);

export const fetchStageOneCandidates = createAsyncThunk(
  'candidates/fetchStageOneCandidates',
  async () => {
    const response = await fetch('http://localhost:5000/interviews/stage-one-candidates');
    const data = await response.json();
    return data.candidates;
  }
);

export const updateStageOneStatus = createAsyncThunk(
  'candidates/updateStageOneStatus',
  async ({ candidateId, field, status }) => {
    const response = await fetch('http://localhost:5000/interviews/update-stage-one', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_id: candidateId,
        field,
        status: status === 'right' ? 'completed' : 'rejected'
      })
    });
    const data = await response.json();
    return { candidateId, field, status, success: data.success };
  }
);

const candidateSlice = createSlice({
  name: 'candidates',
  initialState: {
    list: [],
    stageOneCandidates: [],
    loading: false,
    error: null,
    statusMap: {},
  },
  reducers: {
    setStageOneStatus: (state, action) => {
      const { candidateId, status } = action.payload;
      state.statusMap[candidateId] = status;
    },
    updateCandidateStatus: (state, action) => {
      const { candidateId, field, value } = action.payload;
      if (!state.statusMap[candidateId]) {
        state.statusMap[candidateId] = {};
      }
      state.statusMap[candidateId][field] = value;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchStageOneCandidates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStageOneCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.stageOneCandidates = action.payload;
        // Initialize status map for new candidates
        action.payload.forEach(candidate => {
          if (!state.statusMap[candidate.candid]) {
            state.statusMap[candidate.candid] = {
              offer: candidate.offer_status,
              bgv: candidate.bgv_status,
              loi: candidate.loi_status,
              additional: candidate.additional_status
            };
          }
        });
      })
      .addCase(fetchStageOneCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setStageOneStatus, updateCandidateStatus } = candidateSlice.actions;
export default candidateSlice.reducer;
