const ex = require('express');
const router = ex.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/post/:postId', protect, commentController.addComment);
router.get('/post/:postId', protect, commentController.getComments);
router.delete('/:id', protect, commentController.deleteComment);

module.exports = router;
