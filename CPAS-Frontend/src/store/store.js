import { configureStore } from '@reduxjs/toolkit';
import candidateReducer from './candidateSlice';
import modalReducer from './modalSlice';

export const store = configureStore({
  reducer: {
    candidates: candidateReducer,
    modals: modalReducer,
  },
});

export default store;
