const express = require('express');
const {
    getAllUser,
    getSingleUser,
    getCurrentUser,
    updateUserAvatar,
    updateUser,
    deleteUser,
    getAllUsersRequestArtist,
    acceptToBeArtist,
    requestToBeArtits,
} = require('../controllers/userController');
const { authenticatedUser, authenticatedPermission } = require('../middleware/authenticated');
const router = express.Router();

router
    .route('/')
    .get(authenticatedUser, authenticatedPermission('admin'), getAllUser);

router
    .route('/show-me')
    .get(authenticatedUser, getCurrentUser);

router
    .route('/request-artist')
    .get(authenticatedUser, authenticatedPermission('admin'), getAllUsersRequestArtist)
    .patch(authenticatedUser, authenticatedPermission('user'), requestToBeArtits);

router
    .route('/update-avatar')
    .patch(authenticatedUser, updateUserAvatar);

router
    .route('/accept-request-artist/:userId')
    .patch(authenticatedUser, authenticatedPermission('admin'), acceptToBeArtist);

router
    .route('/:id')
    .get(authenticatedUser, getSingleUser)
    .patch(authenticatedUser, updateUser)
    .delete(authenticatedUser, authenticatedPermission('admin'), deleteUser);


module.exports = router;