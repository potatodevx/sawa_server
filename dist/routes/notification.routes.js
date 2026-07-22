"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const asyncHandler_1 = require("../utils/asyncHandler");
const notification_controller_1 = require("../controllers/notification.controller");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
// GET /api/v1/notifications
router.get('/', (0, asyncHandler_1.asyncHandler)(notification_controller_1.getNotifications));
// GET /api/v1/notifications/unread-count
router.get('/unread-count', (0, asyncHandler_1.asyncHandler)(notification_controller_1.getUnreadCount));
// PATCH /api/v1/notifications/read-all  — mark every unread notification as read in one call
router.patch('/read-all', (0, asyncHandler_1.asyncHandler)(notification_controller_1.markAllAsRead));
// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', (0, asyncHandler_1.asyncHandler)(notification_controller_1.markAsRead));
exports.default = router;
//# sourceMappingURL=notification.routes.js.map