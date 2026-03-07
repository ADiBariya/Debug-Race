import api from './api.service';

export const getRace = (raceId) =>
  api.get(`/api/race/${raceId}`);

export const submitAnswer = (raceId, data) =>
  api.post(`/api/race/${raceId}/answer`, data);

export const generateQuestion = (data) =>
  api.post('/api/ai/generate-question', data);

export const getRaceResults = (raceId) =>
  api.get(`/api/race/${raceId}/results`);
