const ex = require('express');
const router = ex.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, userController.getMe);
router.get('/search', protect, userController.searchUsers);
router.put('/profile', protect, userController.updateProfile);
router.get('/username/:username', protect, userController.getUserByUsername);
router.get('/:id/followers', protect, userController.getFollowers);
router.get('/:id/following', protect, userController.getFollowing);
router.get('/:id', protect, userController.getUser);
router.post('/:id/follow', protect, userController.toggleFollow);

module.exports = router;
