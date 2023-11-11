const Album = require('../models/Album');
const Song = require('../models/Song');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { uploadImage } = require('../utils');
const fs = require('fs');

const createAlbum = async (req, res) => {
    const { title, desc } = req.body;
    const { userId } = req.user;

    if (!req.files)
        throw new CustomError.NotFoundError('Not found any file');
    const { thumbnail } = req.files;
    if (!thumbnail.mimetype.startsWith('image'))
        throw new CustomError.BadRequestError('Please provide an image file for thumbnail');
    const maxSize = 1024 * 1024;
    if (thumbnail.size > maxSize)
        throw new CustomError.BadRequestError('Please provide an image size lower than 1MB');

    const imageResult = await uploadImage(thumbnail);

    fs.unlinkSync(thumbnail.tempFilePath);

    const album = await Album.create({
        title,
        desc,
        thumbnail: {
            id: imageResult.public_id,
            url: imageResult.secure_url
        },
        user: userId
    });
    res.status(StatusCodes.CREATED).json({ msg: 'Created album successfull' });
};

const getAllAlbum = async (req, res) => {
    const { search } = req.query;
    const queryObject = { isPublic: true };

    if (search) {
        queryObject.title = { $regex: search, $options: 'i' };
    }

    const result = Album.find(queryObject);

    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;

    const albums = await result
        .skip(skip)
        .limit(limit)

    res.status(StatusCodes.OK).json({ albums, total: albums.length, currentPage: page });
};

const getSingleAlbum = async (req, res) => {
    const { id: albumId } = req.params;
    const album = await Album.findOne({ _id: albumId, isPublic: true });
    if (!album)
        throw new CustomError.NotFoundError(`Can not find album with id: ${albumId}`);
    res.status(StatusCodes.OK).json({ album });
};

const getMyAlbum = async (req, res) => {
    const { userId } = req.user;
    const albums = await Album.find({ user: userId });
    res.status(StatusCodes.OK).json({ albums });
};

const updateInfoAlbum = async (req, res) => {
    const { id: albumId } = req.params;
    const { title, desc, isPublic } = req.body;
    if (!title || !desc || !isPublic)
        throw new CustomError.BadRequestError('Please provide all values');
    const album = await Album.findOne({ _id: albumId });
    if (!album)
        throw new CustomError.NotFoundError(`Can not find album with id: ${id}`);
    album.title = title;
    album.desc = desc;
    album.isPublic = isPublic;
    await album.save();
    res.status(StatusCodes.OK).json({ msg: 'Updated album successfully' });
};

const addSongToAlbum = async (req, res) => {
    const { songs } = req.body;
    const { id: albumId } = req.params;
    if (!songs)
        throw new CustomError.BadRequestError('Please provide all songs');
    let songItems = [];
    for (const song of songs) {
        const dbSong = await Song.findOne({ _id: song.id });
        if (!dbSong)
            throw new CustomError.NotFoundError(`Can not find song with id: ${song.id}`);

        if (dbSong.album && dbSong.album === albumId)
            throw new CustomError.NotFoundError(`${dbSong.title} already in this album`);

        dbSong.album = albumId;
        await dbSong.save();

        const songItem = {
            title: dbSong.title,
            artist: dbSong.artist,
            song: dbSong._id,
        };

        songItems = [...songItems, songItem];
    };

    const album = await Album.findOne({ _id: albumId });
    album.list = songItems;
    await album.save();
    res.status(StatusCodes.OK).json({ msg: 'Add song to album successfull' });
};

const removeSongToAlbum = async (req, res) => {
    const { song } = req.body;
    const { id: albumId } = req.params;
    if (!song)
        throw new CustomError.BadRequestError('Please provide all songs you want to delete');
    const album = await Album.findOne({ _id: albumId });
    if (!album)
        throw new CustomError.NotFoundError(`Can not find album id:${albumId}`);
    const songItem = await Song.findOne({ _id: song });
    if (!songItem)
        throw new CustomError.NotFoundError(`Can not find song with id : ${id}`);
    const index = album.list.findIndex((songItem) => songItem.song.toString() === song);
    if (index !== -1) {
        songItem.album = null;
        album.list.splice(index, 1);
        await songItem.save();
        await album.save();
        res.status(StatusCodes.OK).json({ msg: 'Remove track from album successfully' })
    } else {
        throw new CustomError.NotFoundError(`Can not find song with id : ${id} in album`);
    }
};

const deleteAlbum = async (req, res) => {
    const { id: albumId } = req.params;
    const album = await Album.findOne({ _id: albumId });
    if (!album)
        throw new CustomError.NotFoundError(`Can not find album with id : ${albumId}`);
    await album.deleteOne();
    res.status(StatusCodes.OK).json({ msg: 'Delete album successfull' })
};


module.exports = {
    createAlbum,
    getSingleAlbum,
    getMyAlbum,
    getAllAlbum,
    updateInfoAlbum,
    addSongToAlbum,
    removeSongToAlbum,
    deleteAlbum
};
