"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processJoinRequest = exports.getInviteableCouples = exports.deleteCommunity = exports.updateCommunity = exports.inviteToCommunity = exports.leaveCommunity = exports.joinCommunity = exports.createCommunity = exports.getCommunityDetail = exports.getMyCommunities = exports.getAllCommunities = exports.validateJoinCommunity = exports.validateCreateCommunity = void 0;
const zod_1 = require("zod");
const community_service_1 = require("../services/community.service");
const response_1 = require("../utils/response");
const validate_1 = require("../middleware/validate");
const AppError_1 = require("../utils/AppError");
// ─── Validation ─────────────────────────────────────────────────────────────
const CreateCommunitySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    description: zod_1.z.string().optional(),
    city: zod_1.z.string().min(1, 'City is required'),
    coverImageUrl: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    invitedCoupleIds: zod_1.z.array(zod_1.z.string()).optional(),
});
const JoinCommunitySchema = zod_1.z.object({
    note: zod_1.z.string().optional(),
});
exports.validateCreateCommunity = (0, validate_1.validate)(CreateCommunitySchema);
exports.validateJoinCommunity = (0, validate_1.validate)(JoinCommunitySchema);
// ─── Controllers ────────────────────────────────────────────────────────────
const getAllCommunities = async (req, res) => {
    const { coupleId } = req.user;
    const { city } = req.query;
    const communities = await community_service_1.communityService.getAllCommunities(coupleId, city);
    (0, response_1.sendSuccess)({ res, statusCode: 200, data: { communities } });
};
exports.getAllCommunities = getAllCommunities;
const getMyCommunities = async (req, res) => {
    const { coupleId } = req.user;
    const communities = await community_service_1.communityService.getMyCommunities(coupleId);
    (0, response_1.sendSuccess)({ res, statusCode: 200, data: { communities } });
};
exports.getMyCommunities = getMyCommunities;
const getCommunityDetail = async (req, res) => {
    const { coupleId } = req.user;
    const { id } = req.params;
    const community = await community_service_1.communityService.getCommunityDetail(coupleId, id);
    (0, response_1.sendSuccess)({ res, statusCode: 200, data: { community } });
};
exports.getCommunityDetail = getCommunityDetail;
const createCommunity = async (req, res) => {
    const { coupleId } = req.user;
    const data = req.body;
    const community = await community_service_1.communityService.createCommunity(coupleId, {
        name: data.name,
        description: data.description,
        city: data.city,
        coverImageUrl: data.coverImageUrl,
        tags: data.tags || [],
        invitedCoupleIds: data.invitedCoupleIds || [],
    });
    (0, response_1.sendSuccess)({
        res,
        statusCode: 201,
        data: { community },
        message: 'Community created successfully!'
    });
};
exports.createCommunity = createCommunity;
const joinCommunity = async (req, res) => {
    const { coupleId } = req.user;
    const { id } = req.params;
    const data = req.body;
    const result = await community_service_1.communityService.joinCommunity(coupleId, id);
    (0, response_1.sendSuccess)({ res, statusCode: 200, message: result.status, data: result });
};
exports.joinCommunity = joinCommunity;
const leaveCommunity = async (req, res) => {
    const { coupleId } = req.user;
    const { id } = req.params;
    const result = await community_service_1.communityService.leaveCommunity(coupleId, id);
    (0, response_1.sendSuccess)({ res, statusCode: 200, message: result.status === 'deleted' ? 'Community deleted as last member left' : 'Left community' });
};
exports.leaveCommunity = leaveCommunity;
const inviteToCommunity = async (req, res) => {
    const { coupleId } = req.user;
    const { id } = req.params; // communityId
    const { invitedCoupleIds } = req.body;
    const result = await community_service_1.communityService.inviteToCommunity(coupleId, id, invitedCoupleIds || []);
    (0, response_1.sendSuccess)({ res, statusCode: 200, data: result, message: 'Invites sent successfully' });
};
exports.inviteToCommunity = inviteToCommunity;
const updateCommunity = async (req, res) => {
    const { coupleId } = req.user;
    const { id } = req.params;
    const { name, description, coverImageUrl, coverImageBase64 } = req.body;
    const community = await community_service_1.communityService.updateCommunity(coupleId, id, {
        name,
        description,
        coverImageUrl,
        coverImageBase64,
    });
    (0, response_1.sendSuccess)({ res, statusCode: 200, data: { community }, message: 'Community updated!' });
};
exports.updateCommunity = updateCommunity;
const deleteCommunity = async (req, res) => {
    const { coupleId } = req.user;
    const { id } = req.params;
    await community_service_1.communityService.deleteCommunity(coupleId, id);
    (0, response_1.sendSuccess)({ res, statusCode: 200, message: 'Community deleted successfully' });
};
exports.deleteCommunity = deleteCommunity;
const getInviteableCouples = async (req, res) => {
    const { coupleId } = req.user;
    const { id } = req.params;
    const couples = await community_service_1.communityService.getInviteableCouples(coupleId, id);
    (0, response_1.sendSuccess)({ res, statusCode: 200, data: { couples } });
};
exports.getInviteableCouples = getInviteableCouples;
const processJoinRequest = async (req, res) => {
    const { coupleId } = req.user;
    const { id, requestId, decision } = req.params;
    if (decision !== 'accept' && decision !== 'reject') {
        throw new AppError_1.AppError('Invalid decision', 400);
    }
    const result = await community_service_1.communityService.processJoinRequest(coupleId, id, requestId, decision);
    (0, response_1.sendSuccess)({ res, statusCode: 200, message: result.message });
};
exports.processJoinRequest = processJoinRequest;
//# sourceMappingURL=community.controller.js.map