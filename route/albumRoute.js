const express = require('express');
const {
    createAlbum,
    getSingleAlbum,
    getMyAlbum,
    getAllAlbum,
    updateInfoAlbum,
    addSongToAlbum,
    removeSongToAlbum,
    deleteAlbum
} = require('../controllers/albumController');
const { authenticatedUser, authenticatedPermission } = require('../middleware/authenticated');

const router = express.Router();

router
    .route('/')
    .get(getAllAlbum)
    .post(authenticatedUser, authenticatedPermission('admin', 'artist'), createAlbum);

router
    .route('/my-album')
    .get(authenticatedUser, authenticatedPermission('admin', 'artist'), getMyAlbum);

router
    .route('/add-song/:id')
    .patch(authenticatedUser, authenticatedPermission('admin', 'artist'), addSongToAlbum);

router
    .route('/remove-song/:id')
    .patch(authenticatedUser, authenticatedPermission('admin', 'artist'), removeSongToAlbum);

router
    .route('/:id')
    .get(getSingleAlbum)
    .patch(authenticatedUser, authenticatedPermission('admin', 'artist'), updateInfoAlbum)
    .delete(authenticatedUser, authenticatedPermission('admin', 'artist'), deleteAlbum);

module.exports = router;