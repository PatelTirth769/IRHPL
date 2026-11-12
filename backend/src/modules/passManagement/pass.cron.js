const cron = require('node-cron');
const passService = require('./pass.service');
const { sendEmail } = require('../../services/email.service');
const { db } = require('../../config/firebase');

const PASS_COLLECTION = 'passes';

// Generic helper to send email and log it
const sendReminder = async (pass, type, subject, text) => {
  if (pass.remindersSent?.includes(type)) return;
  
  try {
    // In a real app we'd get the assigned HR email, for now we use a default
    const to = 'admin@irhpl.com'; 
    await sendEmail(to, subject, text);
    
    await db().collection(PASS_COLLECTION).doc(pass.id).update({
      remindersSent: [...(pass.remindersSent || []), type]
    });
  } catch (error) {
    console.error(`Failed to send reminder ${type} for pass ${pass.id}`, error);
  }
};

const checkPassReminders = async () => {
  console.log('Running daily pass reminders check...');
  const passes = await passService.getPasses();
  const now = new Date();

  for (const pass of passes) {
    // 1. C&A Postal Receipt Overdue
    if (pass.status === 'ca_applied' && pass.dueDate) {
      const dueDate = new Date(pass.dueDate);
      const daysOverdue = (now - dueDate) / (1000 * 60 * 60 * 24);
      
      if (daysOverdue > 0 && daysOverdue <= 2) {
        await sendReminder(
          pass, 
          `ca_overdue_${pass.id}_day1`,
          `Overdue C&A Postal Receipt - ${pass.applicantName}`,
          `The C&A postal receipt for ${pass.applicantName} was due on ${dueDate.toLocaleDateString()}. Please submit it to the Pass Office immediately.`
        );
      } else if (daysOverdue > 2) {
        await sendReminder(
          pass,
          `ca_overdue_${pass.id}_escalated`,
          `ESCALATION: Overdue C&A Postal Receipt - ${pass.applicantName}`,
          `The C&A postal receipt for ${pass.applicantName} is more than 2 days overdue. Immediate action is required.`
        );
      }
    }

    // 2. AVSEC Link Not Received
    if (pass.status === 'avsec_training_applied') {
      const historyEntry = pass.statusHistory?.find(h => h.status === 'avsec_training_applied');
      if (historyEntry) {
        const daysSince = (now - new Date(historyEntry.date)) / (1000 * 60 * 60 * 24);
        if (daysSince > 3) {
          await sendReminder(
            pass,
            `avsec_link_delay_${pass.id}`,
            `Action Required: AVSEC Link Delayed - ${pass.applicantName}`,
            `AVSEC training was applied for ${pass.applicantName} more than 3 days ago. Please visit the Pass Office for manual link regeneration.`
          );
        }
      }
    }

    // 3. Expiries
    if (pass.documents && pass.documents.length > 0) {
      for (const doc of pass.documents) {
        if (!doc.expiryDate) continue;
        const daysToExpiry = (new Date(doc.expiryDate) - now) / (1000 * 60 * 60 * 24);
        
        if (daysToExpiry > 0 && daysToExpiry <= 30 && daysToExpiry > 7) {
          await sendReminder(
            pass,
            `expiry_30_${pass.id}_${doc.type}`,
            `Expiring Soon (30 Days): ${doc.type} - ${pass.applicantName}`,
            `The ${doc.type} for ${pass.applicantName} expires in less than 30 days.`
          );
        } else if (daysToExpiry > 0 && daysToExpiry <= 7) {
          await sendReminder(
            pass,
            `expiry_7_${pass.id}_${doc.type}`,
            `URGENT: Expiring in 7 Days: ${doc.type} - ${pass.applicantName}`,
            `The ${doc.type} for ${pass.applicantName} expires in less than 7 days. Please renew immediately.`
          );
        }
      }
    }
  }
};

// Schedule job to run every day at 8:00 AM
const startCron = () => {
  cron.schedule('0 8 * * *', checkPassReminders);
  console.log('Pass Reminders Cron Job started.');
};

module.exports = { startCron, checkPassReminders };
