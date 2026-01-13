import { WhatsappMessageModel } from '../models/whatsappMessageModel.js';

export const getTemplateReports = async (req, res) => {
    try {
        const { from, to } = req.query;
        
        if (!from || !to) {
            return res.status(400).json({ error: "Date range (from, to) is required" });
        }
        
        // Append time to date for full day coverage
        const fromDate = `${from} 00:00:00`;
        const toDate = `${to} 23:59:59`;

        const data = await WhatsappMessageModel.getAnalytics(fromDate, toDate);
        res.json(data);
    } catch (error) {
        console.error("Report Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};
