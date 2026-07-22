"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInsights = exports.unfriendCouple = exports.blockCouple = exports.rejectMatch = exports.acceptMatch = exports.getIncomingRequests = exports.refreshDiscovery = exports.getMatches = exports.skipCouple = exports.sayHello = exports.getDiscoveryFeed = exports.validateMatchAction = void 0;
const zod_1 = require("zod");
const match_service_1 = require("../services/match.service");
const response_1 = require("../utils/response");
const validate_1 = require("../middleware/validate");
// ─── Validation ─────────────────────────────────────────────────────────────
const MatchActionSchema = zod_1.z.object({
    targetCoupleId: zod_1.z.string().min(1, 'Target couple ID is required'),
    matchId: zod_1.z.string().optional(), // optional: accept by exact matchId for reliability
});
exports.validateMatchAction = (0, validate_1.validate)(MatchActionSchema);
// ─── Controllers ────────────────────────────────────────────────────────────
/**
 * GET /api/v1/matches/discovery
 * Fetches the discovery feed of un-interacted couples for the requesting couple.
 */
const getDiscoveryFeed = async (req, res) => {
    const { coupleId, coupleMongoId } = req.user;
    const { city } = req.query;
    const couples = await match_service_1.matchService.getDiscoveryFeed(coupleId, city, coupleMongoId);
    (0, response_1.sendSuccess)({ res, statusCode: 200, data: { couples } });
};
exports.getDiscoveryFeed = getDiscoveryFeed;
/**
 * POST /api/v1/matches/say-hello
 * Send a hello/like to a couple.
 */
const sayHello = async (req, res) => {
    const { coupleId, coupleMongoId } = req.user;
    const { targetCoupleId } = req.body;
    const result = await match_service_1.matchService.sayHello(coupleId, targetCoupleId, coupleMongoId);
    (0, response_1.sendSuccess)({ res, statusCode: 200, message: 'Hello sent', data: result });
};
exports.sayHello = sayHello;
/**
 * POST /api/v1/matches/skip
 * Skip/pass on a couple so they don't appear in the feed again.
 */
const skipCouple = async (req, res) => {
    const { coupleId } = req.user;
    const { targetCoupleId } = req.body;
    const result = await match_service_1.matchService.skipCouple(coupleId, targetCoupleId);
    (0, response_1.sendSuccess)({ res, statusCode: 200, message: 'Profile skipped', data: result });
};
exports.skipCouple = skipCouple;
const getMatches = async (req, res) => {
    const { coupleId, coupleMongoId } = req.user;
    const matches = await match_service_1.matchService.getMatches(coupleId, coupleMongoId);
    (0, response_1.sendSuccess)({ res, statusCode: 200, data: { matches } });
};
exports.getMatches = getMatches;
const refreshDiscovery = async (req, res) => {
    const { coupleId } = req.user;
    await match_service_1.matchService.refreshDiscovery(coupleId);
    (0, response_1.sendSuccess)({ res, statusCode: 200, message: 'Discovery feed reset successful' });
};
exports.refreshDiscovery = refreshDiscovery;
const getIncomingRequests = async (req, res) => {
    const { coupleId, coupleMongoId } = req.user;
    const requests = await match_service_1.matchService.getIncomingRequests(coupleId, coupleMongoId);
    (0, response_1.sendSuccess)({ res, statusCode: 200, data: { requests } });
};
exports.getIncomingRequests = getIncomingRequests;
const acceptMatch = async (req, res) => {
    const { coupleId, coupleMongoId } = req.user;
    const { targetCoupleId, matchId } = req.body;
    const result = await match_service_1.matchService.acceptMatch(coupleId, targetCoupleId, coupleMongoId, matchId);
    (0, response_1.sendSuccess)({ res, statusCode: 200, message: 'Match accepted', data: result });
};
exports.acceptMatch = acceptMatch;
const rejectMatch = async (req, res) => {
    const { coupleId } = req.user;
    const { targetCoupleId } = req.body;
    const result = await match_service_1.matchService.rejectMatch(coupleId, targetCoupleId);
    (0, response_1.sendSuccess)({ res, statusCode: 200, message: 'Match rejected', data: result });
};
exports.rejectMatch = rejectMatch;
const blockCouple = async (req, res) => {
    const { coupleId } = req.user;
    const { targetCoupleId } = req.body;
    const result = await match_service_1.matchService.blockCouple(coupleId, targetCoupleId);
    (0, response_1.sendSuccess)({ res, statusCode: 200, message: 'Couple blocked successfully', data: result });
};
exports.blockCouple = blockCouple;
const unfriendCouple = async (req, res) => {
    const { coupleId } = req.user;
    const { targetCoupleId } = req.body;
    const result = await match_service_1.matchService.unfriendCouple(coupleId, targetCoupleId);
    (0, response_1.sendSuccess)({ res, statusCode: 200, message: 'Couple unfriended successfully', data: result });
};
exports.unfriendCouple = unfriendCouple;
const getInsights = async (_req, _res) => {
    // Returns insights comparing the logged in couple with a target couple
};
exports.getInsights = getInsights;
//# sourceMappingURL=match.controller.js.map