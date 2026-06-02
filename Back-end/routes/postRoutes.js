const ex = require('express');
const router = ex.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, postController.createPost);
router.get('/', protect, postController.getFeed);
router.get('/user/:userId', protect, postController.getUserPosts);
router.put('/:id', protect, postController.updatePost);
router.delete('/:id', protect, postController.deletePost);

module.exports = router;
