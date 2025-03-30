import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';

// Store connected clients
export const clients: Set<WebSocket> = new Set();

// Function to send messages to all connected clients
export const sendMessageToAllClients = (message: any) => {
    console.log("Sending message to all clients 2 ====> ", message);
    for (let client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            console.log("Sending message to client 3 ====> ", message);
            client.send(message);
        }
    }
};

// Initialize WebSocket server
export const initializeWebSocket = (server: Server) => {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        // Add new client
        clients.add(ws);

        ws.on("close", () => {
            clients.delete(ws);
        });
    });

    console.log("WebSocket server is running on ws://localhost:5001");
}; 