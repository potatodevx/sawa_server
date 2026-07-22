export declare class CommunityService {
    getAllCommunities(requestingCoupleId: string, cityFilter?: string): Promise<any>;
    invalidateCommListCache(coupleId: string): Promise<void>;
    getMyCommunities(requestingCoupleId: string): Promise<{
        _id: any;
        id: any;
        title: any;
        about: any;
        city: any;
        couples: any;
        imageUri: any;
        isMember: boolean;
        isAdmin: boolean;
        members: never[];
    }[]>;
    createCommunity(requestingCoupleId: string, data: any): Promise<{
        _id: string;
        id: string;
        name: string;
    }>;
    joinCommunity(requestingCoupleId: string, communityId: string): Promise<{
        status: string;
    }>;
    leaveCommunity(requestingCoupleId: string, communityId: string): Promise<{
        status: string;
    }>;
    processJoinRequest(requestingCoupleId: string, communityId: string, requestId: string, decision: 'accept' | 'reject'): Promise<{
        message: string;
    }>;
    getCommunityDetail(requestingCoupleId: string, communityId: string): Promise<{
        id: string;
        title: string;
        about: string | null;
        city: string;
        couples: number;
        imageUri: string | null;
        isMember: boolean;
        isAdmin: boolean;
        isRequested: boolean;
        isInvited: boolean;
        hosts: {
            id: string;
            coupleId: string;
            name: string;
            city: string;
            accent: string;
            image: string | null;
        }[];
        members: {
            id: any;
            coupleId: any;
            name: any;
            city: any;
            accent: string;
            image: any;
            isAlreadyMatched: boolean;
            matchId: any;
        }[];
        joinRequests: {
            id: any;
            coupleId: any;
            name: any;
            city: any;
            accent: string;
            image: any;
        }[];
    }>;
    updateCommunity(requestingCoupleId: string, communityId: string, data: {
        name?: string;
        description?: string;
        coverImageUrl?: string;
        coverImageBase64?: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        city: string;
        coverImageUrl: string | null;
        maxMembers: number;
        tags: string[];
    }>;
    deleteCommunity(requestingCoupleId: string, communityId: string): Promise<{
        success: boolean;
    }>;
    getInviteableCouples(requestingCoupleId: string, communityId: string): Promise<{
        id: any;
        coupleId: any;
        name: any;
        city: any;
        image: any;
        status: string;
    }[]>;
    inviteToCommunity(requestingCoupleId: string, communityId: string, invitedCoupleIds: string[]): Promise<{
        success: boolean;
    }>;
}
export declare const communityService: CommunityService;
//# sourceMappingURL=community.service.d.ts.map