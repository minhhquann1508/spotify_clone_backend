const express = require('express');
const {
    createPlaylist,
    getCurrentUserPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    addSongToPlaylist
} = require('../controllers/playlistController');
const { authenticatedUser } = require('../middleware/authenticated');
const router = express.Router();

router
    .route('/')
    .post(authenticatedUser, createPlaylist);

router
    .route('/my-playlist')
    .get(authenticatedUser, getCurrentUserPlaylist);

router
    .route('/add-song/:id')
    .patch(authenticatedUser, addSongToPlaylist);

router
    .route('/remove-song/:id')
    .patch(authenticatedUser, removeSongFromPlaylist);

router
    .route('/:id')
    .delete(authenticatedUser, deletePlaylist)

module.exports = router;