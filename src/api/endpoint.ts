// The app's host forwards this fixed route to FreeSerp. Its broken CORS headers
// cannot block same-origin responses (Vite locally, Netlify rewrite in production).
export const API_ENDPOINT = '/api/freeserp';
