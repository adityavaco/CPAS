import { createSlice } from '@reduxjs/toolkit';

const modalSlice = createSlice({
  name: 'modals',
  initialState: {
    feedback: {
      show: false,
      rowIdx: null,
      round: null,
      text: '',
      status: 'selected'
    },
    jd: {
      show: false,
      rowIdx: null,
      ratings: {
        experience: 0,
        skillset: 0,
        communication: 0,
        interview: 0,
        aptitude: 0,
        decision: null
      }
    },
    interview: {
      show: false,
      rowIdx: null,
      round: null,
      mode: 'schedule',
      date: '',
      meetLink: '',
      feedback: ''
    }
  },
  reducers: {
    openFeedbackModal: (state, action) => {
      state.feedback = {
        ...state.feedback,
        show: true,
        rowIdx: action.payload.rowIdx,
        round: action.payload.round
      };
    },
    closeFeedbackModal: (state) => {
      state.feedback = {
        ...state.feedback,
        show: false,
        rowIdx: null,
        round: null,
        text: '',
      };
    },
    setFeedbackText: (state, action) => {
      state.feedback.text = action.payload;
    },
    setFeedbackStatus: (state, action) => {
      state.feedback.status = action.payload;
    },
    openJDModal: (state, action) => {
      state.jd.show = true;
      state.jd.rowIdx = action.payload;
    },
    closeJDModal: (state) => {
      state.jd = {
        ...state.jd,
        show: false,
        rowIdx: null,
        ratings: {
          experience: 0,
          skillset: 0,
          communication: 0,
          interview: 0,
          aptitude: 0,
          decision: null
        }
      };
    },
    updateJDRating: (state, action) => {
      state.jd.ratings[action.payload.criteria] = action.payload.value;
    },
    openInterviewModal: (state, action) => {
      state.interview = {
        ...state.interview,
        show: true,
        rowIdx: action.payload.rowIdx,
        round: action.payload.round,
        mode: action.payload.mode || 'schedule'
      };
    },
    closeInterviewModal: (state) => {
      state.interview = {
        ...state.interview,
        show: false,
        rowIdx: null,
        round: null,
        mode: 'schedule',
        date: '',
        meetLink: '',
        feedback: ''
      };
    },
    setInterviewDate: (state, action) => {
      state.interview.date = action.payload;
    },
    setMeetLink: (state, action) => {
      state.interview.meetLink = action.payload;
    }
  }
});

export const {
  openFeedbackModal,
  closeFeedbackModal,
  setFeedbackText,
  setFeedbackStatus,
  openJDModal,
  closeJDModal,
  updateJDRating,
  openInterviewModal,
  closeInterviewModal,
  setInterviewDate,
  setMeetLink
} = modalSlice.actions;

export default modalSlice.reducer;
