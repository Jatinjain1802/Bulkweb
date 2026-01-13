import express from 'express';
import { getConversations, getMessages, sendChatMessage } from '../controllers/chatController.js';

const router = express.Router();

router.get('/conversations', getConversations);
router.get('/messages/:phoneNumber', getMessages);
router.post('/send', sendChatMessage);

export default router;
