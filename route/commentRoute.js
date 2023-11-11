const express = require('express');
const {
    createComment,
    getAllComment,
    getSingleComment,
    updateComment,
    deleteComment,
    getCommentOfSingleSong
} = require('../controllers/commentController');
const { authenticatedUser, authenticatedPermission } = require('../middleware/authenticated');
const router = express.Router();

router
    .route('/')
    .get(getAllComment)
    .post(authenticatedUser, createComment);

router
    .route('/song-comments/:songId')
    .get(getCommentOfSingleSong);

router
    .route('/:id')
    .get(getSingleComment)
    .patch(authenticatedUser, updateComment)
    .delete(authenticatedUser, deleteComment);

module.exports = router;