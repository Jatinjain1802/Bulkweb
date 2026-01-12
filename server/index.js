import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


import authRoutes from './routes/authRoutes.js';
import templateRoutes from './routes/templateRoutes.js';

app.get("/", (req, res) => {
  res.send("API running...");
});

import campaignRoutes from './routes/campaignRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/campaigns', campaignRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
