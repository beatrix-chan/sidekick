"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.sendOTP = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const resend_1 = require("resend");
const crypto = __importStar(require("crypto"));
// ─── Init ────────────────────────────────────────────────────────────────────
admin.initializeApp();
const db = admin.firestore();
// Resend client — key stored as a Firebase Secret (RESEND_API_KEY)
// Set it with: firebase functions:secrets:set RESEND_API_KEY
const getResend = () => new resend_1.Resend(process.env.RESEND_API_KEY);
// ─── Helpers ─────────────────────────────────────────────────────────────────
const DURHAM_REGEX = /^[a-zA-Z]{4}[0-9]{2}@durham\.ac\.uk$/;
function generate6DigitOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function hashOTP(otp) {
    return crypto.createHash("sha256").update(otp).digest("hex");
}
// ─── sendOTP ─────────────────────────────────────────────────────────────────
/**
 * Generates a 6-digit OTP, stores it in Firestore, and sends it via Resend.
 * Called from the app's RegisterScreen before any Firebase account is created.
 */
exports.sendOTP = (0, https_1.onCall)({ secrets: ["RESEND_API_KEY"] }, async (request) => {
    var _a, _b;
    const email = ((_b = (_a = request.data) === null || _a === void 0 ? void 0 : _a.email) !== null && _b !== void 0 ? _b : "").trim().toLowerCase();
    if (!DURHAM_REGEX.test(email)) {
        throw new https_1.HttpsError("invalid-argument", "Please use a valid Durham University email (e.g. abcd12@durham.ac.uk).");
    }
    const otp = generate6DigitOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    // Store hashed OTP in Firestore
    await db.collection("otpVerifications").doc(email).set({
        hashedOTP: hashOTP(otp),
        expiresAt,
        verified: false,
    });
    // Send email via Resend
    const resend = getResend();
    const { error } = await resend.emails.send({
        from: "SideKick <noreply@sidekick-app.com>", // update with your verified Resend domain
        to: [email],
        subject: "Your SideKick verification code",
        html: `
                <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f4ece4; border-radius: 16px;">
                    <h2 style="color: #5b798a; font-style: italic; margin-bottom: 8px;">SideKick</h2>
                    <p style="color: #85817d; font-size: 16px;">Your verification code is:</p>
                    <div style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #5b798a; margin: 24px 0; text-align: center;">
                        ${otp}
                    </div>
                    <p style="color: #85817d; font-size: 13px;">This code expires in 10 minutes. Do not share it with anyone.</p>
                </div>
            `,
    });
    if (error) {
        console.error("Resend error:", error);
        throw new https_1.HttpsError("internal", "Failed to send the verification email. Please try again.");
    }
    return { success: true };
});
// ─── verifyOTP ───────────────────────────────────────────────────────────────
/**
 * Checks the OTP the user entered against the stored hash.
 * If valid, marks the otpVerification doc as verified so the client
 * can safely create the Firebase account.
 */
exports.verifyOTP = (0, https_1.onCall)({ secrets: ["RESEND_API_KEY"] }, async (request) => {
    var _a, _b, _c, _d;
    const email = ((_b = (_a = request.data) === null || _a === void 0 ? void 0 : _a.email) !== null && _b !== void 0 ? _b : "").trim().toLowerCase();
    const otp = ((_d = (_c = request.data) === null || _c === void 0 ? void 0 : _c.otp) !== null && _d !== void 0 ? _d : "").trim();
    if (!email || !otp) {
        throw new https_1.HttpsError("invalid-argument", "Email and OTP are required.");
    }
    const docRef = db.collection("otpVerifications").doc(email);
    const snap = await docRef.get();
    if (!snap.exists) {
        throw new https_1.HttpsError("not-found", "No verification code found. Please request a new one.");
    }
    const { hashedOTP, expiresAt } = snap.data();
    if (Date.now() > expiresAt) {
        await docRef.delete();
        throw new https_1.HttpsError("deadline-exceeded", "Your code has expired. Please request a new one.");
    }
    if (hashOTP(otp) !== hashedOTP) {
        throw new https_1.HttpsError("unauthenticated", "Incorrect code. Please try again.");
    }
    // Mark as verified so the client knows it's safe to create the account
    await docRef.update({ verified: true });
    return { success: true };
});
//# sourceMappingURL=index.js.map