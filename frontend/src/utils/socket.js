// src/utils/socket.js
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_SOCKET_URL || "http://localhost:5000", {
  withCredentials: true,
  autoConnect: false,
  transports: ["websocket"],
});

export default socket;
