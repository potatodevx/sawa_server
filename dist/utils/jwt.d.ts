export interface JwtPayload {
    userId: string;
    coupleMongoId?: string;
    coupleId?: string;
    type: 'access' | 'refresh';
}
export declare const signAccessToken: (payload: Omit<JwtPayload, "type">) => string;
export declare const signRefreshToken: (payload: Omit<JwtPayload, "type">) => string;
export declare const verifyAccessToken: (token: string) => JwtPayload;
export declare const verifyRefreshToken: (token: string) => JwtPayload;
//# sourceMappingURL=jwt.d.ts.map