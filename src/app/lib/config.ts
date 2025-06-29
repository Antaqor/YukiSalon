export const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://www.vone.mn/api';
export const BASE_URL = API_URL.replace(/\/api$/, '');
export const UPLOADS_URL = `${BASE_URL}/api/uploads`;
// Default to localhost Socket.IO server when developing.
export const LIVE_URL = process.env.NEXT_PUBLIC_LIVE_URL ?? 'http://localhost:5002';
// Chat Socket.IO server
export const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL ?? 'http://localhost:5001';
