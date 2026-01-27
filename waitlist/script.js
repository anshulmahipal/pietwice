// Waitlist Form Handler
// This script handles form submission and integrates with Firebase Firestore

// ============================================================================
// FIREBASE CONFIGURATION - REQUIRED
// ============================================================================
// To set up Firebase:
// 1. Go to Firebase Console: https://console.firebase.google.com/
// 2. Create/select a project
// 3. Add a Web app (click </> icon)
// 4. Copy the firebaseConfig object
// 5. Uncomment the code below and paste your config
// 6. See FIREBASE_SETUP.md for detailed instructions
// ============================================================================

/*
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ⬇️ PASTE YOUR FIREBASE CONFIG HERE ⬇️
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
*/

// DOM Elements
const waitlistForm = document.getElementById('waitlist-form');
const emailInput = document.getElementById('email');
const submitBtn = document.getElementById('submit-btn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Utility Functions
function showSuccess() {
  waitlistForm.style.display = 'none';
  errorMessage.style.display = 'none';
  successMessage.style.display = 'block';
  successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showError(message) {
  errorMessage.style.display = 'block';
  errorMessage.querySelector('p').textContent = message || 'Something went wrong. Please try again later.';
  errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 5000);
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  if (isLoading) {
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
  } else {
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
  }
}

function validateEmail(email) {
  return emailRegex.test(email.trim());
}

// Option 1: Firebase Firestore Integration
async function submitToFirestore(email) {
  try {
    // Uncomment when Firebase is configured
    /*
    const docRef = await addDoc(collection(db, 'waitlist'), {
      email: email.trim().toLowerCase(),
      timestamp: serverTimestamp(),
      source: 'website',
      status: 'pending'
    });
    return { success: true, id: docRef.id };
    */
    
    // Temporary: Log to console (remove in production)
    console.log('Would submit to Firestore:', email);
    return { success: true };
  } catch (error) {
    console.error('Firestore error:', error);
    throw error;
  }
}

// Option 2: Firebase Cloud Functions (Alternative)
async function submitToCloudFunction(email) {
  try {
    // Replace with your Cloud Function URL
    const functionUrl = 'https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/addToWaitlist';
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        timestamp: new Date().toISOString(),
        source: 'website'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Cloud Function error:', error);
    throw error;
  }
}

// Option 3: Simple Email Service (e.g., EmailJS, Formspree, etc.)
async function submitToEmailService(email) {
  try {
    // Example using EmailJS (you'll need to set up an account)
    // Replace with your EmailJS service ID and template ID
    /*
    const serviceId = 'YOUR_SERVICE_ID';
    const templateId = 'YOUR_TEMPLATE_ID';
    const publicKey = 'YOUR_PUBLIC_KEY';
    
    await emailjs.send(serviceId, templateId, {
      to_email: 'your-email@example.com',
      from_email: email,
      message: `New waitlist signup: ${email}`
    }, publicKey);
    */
    
    // Temporary: Log to console (remove in production)
    console.log('Would send email:', email);
    return { success: true };
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

// Main Form Handler
async function handleSubmit(event) {
  event.preventDefault();
  
  const email = emailInput.value.trim();
  
  // Validate email
  if (!email) {
    showError('Please enter your email address.');
    emailInput.focus();
    return;
  }
  
  if (!validateEmail(email)) {
    showError('Please enter a valid email address.');
    emailInput.focus();
    return;
  }
  
  setLoading(true);
  errorMessage.style.display = 'none';
  
  try {
    // Choose your submission method:
    // Option 1: Firebase Firestore (recommended)
    await submitToFirestore(email);
    
    // Option 2: Firebase Cloud Functions
    // await submitToCloudFunction(email);
    
    // Option 3: Email Service
    // await submitToEmailService(email);
    
    // Success
    showSuccess();
    emailInput.value = '';
    
    // Optional: Track conversion (Google Analytics, etc.)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'waitlist_signup', {
        event_category: 'engagement',
        event_label: 'waitlist_form'
      });
    }
    
  } catch (error) {
    console.error('Submission error:', error);
    showError('Failed to join waitlist. Please try again later.');
  } finally {
    setLoading(false);
  }
}

// Form Event Listener
waitlistForm.addEventListener('submit', handleSubmit);

// Optional: Add email input validation feedback
emailInput.addEventListener('blur', function() {
  const email = this.value.trim();
  if (email && !validateEmail(email)) {
    this.style.borderColor = '#FF6347';
  } else {
    this.style.borderColor = '';
  }
});

emailInput.addEventListener('input', function() {
  if (this.style.borderColor === 'rgb(255, 99, 71)') {
    const email = this.value.trim();
    if (validateEmail(email) || !email) {
      this.style.borderColor = '';
    }
  }
});

// Optional: Prevent multiple rapid submissions
let lastSubmissionTime = 0;
const MIN_SUBMISSION_INTERVAL = 2000; // 2 seconds

waitlistForm.addEventListener('submit', function(event) {
  const now = Date.now();
  if (now - lastSubmissionTime < MIN_SUBMISSION_INTERVAL) {
    event.preventDefault();
    return false;
  }
  lastSubmissionTime = now;
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Focus email input for better UX
  emailInput.focus();
  
  // Optional: Check if user already submitted (using localStorage)
  const submittedEmail = localStorage.getItem('waitlist_submitted');
  if (submittedEmail) {
    emailInput.value = submittedEmail;
    // Optionally show a message that they've already signed up
  }
  
  // Save email to localStorage on successful submission
  const originalHandleSubmit = handleSubmit;
  // This will be handled in the success callback
});

// Update handleSubmit to save to localStorage
const originalShowSuccess = showSuccess;
showSuccess = function() {
  const email = emailInput.value.trim();
  if (email) {
    localStorage.setItem('waitlist_submitted', email);
  }
  originalShowSuccess();
};
