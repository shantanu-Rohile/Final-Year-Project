// server/utils/cronJobs.js
import cron from 'node-cron';
import { checkAbandonedQuizzes } from '../controllers/quizController.js';

// Run every 5 minutes to check for abandoned quizzes
export const startCronJobs = () => {
  // Check abandoned quizzes every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('🔍 Checking for abandoned quizzes...');
    const count = await checkAbandonedQuizzes();
    if (count > 0) {
      console.log(`⚠️ Marked ${count} quiz(es) as abandoned`);
    }
  });

  console.log('✅ Cron jobs started');
};