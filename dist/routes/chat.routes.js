"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const asyncHandler_1 = require("../utils/asyncHandler");
const chat_controller_1 = require("../controllers/chat.controller");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
// POST /api/v1/chats/upload-url — presigned URL for direct media upload (voice)
router.post('/upload-url', (0, asyncHandler_1.asyncHandler)(chat_controller_1.createChatUploadUrl));
// GET /api/v1/chats/media-url — presigned download URL for stored media (voice)
router.get('/media-url', (0, asyncHandler_1.asyncHandler)(chat_controller_1.getMediaUrl));
// GET /api/v1/chats/unread-counts  (private chats)
router.get('/unread-counts', (0, asyncHandler_1.asyncHandler)(chat_controller_1.getUnreadCounts));
// GET /api/v1/chats/group-unread-counts  (group / community chats)
router.get('/group-unread-counts', (0, asyncHandler_1.asyncHandler)(chat_controller_1.getGroupUnreadCounts));
// GET /api/v1/chats/private/:matchId
router.get('/private/:matchId', (0, asyncHandler_1.asyncHandler)(chat_controller_1.getPrivateMessages));
// POST /api/v1/chats/private/:matchId
router.post('/private/:matchId', (0, asyncHandler_1.asyncHandler)(chat_controller_1.sendPrivateMessage));
// GET /api/v1/chats/group/:communityId
router.get('/group/:communityId', (0, asyncHandler_1.asyncHandler)(chat_controller_1.getGroupMessages));
// POST /api/v1/chats/group/:communityId
router.post('/group/:communityId', (0, asyncHandler_1.asyncHandler)(chat_controller_1.sendGroupMessage));
// PATCH /api/v1/chats/messages/:messageId  (edit a message)
router.patch('/messages/:messageId', (0, asyncHandler_1.asyncHandler)(chat_controller_1.editMessage));
// DELETE /api/v1/chats/messages/:messageId?forEveryone=true|false
router.delete('/messages/:messageId', (0, asyncHandler_1.asyncHandler)(chat_controller_1.deleteMessage));
// POST /api/v1/chats/:chatId/read  — mark all messages in a chat as read
router.post('/:chatId/read', (0, asyncHandler_1.asyncHandler)(chat_controller_1.markChatRead));
exports.default = router;
//# sourceMappingURL=chat.routes.js.map