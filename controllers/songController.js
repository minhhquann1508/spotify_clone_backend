const Song = require('../models/Song');
const CustomError = require('../errors');
const cloudinary = require('cloudinary').v2;
const User = require('../models/User');
const fs = require('fs');
const { StatusCodes } = require('http-status-codes');
const { checkPermission, uploadAudio, uploadImage } = require('../utils');

const createSong = async (req, res) => {
    const { song, thumbnail } = req.files;
    const { title, artist, composer, category, lyrics } = req.body;
    const songProperty = {
        title, artist, composer,
        category, lyrics, createBy: req.user.userId
    };
    const user = await User.findOne({ _id: req.user.userId });
    checkPermission(user, req.user.userId);
    if (!req.files)
        throw new CustomError.BadRequestError('Can not find any file upload');
    if (!song.mimetype.startsWith('audio'))
        throw new CustomError.BadRequestError('Please provide a mp3 file');
    if (!thumbnail.mimetype.startsWith('image'))
        throw new CustomError.BadRequestError('Please provide an image file for thumbnail');
    const maxSize = 1024 * 1024;
    if (thumbnail.size > maxSize)
        throw new CustomError.BadRequestError('Please provide an image size lower than 1MB');

    const imageResult = await uploadImage(thumbnail);

    fs.unlinkSync(thumbnail.tempFilePath);

    const audioResult = await uploadAudio(song);

    fs.unlinkSync(song.tempFilePath);

    const newSong = await Song
        .create(
            {
                ...songProperty,
                songUrl: {
                    url: audioResult.secure_url,
                    id: audioResult.public_id
                },
                thumbnail: {
                    url: imageResult.secure_url,
                    id: imageResult.public_id
                },
            }
        );
    res.status(StatusCodes.CREATED).json({ song: newSong });
};

const getAllSong = async (req, res) => {
    const { search, category } = req.query;
    const queryObject = { isPublic: true };

    if (search) {
        queryObject.title = { $regex: search, $options: 'i' };
    }

    if (category) {
        queryObject.category = category;
    }

    const result = Song.find(queryObject);

    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;

    const songs = await result
        .skip(skip)
        .limit(limit)

    res.status(StatusCodes.OK).json({ songs, total: songs.length, currentPage: page });
};

const getSingleSong = async (req, res) => {
    const { songId } = req.params;
    const song = await Song
        .findOne({ _id: songId })
        .select('-__v')
        .populate('comments');
    if (!song)
        throw new CustomError.NotFoundError(`Can not find song with id: ${id}`);
    res.status(StatusCodes.OK).json({ song });
};

const updateSong = async (req, res) => {
    const { songId } = req.params;
    const {
        title, lyrics, artist,
        composer, category, album, isPublic
    } = req.body;
    const user = await User.findOne({ _id: req.user.userId });
    checkPermission(user, req.user.userId);
    if (!title || !lyrics || !artist || !composer || !category || !album || !isPublic)
        throw new CustomError.BadRequestError('Please provide all values');
    const song = await Song.findOne({ _id: songId });
    if (!song) throw new CustomError.NotFoundError(`Can not find song with id: ${songId}`);
    song.artist = artist;
    song.title = title;
    song.lyrics = lyrics;
    song.composer = composer;
    song.category = category;
    song.album = album;
    song.isPublic = isPublic;
    await song.save();
    res.status(StatusCodes.OK).json({ msg: 'Song updated' });
};

const updateSongThumbnail = async (req, res) => {
    const { songId } = req.params;
    const { thumbnail } = req.files;
    const user = await User.findOne({ _id: req.user.userId });
    checkPermission(user, req.user.userId);
    const song = await Song.findOne({ _id: songId });
    if (!song)
        throw new CustomError.NotFoundError(`Can not find any song with id ${songId}`);
    if (!req.files)
        throw new CustomError.BadRequestError('Can not find any file upload');
    if (!thumbnail.mimetype.startsWith('image'))
        throw new CustomError.BadRequestError('Please provide an image file for thumbnail');
    const maxSize = 1024 * 1024;
    if (thumbnail.size > maxSize)
        throw new CustomError.BadRequestError('Please provide an image size lower than 1MB');

    const result = await uploadImage(thumbnail);

    fs.unlinkSync(thumbnail.tempFilePath);

    await cloudinary.uploader.destroy(song.thumbnail.id);

    song.thumbnail = {
        id: result.public_id,
        url: result.secure_url
    };
    await song.save();
    res.status(StatusCodes.OK).json({ msg: 'Update thumbnail successfully' })
};

const updateSongUrl = async (req, res) => {
    const { songId } = req.params;
    const { songUrl } = req.files;
    const user = await User.findOne({ _id: req.user.userId });
    checkPermission(user, req.user.userId);
    const song = await Song.findOne({ _id: songId });
    if (!song)
        throw new CustomError.NotFoundError(`Can not find any song with id ${songId}`);
    if (!req.files)
        throw new CustomError.BadRequestError('Can not find any file upload');
    if (!songUrl.mimetype.startsWith('audio'))
        throw new CustomError.BadRequestError('Please provide an audio file for song');
    const result = await uploadAudio(songUrl);
    fs.unlinkSync(songUrl.tempFilePath);

    await cloudinary.uploader.destroy(song.songUrl.id);

    song.songUrl = {
        id: result.public_id,
        url: result.secure_url
    };
    await song.save();
    res.status(StatusCodes.OK).json({ msg: 'Update audio file successfully' })
};

const deleteSong = async (req, res) => {
    const { songId } = req.params;
    const user = await User.findOne({ _id: req.user.userId });
    checkPermission(user, req.user.userId);
    const song = await Song.findOne({ _id: songId });
    if (!song)
        throw new CustomError.NotFoundError(`Can not find song with id: ${songId}`);
    await song.deleteOne();
    res.status(StatusCodes.OK).json({ msg: 'Deleted song successfully' });
};

module.exports = {
    createSong,
    getAllSong,
    getSingleSong,
    updateSong,
    updateSongThumbnail,
    updateSongUrl,
    deleteSong
};

