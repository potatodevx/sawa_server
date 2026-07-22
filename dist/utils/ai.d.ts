/**
 * Generates one shared couple bio ("Who we are") and match criteria.
 * Bio is a single voice for the pair — not two separate partner bios.
 */
export declare const generateCoupleBio: (qaData: Array<{
    question: string;
    answers: string[];
}>) => Promise<{
    bio: string;
    matchCriteria: string[];
}>;
//# sourceMappingURL=ai.d.ts.map