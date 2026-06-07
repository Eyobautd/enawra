const ex = require('express');
const router = ex.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, postController.createPost);
router.post('/:id/repost', protect, postController.repostPost);
router.get('/', protect, postController.getFeed);
router.get('/following', protect, postController.getFollowingFeed);
router.get('/user/:userId', protect, postController.getUserPosts);
router.put('/:id', protect, postController.updatePost);
router.delete('/:id', protect, postController.deletePost);

module.exports = router;
