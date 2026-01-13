import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


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
app.use('/reports', reportRoutes);
app.use('/webhook', webhookRoutes);


const PORT = process.env.PORT || 5000;
import startScheduler from './utils/scheduler.js';
startScheduler();

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
