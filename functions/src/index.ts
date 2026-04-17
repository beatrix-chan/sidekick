import * as admin from "firebase-admin";

// ─── Init ────────────────────────────────────────────────────────────────────
admin.initializeApp();

// Authentication is handled entirely client-side using Firebase Auth's
// email/password flow with RegEx-based Durham email validation.
// No Cloud Functions are required for the current auth implementation.
//
// Add server-side logic here if needed in future (e.g. custom claims,
// Firestore triggers, scheduled jobs, etc.)
