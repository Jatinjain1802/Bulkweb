import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));



const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

import authRoutes from './routes/authRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

app.get("/", (req, res) => {
  res.send("API running...");
});

import campaignRoutes from './routes/campaignRoutes.js';

import chatRoutes from './routes/chatRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/chat', chatRoutes);
import dashboardRoutes from './routes/dashboardRoutes.js';
app.use('/api/dashboard', dashboardRoutes);
app.use('/reports', reportRoutes);
app.use('/webhook', webhookRoutes);


const PORT = process.env.PORT || 5000;
import startScheduler from './utils/scheduler.js';
startScheduler(io);


app.post('/api/debug/socket-test', (req, res) => {
  const io = req.app.get('io');
  io.emit('new_message', {
    from: 'System Test',
    content: 'This is a test notification to verify real-time updates!',
    timestamp: Date.now() / 1000
  });
  res.json({ success: true, message: 'Test event emitted' });
});

httpServer.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
