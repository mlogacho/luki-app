const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/profiles.controller');

router.get('/', requireAuth, asyncHandler(ctrl.getProfiles));
router.post('/select', requireAuth, asyncHandler(ctrl.selectProfile));

module.exports = router;
