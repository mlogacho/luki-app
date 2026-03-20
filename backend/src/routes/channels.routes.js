const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/channels.controller');

router.get('/', requireAuth, asyncHandler(ctrl.getChannels));
router.get('/:id', requireAuth, asyncHandler(ctrl.getChannelById));
router.post('/', requireAuth, requireAdmin, asyncHandler(ctrl.createChannel));
router.put('/:id', requireAuth, requireAdmin, asyncHandler(ctrl.updateChannel));
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(ctrl.deleteChannel));

module.exports = router;
