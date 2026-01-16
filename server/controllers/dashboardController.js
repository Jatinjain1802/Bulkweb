
import db from '../config/db.js';

export const getDashboardSummary = async (req, res) => {
    try {
        // 1. Total Messages (Outbound)
        const [msgCounts] = await db.execute(`
            SELECT COUNT(*) as total
            FROM whatsapp_messages 
            WHERE direction='outbound'
        `);

        // 2. Active Campaigns
        const [campaignCounts] = await db.execute(`
            SELECT COUNT(*) as active 
            FROM campaigns 
            WHERE status IN ('processing', 'scheduled', 'running')
        `);

        // 3. Templates Created
        const [templateCounts] = await db.execute('SELECT COUNT(*) as total FROM templates');

        // 4. Credits Remaining (Mock or Derived)
        // Since we don't have a billing table yet, we'll return a placeholder or total cost incurred so far.
        // Let's return Total Contacts as a useful metric instead? 
        // Or just hardcode a high number for now if "Credits" is a visual requirement.
        // Let's use "Total Contacts" as the 4th metric for now to be useful.
        const [contactCounts] = await db.execute('SELECT COUNT(*) as total FROM contacts');

        // 5. Chart Data (Last 7 Days)
        const [dailyStats] = await db.execute(`
             SELECT 
                DATE_FORMAT(wm.sent_at, '%Y-%m-%d') as date, 
                COUNT(*) as sent_count,
                SUM(CASE WHEN wm.delivered_at IS NOT NULL OR wm.status IN ('delivered', 'read') THEN 1 ELSE 0 END) as delivered_count,
                SUM(CASE WHEN wm.status = 'failed' THEN 1 ELSE 0 END) as failed_count,
                GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') as campaign_names,
                GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') as template_names
            FROM whatsapp_messages wm
            LEFT JOIN campaigns c ON wm.campaign_id = c.id
            LEFT JOIN templates t ON c.template_id = t.id
            WHERE wm.direction='outbound' 
            AND wm.sent_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE(wm.sent_at)
            ORDER BY DATE(wm.sent_at) ASC
        `);

        // Fill in missing days
        const filledChartData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = dailyStats.find(item => item.date === dateStr);
            filledChartData.push({
                date: dateStr,
                sent: found ? Number(found.sent_count) : 0,
                delivered: found ? Number(found.delivered_count) : 0,
                failed: found ? Number(found.failed_count) : 0,
                campaignNames: found ? found.campaign_names : '',
                templateNames: found ? found.template_names : '',
                label: d.toLocaleDateString('en-US', { weekday: 'short' })
            });
        }

        // 6. Recent Activity
        const [recentCampaigns] = await db.execute(`
            SELECT 
                c.id, 
                c.name, 
                c.created_at, 
                c.status,
                t.name as template_name
            FROM campaigns c
            LEFT JOIN templates t ON c.template_id = t.id
            ORDER BY c.created_at DESC 
            LIMIT 5
        `);

        // 7. Top Templates (New)
        const [topTemplates] = await db.execute(`
            SELECT 
                t.name, 
                COUNT(*) as usage_count,
                SUM(CASE WHEN wm.status = 'read' THEN 1 ELSE 0 END) as read_count
            FROM whatsapp_messages wm
            JOIN templates t ON wm.template_id = t.id
            GROUP BY t.id, t.name
            ORDER BY usage_count DESC
            LIMIT 4
        `);

        const activity = recentCampaigns.map(c => {
            let color = 'bg-blue-500';
            if (c.status === 'completed') color = 'bg-green-500';
            if (c.status === 'failed') color = 'bg-red-500';
            if (c.status === 'scheduled') color = 'bg-purple-500';
            
            return {
                text: `Campaign "${c.name}" (Template: ${c.template_name || 'N/A'}) ${c.status}`,
                time: c.created_at,
                type: 'campaign',
                color
            };
        });

        res.json({
            metrics: {
                totalMessages: msgCounts[0].total,
                activeCampaigns: campaignCounts[0].active,
                templatesCreated: templateCounts[0].total,
                totalContacts: contactCounts[0].total
            },
            chartData: filledChartData,
            recentActivity: activity,
            topTemplates
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};
