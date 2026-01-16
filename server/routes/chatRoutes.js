import express from 'express';
import { getConversations, getMessages, sendChatMessage, markMessagesAsRead } from '../controllers/chatController.js';

const router = express.Router();

router.get('/conversations', getConversations);
router.get('/messages/:phoneNumber', getMessages);
router.post('/send', sendChatMessage);
router.put('/read/:phoneNumber', markMessagesAsRead);

export default router;
