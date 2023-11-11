const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { checkPermission } = require('../utils');

const getAllUser = async (req, res) => {
    const { search } = req.query;
    const queryObject = {};

    if (search) {
        queryObject.name = { $regex: search, $options: 'i' };
    }

    const results = User.find(queryObject);

    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;

    const users = await results
        .skip(skip)
        .limit(limit)
        .select('-__v -password');

    res.status(StatusCodes.OK).json({ users, total: users.length, currentPage: page });
};

const getSingleUser = async (req, res) => {
    const { id } = req.params;
    const user = await User
        .findOne({ _id: id })
        .select('-__v -password');
    if (!user)
        throw new CustomError.NotFoundError(`Can not find user with id: ${id}`);
    res.status(StatusCodes.OK).json({ user });
};

const getAllUsersRequestArtist = async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;

    const users = await User.find({ artistRequest: true })
        .skip(skip)
        .limit(limit)
        .select('-__v -password');
    res.status(StatusCodes.OK).json({ users, currentPage: page, total: users.length });
};

const getCurrentUser = async (req, res) => {
    const { userId } = req.user;
    const user = await User
        .findOne({ _id: userId })
        .select('-__v -password');
    res.status(StatusCodes.OK).json({ user });
};

const updateUserAvatar = async (req, res) => {
    const { userId } = req.user;
    if (!req.files)
        throw new CustomError.NotFoundError('Not found any file');
    const { image } = req.files;
    if (!image.mimetype.startsWith('image'))
        throw new CustomError.BadRequestError('Please select an image');
    const maxSize = 1024 * 1024;
    if (image.size > maxSize)
        throw new CustomError.BadRequestError('Please select an image lower than 1 MB');

    const result = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: 'spotify_avatar',
        use_filename: true
    });
    fs.unlinkSync(image.tempFilePath);
    const user = await User.findOne({ _id: userId });
    user.avatar = {
        url: result.secure_url,
        id: result.public_id
    };
    await user.save();
    res.status(StatusCodes.OK).json({ img_url: result.secure_url });
};

const requestToBeArtits = async (req, res) => {
    const { userId } = req.user;
    const user = await User.findOne({ _id: userId });
    if (!user)
        throw new CustomError.NotFoundError(`Can not find user with id: ${id}`);
    user.artistRequest = true;
    await user.save();
    res.status(StatusCodes.OK).json({ msg: 'Your request sent successfully' });
};

const acceptToBeArtist = async (req, res) => {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId });
    if (!user)
        throw new CustomError.NotFoundError(`Can not find user with id: ${id}`);
    user.artistRequest = null;
    user.role = 'artist'
    await user.save();
    res.status(StatusCodes.OK).json({ msg: 'Successfully' });
}

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const { userId } = req.user;
    const user = await User.findOne({ _id: id });
    if (!user)
        throw new CustomError.NotFoundError(`Can not find user with id: ${id}`);
    checkPermission(user, userId);
    user.name = name;
    await user.save();
    res.status(StatusCodes.OK).json({ msg: 'User updated successfull' });
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    const user = await User.findOne({ _id: id });
    if (!user)
        throw new CustomError.NotFoundError(`Can not find user with id ${id}`);
    await user.deleteOne();
    res.status(StatusCodes.OK).json({ msg: 'User deleted' });
};

module.exports = {
    getAllUser,
    getSingleUser,
    getCurrentUser,
    updateUserAvatar,
    getAllUsersRequestArtist,
    acceptToBeArtist,
    requestToBeArtits,
    updateUser,
    deleteUser
};