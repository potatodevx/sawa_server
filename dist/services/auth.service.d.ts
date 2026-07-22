import { TokenPair } from '../types/index';
export declare class AuthService {
    /**
     * STEP 1 — Send OTP
     */
    sendOtp(yourPhone: string, partnerPhone: string): Promise<{
        coupleId: string;
    }>;
    /**
     * STEP 2 — Verify OTP
     */
    verifyOtp(yourPhone: string, yourOtp: string, partnerPhone: string, partnerOtp: string): Promise<{
        coupleId: string;
        yourToken: TokenPair;
        partnerToken: TokenPair;
        yourUser: {
            id: string;
            name: string;
            role: string;
        };
    }>;
    /**
     * STEP 3 — Refresh
     */
    refreshAccessToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    /**
     * STEP 4 — Logout
     */
    logout(userId: string): Promise<void>;
    /**
     * LOGIN STEP 1
     * For bypass phones: skips OTP entirely and returns access/refresh tokens immediately.
     * For normal phones: sends OTP and returns only the coupleId.
     */
    loginSendOtp(phone: string): Promise<{
        coupleId: string;
        bypass?: true;
        accessToken?: string;
        refreshToken?: string;
        profile?: any;
        user?: {
            id: string;
            name: string;
            role: string;
        };
    }>;
    /**
     * LOGIN STEP 2
     */
    loginVerifyOtp(phone: string, otp: string): Promise<{
        coupleId: string;
        token: TokenPair;
        profile: any;
        user: {
            id: string;
            name: string;
            role: string;
        };
    }>;
    /**
     * RESEND OTP — only for one phone at a time.
     * Reuses the existing coupleId so the other partner's OTP is NOT affected.
     * Safe to call multiple times; each call replaces only that phone's OTP.
     */
    resendOtp(phone: string): Promise<void>;
    sendPartnerInvite(partnerPhone: string): Promise<boolean>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map