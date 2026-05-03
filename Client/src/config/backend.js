// Central place to read backend endpoints from Vite env
// In Vite, only variables prefixed with VITE_ are exposed to the client.

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// If you run Socket.IO on the same server/port as the API (common setup),
// you can just reuse API_URL.
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;
