import { io, Socket } from 'socket.io-client';
import { CHAT_URL } from '../lib/config';

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(CHAT_URL, { autoConnect: true });
  }
  return socket;
}
