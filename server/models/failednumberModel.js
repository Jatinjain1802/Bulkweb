import db from '../config/db.js';
export const FailedNumber ={
    add: async(phoneNumber, reason, campaignId, templateName)=>{
        const query = `INSERT IGNORE INTO failed_numbers (phone_number, reason, campaign_id, template_name) VALUES (?, ?, ?, ?)`;
        await db.execute(query,[phoneNumber, reason, campaignId, templateName]);
    },
    checkExists: async(phoneNumber)=>
    {
        if(!phoneNumber|| phoneNumber.length===0) return [];
        const placeholder = phoneNumber.map(()=>'?').join(',');
        const query= `SELECT phone_number FROM failed_numbers WHERE phone_number IN (${placeholder})`;
        const [rows] = await db.execute(query,phoneNumber);
        return rows.map(row=>row.phone_number);
    }
};