const ex = require('express');
const router = ex.Router();
const likeController = require('../controllers/likeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/post/:postId', protect, likeController.toggleLike);
router.get('/post/:postId', protect, likeController.getLikes);

module.exports = router;
