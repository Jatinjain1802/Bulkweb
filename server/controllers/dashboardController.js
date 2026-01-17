
import db from '../config/db.js';

export const getDashboardSummary = async (req, res) => {
    try {
        const { timeframe = '7days' } = req.query;

        // Helper to generate date condition
        const getDateCondition = (t, dateColumn) => {
            switch(t) {
                case 'today': return `DATE(${dateColumn}) = CURDATE()`;
                case 'yesterday': return `DATE(${dateColumn}) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
                case '7days': return `${dateColumn} >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)`;
                case '30days': return `${dateColumn} >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)`;
                case 'this_month': return `MONTH(${dateColumn}) = MONTH(CURDATE()) AND YEAR(${dateColumn}) = YEAR(CURDATE())`;
                case 'last_month': return `MONTH(${dateColumn}) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(${dateColumn}) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))`;
                case 'this_year': return `YEAR(${dateColumn}) = YEAR(CURDATE())`;
                case 'last_year': return `YEAR(${dateColumn}) = YEAR(CURDATE()) - 1`;
                default: return `${dateColumn} >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)`; // Default 7 days
            }
        };

        const msgCondition = getDateCondition(timeframe, 'sent_at');
        const templateCondition = getDateCondition(timeframe, 'created_at');
        // Campaigns created in this timeframe
        const campaignCondition = getDateCondition(timeframe, 'created_at'); 

        // 1. Total Messages (Filtered)
        const [msgCounts] = await db.execute(`
            SELECT COUNT(*) as total
            FROM whatsapp_messages 
            WHERE direction='outbound' AND ${msgCondition}
        `);

        // 2. Active Campaigns (Snapshot - Always current active)
        // User typically wants to see what's running NOW, regardless of filter.
        // OR if they want "Campaigns from this period", we could change it. 
        // Let's keep Active as "Current Status" but maybe add "Campaigns in Period" count instead?
        // Request says "Global Filter", usually applies to "Volume" metrics.
        // Let's apply filter to "Active" -> "Campaigns Active in this period"? No, "Active" implies current state.
        // Let's stick to Snapshot for "Active".
        const [campaignCounts] = await db.execute(`
            SELECT COUNT(*) as active 
            FROM campaigns 
            WHERE status IN ('processing', 'scheduled', 'running')
        `);

        // 2b. Scheduled Campaigns (Snapshot)
        const [scheduledCampaignCounts] = await db.execute(`
            SELECT COUNT(*) as scheduled 
            FROM campaigns 
            WHERE status = 'scheduled'
        `);

        // 3. Templates Created (Filtered)
        const [templateCounts] = await db.execute(`
            SELECT COUNT(*) as total FROM templates WHERE ${templateCondition}
        `);

        // 4. Total Contacts (Snapshot - All time)
        const [contactCounts] = await db.execute('SELECT COUNT(*) as total FROM contacts');

        // 5. Chart Data
        // Determine grouping and filling strategy
        let groupBy = 'DAY';
        let dateFormat = '%Y-%m-%d';
        let intervalDays = 7;
        
        // Adjust for longer periods
        if (timeframe === 'this_year' || timeframe === 'last_year') {
            groupBy = 'MONTH';
            dateFormat = '%Y-%m';
        }

        const chartDateCondition = getDateCondition(timeframe, 'wm.sent_at');

        let chartQuery = `
             SELECT 
                DATE_FORMAT(wm.sent_at, '${dateFormat}') as date, 
                COUNT(*) as sent_count,
                SUM(CASE WHEN wm.delivered_at IS NOT NULL OR wm.status IN ('delivered', 'read') THEN 1 ELSE 0 END) as delivered_count,
                SUM(CASE WHEN wm.status = 'failed' THEN 1 ELSE 0 END) as failed_count
            FROM whatsapp_messages wm
            WHERE wm.direction='outbound' 
            AND ${chartDateCondition}
            GROUP BY ${groupBy === 'MONTH' ? "DATE_FORMAT(wm.sent_at, '%Y-%m')" : "DATE(wm.sent_at)"}
            ORDER BY date ASC
        `;

        const [dailyStats] = await db.execute(chartQuery);

        // Fill data logic
        const filledChartData = [];
        const now = new Date();
        
        // Helper to get labels
        const getLabel = (dStr, group) => {
            const date = new Date(dStr);
            if(group === 'MONTH') return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }); // Fri 16
        };

        if (timeframe === 'today') {
            // Just one point or maybe hourly? Let's do single point for now or "Today"
             const dStr = now.toISOString().split('T')[0];
             const found = dailyStats.find(i => i.date === dStr) || {};
             filledChartData.push({
                 date: dStr,
                 sent: Number(found.sent_count || 0),
                 delivered: Number(found.delivered_count || 0),
                 failed: Number(found.failed_count || 0),
                 label: 'Today'
             });
        } else if (timeframe === 'yesterday') {
             const d = new Date(now);
             d.setDate(d.getDate() - 1);
             const dStr = d.toISOString().split('T')[0];
             const found = dailyStats.find(i => i.date === dStr) || {};
             filledChartData.push({
                 date: dStr,
                 sent: Number(found.sent_count || 0),
                 delivered: Number(found.delivered_count || 0),
                 failed: Number(found.failed_count || 0),
                 label: 'Yesterday'
             });
        } else if (groupBy === 'MONTH') {
            // Fill months for the year
            const year = timeframe === 'last_year' ? now.getFullYear() - 1 : now.getFullYear();
            for(let m=0; m<12; m++) {
                // Construct YYYY-MM
                const mStr = String(m+1).padStart(2, '0');
                const key = `${year}-${mStr}`;
                const found = dailyStats.find(i => i.date === key);
                // Future months for this year check
                if (timeframe === 'this_year' && m > now.getMonth()) break;

                filledChartData.push({
                    date: key,
                    sent: found ? Number(found.sent_count) : 0,
                    delivered: found ? Number(found.delivered_count) : 0,
                    failed: found ? Number(found.failed_count) : 0,
                    label: new Date(year, m, 1).toLocaleDateString('en-US', { month: 'short' })
                });
            }
        } else {
             // Fill days logic (7 days, 30 days, month)
             let daysToFill = 6; // Default 7 days
             if (timeframe === '30days') daysToFill = 29;
             if (timeframe === 'this_month') daysToFill = now.getDate() - 1; // Days so far this month
             if (timeframe === 'last_month') {
                 // Complex: need strictly last month days. 
                 // Simplified: Just use returned data for custom ranges or use standard logic.
                 // For now let's just use what DB returned for variable ranges to avoid complex JS filling.
                 // Actually, let's just map the DB results directly if it's not a fixed "Lookback" window.
             }

             if (['7days', '30days'].includes(timeframe)) {
                for (let i = daysToFill; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateStr = d.toISOString().split('T')[0];
                    const found = dailyStats.find(item => item.date === dateStr);
                    filledChartData.push({
                        date: dateStr,
                        sent: found ? Number(found.sent_count) : 0,
                        delivered: found ? Number(found.delivered_count) : 0,
                        failed: found ? Number(found.failed_count) : 0,
                        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    });
                }
             } else {
                 // For "this_month", "last_month" just map existing or fill gaps if needed.
                 // Simple approach: map existing, if empty return empty.
                 // Let's try to be consistent with DB result order.
                 dailyStats.forEach(stat => {
                     filledChartData.push({
                         date: stat.date,
                         sent: Number(stat.sent_count),
                         delivered: Number(stat.delivered_count),
                         failed: Number(stat.failed_count),
                         label: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                     });
                 });
             }
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
            WHERE wm.direction='outbound' AND ${getDateCondition(timeframe, 'wm.sent_at')}
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
                scheduledCampaigns: scheduledCampaignCounts[0].scheduled,
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

export const getAllActivities = async (req, res) => {
    try {
        const [allCampaigns] = await db.execute(`
            SELECT 
                c.id, 
                c.name, 
                c.created_at, 
                c.status,
                t.name as template_name
            FROM campaigns c
            LEFT JOIN templates t ON c.template_id = t.id
            ORDER BY c.created_at DESC 
        `);

        const activity = allCampaigns.map(c => {
            let color = 'bg-blue-500';
            if (c.status === 'completed') color = 'bg-green-500';
            if (c.status === 'failed') color = 'bg-red-500';
            if (c.status === 'scheduled') color = 'bg-purple-500';
            
            return {
                id: c.id,
                name: c.name,
                templateName: c.template_name || 'N/A',
                status: c.status,
                text: `Campaign "${c.name}" (Template: ${c.template_name || 'N/A'}) ${c.status}`,
                time: c.created_at,
                type: 'campaign',
                color
            };
        });

        res.json(activity);
    } catch (error) {
        console.error("Activity Fetch Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};
