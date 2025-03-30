import express from "express";
import connectDB from "./config/database";
import cors from "cors";
// import { imapEmailParserService } from "./services/index.services";
import parsedEmailRouter from "./routes/parsed-email.route";
import newsletterRouter from "./routes/newsletter.route";
import { initializeScheduler } from './services/scheduler.service';
import { initializeWebSocket } from './services/websocket.service';

const app = express();

// Connect to MongoDB
connectDB();

app.use(
  cors({
    origin: [
      "https://newsletter-aggregator-sigma.vercel.app",
      "http://localhost:5173",
      "https://2a4a15e7-330c-475e-b139-c0cbe032ce15-00-ij3gplli45dh.janeway.replit.dev",
    ],
    credentials: true,
  })
);

// Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// mail-parser & node-imap email parser
// imapEmailParserService();

// parsed-email router
app.use("/api", parsedEmailRouter);

// newsletter router
app.use("/api", newsletterRouter);

// Start the server
const port = process.env.PORT || 5001;
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Initialize WebSocket server
initializeWebSocket(server);

// Initialize scheduler
initializeScheduler();
