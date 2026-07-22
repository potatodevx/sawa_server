export type GeoPoint = {
    lat: number;
    lng: number;
};
export declare function cityCentroid(city?: string | null): GeoPoint | null;
export declare function coupleCoordinates(couple: {
    locationLatitude?: number | null;
    locationLongitude?: number | null;
    locationCity?: string | null;
}): GeoPoint | null;
/** Great-circle distance in kilometres. */
export declare function distanceKmBetween(a: GeoPoint, b: GeoPoint): number;
export declare function formatDistanceLabel(km: number | null | undefined): string;
export declare function distanceLabelBetween(viewer: {
    locationLatitude?: number | null;
    locationLongitude?: number | null;
    locationCity?: string | null;
}, other: {
    locationLatitude?: number | null;
    locationLongitude?: number | null;
    locationCity?: string | null;
}): string;
//# sourceMappingURL=geo.d.ts.map