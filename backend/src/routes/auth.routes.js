const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/auth.controller');

router.post('/login', asyncHandler(ctrl.login));
router.post('/logout', asyncHandler(ctrl.logout));
router.post('/refresh', asyncHandler(ctrl.refresh));
router.get('/me', requireAuth, asyncHandler(ctrl.getMe));
router.post('/change-password', requireAuth, asyncHandler(ctrl.changePassword));

module.exports = router;
