# Firebase Project Configuration Guide

## Where to Add Your Firebase Project Configuration

You need to configure Firebase in **2 places**:

---

## 1. `.firebaserc` - Firebase CLI Project ID

**File:** `waitlist/.firebaserc`

**What to do:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Copy your **Project ID** (found in Project Settings → General → Project ID)
4. Open `waitlist/.firebaserc` and replace `"your-firebase-project-id"` with your actual Project ID

**Example:**
```json
{
  "projects": {
    "default": "pietwice-waitlist-abc123"
  }
}
```

**Why:** This tells Firebase CLI which project to deploy to when you run `firebase deploy`

---

## 2. `script.js` - Firebase SDK Configuration

**File:** `waitlist/script.js`

**What to do:**

### Step 1: Get Your Firebase Config
1. Go to Firebase Console → Your Project
2. Click the gear icon ⚙️ → **Project Settings**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (`</>`) to add a web app
5. Register your app (name it "Waitlist" or similar)
6. Copy the `firebaseConfig` object that appears

### Step 2: Update script.js
1. Open `waitlist/script.js`
2. Find the commented section at the top (lines 8-23)
3. **Uncomment** the Firebase import statements and config
4. **Replace** all the placeholder values with your actual config:

```javascript
// Uncomment these lines:
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyC...",           // Your actual API key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",   // Same as in .firebaserc
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
```

**Why:** This connects your webpage to Firebase Firestore to store waitlist emails

---

## Quick Setup Checklist

- [ ] Created Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
- [ ] Enabled **Firestore Database** (Create database → Start in test mode)
- [ ] Updated `.firebaserc` with your Project ID
- [ ] Added web app in Firebase Console
- [ ] Copied `firebaseConfig` from Firebase Console
- [ ] Updated `script.js` with your Firebase config (uncommented and filled in)
- [ ] Set up Firestore security rules (see README.md)
- [ ] Tested locally: `firebase serve --only hosting`
- [ ] Deployed: `firebase deploy --only hosting`

---

## Need Help?

- **Firebase Console:** https://console.firebase.google.com/
- **Firebase Docs:** https://firebase.google.com/docs
- **Project Settings:** Firebase Console → ⚙️ → Project Settings

---

## Example Values

Your config will look something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC1234567890abcdefghijklmnop",
  authDomain: "pietwice-waitlist.firebaseapp.com",
  projectId: "pietwice-waitlist",
  storageBucket: "pietwice-waitlist.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**Important:** Never commit your Firebase config with real API keys to public repositories if you have security rules that allow public access. For a waitlist, it's generally safe since you're only allowing writes, but be cautious.
