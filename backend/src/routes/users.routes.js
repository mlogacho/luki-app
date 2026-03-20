const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/users.controller');

router.get('/', requireAuth, requireAdmin, asyncHandler(ctrl.getUsers));
router.post('/', requireAuth, requireAdmin, asyncHandler(ctrl.createUser));
router.get('/:id', requireAuth, requireAdmin, asyncHandler(ctrl.getUserById));
router.put('/:id', requireAuth, requireAdmin, asyncHandler(ctrl.updateUser));
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(ctrl.deleteUser));
router.post('/:id/resend-welcome', requireAuth, requireAdmin, asyncHandler(ctrl.resendWelcomeEmail));

module.exports = router;
