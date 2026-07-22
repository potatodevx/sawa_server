export declare class MatchService {
    /**
     * Fetches the discovery feed of couples
     */
    getDiscoveryFeed(requestingCoupleId: string, cityFilter?: string, coupleMongoId?: string): Promise<{
        _id: any;
        coupleId: any;
        profileName: any;
        primaryPhoto: any;
        location: any;
        bio: any;
        matchCriteria: any;
        relationshipStatus: any;
        distance: string;
        tags: string[];
        matchScore: number;
        insights: string[];
    }[]>;
    /**
     * Say hello (like) to a couple
     */
    sayHello(requestingCoupleId: string, targetCoupleIdStr: string, coupleMongoId?: string): Promise<{
        isMatch: boolean;
        matchId?: undefined;
        reason?: undefined;
    } | {
        isMatch: boolean;
        matchId: string;
        reason?: undefined;
    } | {
        isMatch: boolean;
        reason: string;
        matchId?: undefined;
    }>;
    skipCouple(requestingCoupleId: string, targetCoupleIdStr: string): Promise<{
        skipped: boolean;
    }>;
    getIncomingRequests(requestingCoupleId: string, coupleMongoId?: string): Promise<({
        _id: any;
        id: any;
        coupleId: any;
        profileName: any;
        primaryPhoto: any;
        location: any;
        distance: string;
        status: string;
        createdAt: any;
    } | null)[]>;
    getMatches(requestingCoupleId: string, coupleMongoId?: string): Promise<({
        _id: any;
        id: any;
        coupleId: any;
        profileName: any;
        primaryPhoto: any;
        location: any;
        distance: string;
        status: any;
        createdAt: any;
    } | null)[]>;
    /** Accept an incoming pending match by id (used by notifications + accept endpoint). */
    private acceptPendingMatchRecord;
    acceptMatch(requestingCoupleId: string, targetCoupleIdStr: string, coupleMongoId?: string, matchId?: string): Promise<{
        isMatch: boolean;
        matchId?: undefined;
        reason?: undefined;
    } | {
        isMatch: boolean;
        matchId: string;
        reason?: undefined;
    } | {
        isMatch: boolean;
        reason: string;
        matchId?: undefined;
    } | {
        isMatch: boolean;
        matchId: string;
        otherCoupleId: string;
    }>;
    rejectMatch(requestingCoupleId: string, targetCoupleIdStr: string): Promise<{
        success: boolean;
    }>;
    refreshDiscovery(requestingCoupleId: string): Promise<{
        success: boolean;
    }>;
    blockCouple(requestingCoupleId: string, targetCoupleIdStr: string): Promise<{
        success: boolean;
    }>;
    /**
     * Unfriend a couple — removes the accepted match so both sides can reconnect
     * via say-hello again. Does NOT block or add to blocked list.
     */
    unfriendCouple(requestingCoupleId: string, targetCoupleIdStr: string): Promise<{
        success: boolean;
    }>;
}
export declare const matchService: MatchService;
//# sourceMappingURL=match.service.d.ts.map