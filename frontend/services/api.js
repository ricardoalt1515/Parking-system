
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Corrige la construcción del WebSocket
export const socket = new WebSocket(
  `${API_URL.replace(/\/+$/, "").replace("http", "ws")}/ws/tickets/`
);

export default api;

