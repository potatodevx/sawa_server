"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpService = exports.OtpService = void 0;
const twilio_1 = __importDefault(require("twilio"));
const prisma_1 = require("../lib/prisma");
const index_1 = require("../constants/index");
const logger_1 = require("../utils/logger");
const AppError_1 = require("../utils/AppError");
// ─── CONFIGURATION ──────────────────────────────────────────────────────────
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;
// Android SMS Retriever hash — appended to SMS so Android auto-detects the OTP.
// The hash is derived from the app package name + signing certificate, so it is
// UNIQUE per signing key. The value below is the hash for the direct-distribution
// APK (package `com.sawa.couplesapp`, signed with `sawa-release.keystore`).
//
// IMPORTANT:
//   - If the app is ever re-signed with a different keystore, this value MUST change.
//   - Google Play App Signing re-signs the app with Google's own key, which produces
//     a DIFFERENT hash. For a Play-distributed build, set ANDROID_APP_HASH in the env
//     to the Play "App signing key" hash (from Play Console → App integrity).
//   - The env var (when set) always overrides this default.
const DEFAULT_ANDROID_APP_HASH = 'AJnYV5HCtqV';
const ANDROID_APP_HASH = process.env.ANDROID_APP_HASH || DEFAULT_ANDROID_APP_HASH;
// Twilio is required — all three credentials must be set
const TWILIO_READY = !!(TWILIO_SID && TWILIO_AUTH && TWILIO_PHONE);
const twilioClient = TWILIO_READY
    ? (0, twilio_1.default)(TWILIO_SID, TWILIO_AUTH)
    : null;
function formatPhoneE164(phone) {
    const digits = phone.replace(/\D/g, '');
    if (phone.startsWith('+'))
        return phone;
    if (digits.length === 12 && digits.startsWith('91'))
        return `+${digits}`;
    if (digits.length === 10)
        return `+91${digits}`;
    return `+${digits}`;
}
class OtpService {
    /**
     * Generate a real OTP and send via Twilio SMS.
     * Throws if Twilio is not configured.
     */
    async generateAndStore(phone, coupleId, customMessage) {
        if (!TWILIO_READY || !twilioClient || !TWILIO_PHONE) {
            logger_1.logger.error('[OtpService] Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER.');
            throw new AppError_1.AppError('SMS service is not configured. Please contact support.', 503, 'SMS_NOT_CONFIGURED');
        }
        // Remove any existing OTP for this phone
        await prisma_1.prisma.otpToken.deleteMany({ where: { phone } });
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + index_1.OTP_EXPIRES_IN_MINUTES * 60 * 1000);
        await prisma_1.prisma.otpToken.create({
            data: { phone, coupleId, otpCode: code, expiresAt },
        });
        // SMS format for Android OTP auto-detect (must be < 140 bytes):
        //   - Must END with the 11-character app hash (SMS Retriever API requirement)
        //   - Must NOT start with "<#>" — on MIUI/Poco that prefix suppresses the
        //     keyboard OTP suggestion bar that lets users tap-to-fill the code
        //   - Keep the message human-readable so Android TextClassifier picks up the OTP
        const body = ANDROID_APP_HASH
            ? `[SAWA] Your verification code is: ${code}. Valid for ${index_1.OTP_EXPIRES_IN_MINUTES} minutes.\n${ANDROID_APP_HASH}`
            : (customMessage
                ? customMessage.replace('{{code}}', code)
                : `[SAWA] Your verification code is: ${code}. Valid for ${index_1.OTP_EXPIRES_IN_MINUTES} minutes.`);
        try {
            await twilioClient.messages.create({ body, from: TWILIO_PHONE, to: formatPhoneE164(phone) });
            logger_1.logger.info(`[OtpService] SMS sent to ${phone}`);
        }
        catch (err) {
            logger_1.logger.error(`[OtpService] Twilio SMS failed for ${phone}:`, err);
            throw new AppError_1.AppError('Failed to send OTP. Please try again.', 500, 'SMS_SEND_FAILED');
        }
    }
    /**
     * Verify OTP — strictly checks the stored code. No bypass allowed.
     */
    async verify(phone, enteredCode) {
        logger_1.logger.debug(`[OtpService] Verifying OTP for ${phone}`);
        const token = await prisma_1.prisma.otpToken.findFirst({
            where: { phone },
            orderBy: { createdAt: 'desc' },
        });
        if (!token) {
            return { valid: false, coupleId: null };
        }
        if (token.expiresAt < new Date()) {
            await prisma_1.prisma.otpToken.delete({ where: { id: token.id } });
            return { valid: false, coupleId: null };
        }
        if (enteredCode !== token.otpCode) {
            return { valid: false, coupleId: null };
        }
        const coupleId = token.coupleId;
        await prisma_1.prisma.otpToken.delete({ where: { id: token.id } });
        return { valid: true, coupleId };
    }
    /**
     * Get coupleId for a phone
     */
    async getEntityId(phone) {
        const token = await prisma_1.prisma.otpToken.findFirst({
            where: { phone },
            orderBy: { createdAt: 'desc' },
        });
        return token?.coupleId ?? null;
    }
    /**
     * Send SMS invitation via Twilio
     */
    async sendInvitation(phone, message) {
        if (!TWILIO_READY || !twilioClient || !TWILIO_PHONE) {
            logger_1.logger.warn(`[OtpService] Twilio not configured — invitation not sent to ${phone}`);
            return false;
        }
        try {
            await twilioClient.messages.create({ body: message, from: TWILIO_PHONE, to: formatPhoneE164(phone) });
            logger_1.logger.info(`[OtpService] Invitation sent to ${phone}`);
            return true;
        }
        catch (err) {
            logger_1.logger.error(`[OtpService] Invitation failed for ${phone}:`, err);
            return false;
        }
    }
}
exports.OtpService = OtpService;
exports.otpService = new OtpService();
//# sourceMappingURL=otp.service.js.map