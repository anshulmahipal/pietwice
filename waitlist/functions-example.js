// Example Cloud Function for handling waitlist submissions
// Place this in: waitlist/functions/index.js
// Then run: npm install firebase-functions firebase-admin
// Deploy with: firebase deploy --only functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Cloud Function to add email to waitlist
 * Endpoint: https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/addToWaitlist
 */
exports.addToWaitlist = functions.https.onRequest(async (req, res) => {
  // Enable CORS for web requests
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  const { email } = req.body;

  // Validate email
  if (!email) {
    return res.status(400).json({ 
      error: 'Email is required' 
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Invalid email format' 
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check if email already exists
    const existingQuery = await admin
      .firestore()
      .collection('waitlist')
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      return res.status(200).json({ 
        success: true,
        message: 'Email already registered',
        duplicate: true
      });
    }

    // Add to waitlist
    const docRef = await admin.firestore().collection('waitlist').add({
      email: normalizedEmail,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      source: req.body.source || 'website',
      status: 'pending',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'unknown'
    });

    // Optional: Send notification email or trigger webhook
    // await sendNotificationEmail(normalizedEmail);
    // await triggerWebhook(normalizedEmail);

    return res.status(200).json({ 
      success: true,
      message: 'Successfully added to waitlist',
      id: docRef.id
    });

  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to add email to waitlist. Please try again later.'
    });
  }
});

/**
 * Optional: Function to send welcome email
 * Requires email service integration (SendGrid, Mailgun, etc.)
 */
async function sendNotificationEmail(email) {
  // Example using SendGrid (install: npm install @sendgrid/mail)
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: email,
    from: 'noreply@pietwice.app',
    subject: 'Welcome to pietwice waitlist!',
    text: 'Thank you for joining the pietwice waitlist...',
    html: '<p>Thank you for joining the pietwice waitlist...</p>'
  };
  
  await sgMail.send(msg);
  */
}

/**
 * Optional: Function to trigger webhook
 */
async function triggerWebhook(email) {
  // Example webhook call
  /*
  const axios = require('axios');
  await axios.post(process.env.WEBHOOK_URL, {
    email: email,
    event: 'waitlist_signup',
    timestamp: new Date().toISOString()
  });
  */
}
