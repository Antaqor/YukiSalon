export const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://www.vone.mn/api';
export const BASE_URL = API_URL.replace(/\/api$/, '');
export const UPLOADS_URL = `${BASE_URL}/api/uploads`;
export const LIVE_URL = process.env.NEXT_PUBLIC_LIVE_URL ?? 'https://vone.mn:5002';
