import type { NotificationType } from '@prisma/client';
type NotificationData = Record<string, unknown>;
/** Collapse duplicate rows (same sender + same action) — keep the newest. */
export declare function dedupeNotificationsForList<T extends {
    id: string;
    type: string;
    senderId?: string | null;
    title?: string;
    message?: string;
    data?: unknown;
    createdAt: Date | string;
    read?: boolean;
}>(notifications: T[]): T[];
/** Replace older duplicates instead of inserting another row. */
export declare function upsertGroupedNotification(params: {
    recipientId: string;
    senderId?: string;
    type: NotificationType;
    title: string;
    message: string;
    data: NotificationData;
    groupKey: string;
    emitRealtime?: boolean;
}): Promise<{
    message: string;
    type: import(".prisma/client").$Enums.NotificationType;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    senderId: string | null;
    recipientId: string;
    title: string;
    data: import("@prisma/client/runtime/library").JsonValue | null;
    read: boolean;
}>;
/** Remove all notifications tied to a match (pending + connected + stray messages banner). */
export declare function clearNotificationsForMatch(matchId: string, options?: {
    keepConnectedForRecipients?: string[];
}): Promise<void>;
/** One pending connection request per matchId (per recipient). */
export declare function upsertMatchPendingNotification(params: {
    recipientId: string;
    senderId: string;
    matchId: string;
    profileName: string;
    primaryPhoto?: string | null;
    location?: string | null;
    bio?: string | null;
    tags?: unknown;
    vibes?: unknown;
    matchCriteria?: unknown;
}): Promise<{
    message: string;
    type: import(".prisma/client").$Enums.NotificationType;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    senderId: string | null;
    recipientId: string;
    title: string;
    data: import("@prisma/client/runtime/library").JsonValue | null;
    read: boolean;
}>;
/** One "connected" row per match per recipient. */
export declare function upsertMatchConnectedNotification(params: {
    recipientId: string;
    senderId: string;
    matchId: string;
    coupleId: string;
    profileName: string;
    primaryPhoto?: string | null;
    location?: string | null;
    bio?: string | null;
    tags?: unknown;
    vibes?: unknown;
    matchCriteria?: unknown;
}): Promise<{
    message: string;
    type: import(".prisma/client").$Enums.NotificationType;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    senderId: string | null;
    recipientId: string;
    title: string;
    data: import("@prisma/client/runtime/library").JsonValue | null;
    read: boolean;
}>;
export {};
//# sourceMappingURL=notification.service.d.ts.map