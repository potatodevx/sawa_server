"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const user_controller_1 = require("../controllers/user.controller");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
router.get('/me', (0, asyncHandler_1.asyncHandler)(user_controller_1.getMe));
router.patch('/me', (0, asyncHandler_1.asyncHandler)(user_controller_1.updateMe));
router.post('/me/push-token', (0, asyncHandler_1.asyncHandler)(user_controller_1.registerPushToken));
// Diagnostic: confirm whether this device has a push token saved
router.get('/me/push-status', (0, asyncHandler_1.asyncHandler)(user_controller_1.getPushStatus));
router.post('/me/test-push', (0, asyncHandler_1.asyncHandler)(user_controller_1.testPush));
exports.default = router;
//# sourceMappingURL=user.routes.js.map