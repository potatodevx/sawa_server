"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const asyncHandler_1 = require("../utils/asyncHandler");
const couple_controller_1 = require("../controllers/couple.controller");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
// GET /api/v1/couples/me
router.get('/me', (0, asyncHandler_1.asyncHandler)(couple_controller_1.getMyCouple));
// Block management — couples
router.get('/blocks', (0, asyncHandler_1.asyncHandler)(couple_controller_1.getBlockList));
router.post('/blocks', (0, asyncHandler_1.asyncHandler)(couple_controller_1.blockCouple));
router.delete('/blocks', (0, asyncHandler_1.asyncHandler)(couple_controller_1.unblockCouple));
// Block management — communities
router.get('/blocks/communities', (0, asyncHandler_1.asyncHandler)(couple_controller_1.getBlockedCommunities));
router.delete('/blocks/communities', (0, asyncHandler_1.asyncHandler)(couple_controller_1.unblockCommunity));
// GET /api/v1/couples/:id
router.get('/:id', (0, asyncHandler_1.asyncHandler)(couple_controller_1.getCoupleById));
// GET /api/v1/couples/onboarding/status
router.get('/onboarding/status', (0, asyncHandler_1.asyncHandler)(couple_controller_1.getOnboardingStatus));
// POST /api/v1/couples/onboarding/profile
router.post('/onboarding/profile', couple_controller_1.validateSetupProfile, (0, asyncHandler_1.asyncHandler)(couple_controller_1.setupProfile));
// POST /api/v1/couples/onboarding/photos
router.post('/onboarding/photos', couple_controller_1.validateUploadPhotos, (0, asyncHandler_1.asyncHandler)(couple_controller_1.uploadPhotos));
// POST /api/v1/couples/onboarding/answers
router.post('/onboarding/answers', couple_controller_1.validateSubmitAnswers, (0, asyncHandler_1.asyncHandler)(couple_controller_1.submitAnswers));
// POST /api/v1/couples/onboarding/complete
router.post('/onboarding/complete', couple_controller_1.validateCompleteOnboarding, (0, asyncHandler_1.asyncHandler)(couple_controller_1.completeOnboarding));
// POST /api/v1/couples (legacy)
router.post('/', (0, asyncHandler_1.asyncHandler)(couple_controller_1.createCouple));
// PATCH /api/v1/couples/me
router.patch('/me', couple_controller_1.validateUpdateMyCouple, (0, asyncHandler_1.asyncHandler)(couple_controller_1.updateMyCouple));
// PUT /api/v1/couples/me (alias for PATCH)
router.put('/me', couple_controller_1.validateUpdateMyCouple, (0, asyncHandler_1.asyncHandler)(couple_controller_1.updateMyCouple));
// POST /api/v1/couples/me/invite
router.post('/me/invite', (0, asyncHandler_1.asyncHandler)(couple_controller_1.invitePartner));
// POST /api/v1/couples/subscribe
router.post('/subscribe', (0, asyncHandler_1.asyncHandler)(couple_controller_1.subscribe));
// DELETE /api/v1/couples/me
router.delete('/me', (0, asyncHandler_1.asyncHandler)(couple_controller_1.deleteMyAccount));
exports.default = router;
//# sourceMappingURL=couple.routes.js.map