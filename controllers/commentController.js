const Comment = require('../models/Comment');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermission } = require('../utils');

const createComment = async (req, res) => {
    const { song, content } = req.body;
    const { userId } = req.user;
    const comment = await Comment.create({
        song,
        content,
        user: userId
    });
    res.status(StatusCodes.CREATED).json({ comment });
};

const getAllComment = async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment
        .find({})
        .skip(skip)
        .limit(limit)

    res.status(StatusCodes.OK).json({ comments, currentPage: page, total: comments.length });
};

const getSingleComment = async (req, res) => {
    const { id } = req.params;
    const comment = await Comment.findOne({ _id: id });
    if (!comment)
        throw new CustomError.NotFoundError(`Can not find comment with id ${id}`);
    res.status(StatusCodes.OK).json({ comment });
};

const getCommentOfSingleSong = async (req, res) => {
    const { songId } = req.params;
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;
    const comment = await Comment
        .find({ song: songId })
        .skip(skip)
        .limit(limit);
    res.status(StatusCodes.OK).json({ comment });
};

const updateComment = async (req, res) => {
    const { id } = req.params;
    const comment = await Comment.findOne({ _id: id });
    if (!comment)
        throw new CustomError.NotFoundError(`Can not find comment with id ${id}`);
    const user = await User.findOne({ _id: req.user.userId });
    checkPermission(user, req.user.userId);
    comment.content = req.body.content;
    await comment.save();
    res.status(StatusCodes.OK).json({ msg: 'Updated comment successfully' });
};

const deleteComment = async (req, res) => {
    const { id } = req.params;
    const comment = await Comment.findOne({ _id: id });
    if (!comment)
        throw new CustomError.NotFoundError(`Can not find comment with id ${id}`);
    const user = await User.findOne({ _id: req.user.userId });
    checkPermission(user, req.user.userId);
    await comment.deleteOne();
    res.status(StatusCodes.OK).json({ msg: 'Deleted comment successfully' });
};

module.exports = {
    createComment,
    getAllComment,
    getSingleComment,
    getCommentOfSingleSong,
    updateComment,
    deleteComment
};