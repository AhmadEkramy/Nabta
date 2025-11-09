# 🔥 URGENT: Fix Firebase Permissions Error

## The Problem
You're getting "Missing or insufficient permissions" because your Firestore database has restrictive security rules that prevent reading/writing user data.

## Quick Fix (5 minutes)

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **nabta-89a5b**
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab

### Step 2: Update Rules (Temporary - for testing)
Replace the current rules with this temporary version:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Temporary rules for testing - REPLACE WITH SECURE RULES LATER
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 3: Publish Rules
1. Click **Publish** button
2. Wait for the rules to deploy (usually takes a few seconds)

## Test Your App
After updating the rules:
1. Refresh your app
2. Try signing up with a new account
3. The permissions error should be gone

## ⚠️ IMPORTANT: Security Notice
The rules above are **VERY PERMISSIVE** and only for testing. Once your app is working, replace them with the secure rules from `firestore.rules` file.

## Secure Rules (Use After Testing)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading other users' basic info
    }
    
    // Posts rules
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        request.auth.uid in resource.data.likedBy
      );
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Other collections...
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if false; // Deny writes to undefined collections
    }
  }
}
```

## Alternative: Enable Test Mode (Not Recommended)
If you're still having issues, you can temporarily enable "Test Mode":
1. In Firestore Rules tab
2. Click "Start in test mode"
3. This allows all reads/writes for 30 days (NOT SECURE)

## Verify Rules Are Working
After updating rules, check the browser console. The error should be gone and you should see successful authentication.