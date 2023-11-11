const express = require('express');
const {
    createSong,
    getAllSong,
    getSingleSong,
    updateSong,
    updateSongThumbnail,
    updateSongUrl,
    deleteSong
} = require('../controllers/songController');
const { authenticatedUser, authenticatedPermission } = require('../middleware/authenticated')

const router = express.Router();

router
    .route('/')
    .get(getAllSong)
    .post(authenticatedUser, authenticatedPermission('admin', 'artist'), createSong);

router
    .route('/update-thumbnail/:songId')
    .patch(authenticatedUser, authenticatedPermission('admin', 'artist'), updateSongThumbnail);

router
    .route('/update-songUrl/:songId')
    .patch(authenticatedUser, authenticatedPermission('admin', 'artist'), updateSongUrl);

router
    .route('/:songId')
    .get(getSingleSong)
    .patch(authenticatedUser, authenticatedPermission('admin', 'artist'), updateSong)
    .delete(authenticatedUser, authenticatedPermission('admin', 'artist'), deleteSong);

module.exports = router;
