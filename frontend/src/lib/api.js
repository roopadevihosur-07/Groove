import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 15000 });

export const getProfile = (uid) => api.get(`/user/${uid}/profile`).then(r => r.data);
export const saveProfile = (uid, data) => api.post(`/user/${uid}/profile`, data).then(r => r.data);
export const getDashboard = (uid) => api.get(`/dashboard/${uid}`).then(r => r.data);
export const getScamAlerts = () => api.get('/scam/alerts').then(r => r.data);
export const analyzeCall = (uid, description) => api.post('/scam/analyze', { userId: uid, description }).then(r => r.data);
export const getReminders = (uid) => api.get(`/reminders/${uid}`).then(r => r.data);
export const addReminder = (uid, data) => api.post(`/reminders/${uid}`, data).then(r => r.data);
export const deleteReminder = (uid, rid) => api.delete(`/reminders/${uid}/${rid}`).then(r => r.data);
export const bookAppointment = (uid, data) => api.post(`/appointments/${uid}`, data).then(r => r.data);
export const getBenefits = (uid) => api.get(`/benefits/${uid}`).then(r => r.data);
export const setupVoice = (uid) => api.post(`/voice/setup/${uid}`).then(r => r.data);
export const queryKnowledge = (q) => api.get(`/knowledge?q=${encodeURIComponent(q)}`).then(r => r.data);
export default api;
