/**
 * PayItForward Payment Scheduler
 * Cloudflare Worker for automated payment reminders and payout processing
 */

const API_URL = 'YOUR_BACKEND_URL'; // Replace with actual backend URL
const API_SECRET = 'YOUR_API_SECRET'; // Replace with actual secret for authentication

/**
 * Main scheduled event handler
 * Runs daily at midnight UTC
 */
addEventListener('scheduled', event => {
  event.waitUntil(handleScheduledEvent(event.scheduledTime));
});

/**
 * HTTP handler for manual triggers
 */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Handle scheduled events
 */
async function handleScheduledEvent(scheduledTime) {
  console.log(`[${new Date(scheduledTime).toISOString()}] Running scheduled payment tasks`);

  try {
    // Run all scheduled tasks in parallel
    await Promise.all([
      sendPaymentReminders(),
      processScheduledPayouts(),
      updateCreditScores(),
      checkMissedPayments()
    ]);

    console.log('✅ All scheduled tasks completed successfully');
  } catch (error) {
    console.error('❌ Error in scheduled tasks:', error);
  }
}

/**
 * Send payment reminders to users with upcoming due dates
 */
async function sendPaymentReminders() {
  console.log('📧 Sending payment reminders...');

  const response = await fetch(`${API_URL}/payments/upcoming-all`, {
    headers: {
      'Authorization': `Bearer ${API_SECRET}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch upcoming payments: ${response.statusText}`);
  }

  const data = await response.json();
  const upcomingPayments = data.data || [];

  console.log(`Found ${upcomingPayments.length} upcoming payments`);

  // Filter payments due in next 3 days
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const paymentsThatNeedReminders = upcomingPayments.filter(payment => {
    const dueDate = new Date(payment.due_date);
    return dueDate <= threeDaysFromNow;
  });

  console.log(`Sending reminders for ${paymentsThatNeedReminders.length} payments`);

  // Send reminder for each payment (in production, batch these)
  for (const payment of paymentsThatNeedReminders) {
    await sendReminder(payment);
  }
}

/**
 * Send individual payment reminder
 */
async function sendReminder(payment) {
  try {
    const response = await fetch(`${API_URL}/notifications/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: payment.user_id,
        type: 'payment_reminder',
        title: 'Payment Due Soon',
        message: `Your payment of $${payment.amount} for ${payment.circle_name} is due on ${payment.due_date}`,
        action_url: `/payments`
      })
    });

    if (!response.ok) {
      console.error(`Failed to send reminder to user ${payment.user_id}`);
    }
  } catch (error) {
    console.error(`Error sending reminder:`, error);
  }
}

/**
 * Process scheduled payouts
 */
async function processScheduledPayouts() {
  console.log('💰 Processing scheduled payouts...');

  const response = await fetch(`${API_URL}/circles/payouts-due`, {
    headers: {
      'Authorization': `Bearer ${API_SECRET}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch due payouts: ${response.statusText}`);
  }

  const data = await response.json();
  const duePayouts = data.data || [];

  console.log(`Found ${duePayouts.length} payouts to process`);

  for (const payout of duePayouts) {
    await processPayout(payout);
  }
}

/**
 * Process individual payout
 */
async function processPayout(payout) {
  try {
    const response = await fetch(`${API_URL}/payouts/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        circle_id: payout.circle_id,
        recipient_id: payout.recipient_id,
        amount: payout.amount
      })
    });

    if (response.ok) {
      console.log(`✅ Processed payout for circle ${payout.circle_id}`);
    } else {
      console.error(`❌ Failed to process payout for circle ${payout.circle_id}`);
    }
  } catch (error) {
    console.error(`Error processing payout:`, error);
  }
}

/**
 * Update credit scores based on recent activity
 */
async function updateCreditScores() {
  console.log('📈 Updating credit scores...');

  const response = await fetch(`${API_URL}/credit/batch-update`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_SECRET}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.ok) {
    const data = await response.json();
    console.log(`✅ Updated ${data.count} credit scores`);
  } else {
    console.error('❌ Failed to update credit scores');
  }
}

/**
 * Check for missed payments and apply penalties
 */
async function checkMissedPayments() {
  console.log('⚠️ Checking for missed payments...');

  const response = await fetch(`${API_URL}/payments/check-missed`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_SECRET}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.ok) {
    const data = await response.json();
    console.log(`Found ${data.count} missed payments`);
  } else {
    console.error('❌ Failed to check missed payments');
  }
}

/**
 * Handle HTTP requests (for manual triggers and testing)
 */
async function handleRequest(request) {
  const url = new URL(request.url);

  // Health check
  if (url.pathname === '/health') {
    return new Response(JSON.stringify({
      status: 'healthy',
      service: 'PayItForward Payment Scheduler',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Manual trigger endpoint (requires authentication)
  if (url.pathname === '/trigger' && request.method === 'POST') {
    const authHeader = request.headers.get('Authorization');

    if (authHeader !== `Bearer ${API_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    await handleScheduledEvent(Date.now());

    return new Response(JSON.stringify({
      success: true,
      message: 'Scheduled tasks triggered manually'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response('Not Found', { status: 404 });
}

// Cron trigger configuration (add this to wrangler.toml):
// [triggers]
// crons = ["0 0 * * *"]  # Run daily at midnight UTC
