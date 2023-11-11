const Playlist = require('../models/PlayList');
const Song = require('../models/Song');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const createPlaylist = async (req, res) => {
    const { userId } = req.user;
    const playlist = await Playlist.create({
        user: userId
    });
    res.status(StatusCodes.CREATED).json({ msg: 'Created playlist successfully' });
};

const getCurrentUserPlaylist = async (req, res) => {
    const { userId } = req.user;
    const playlist = await Playlist.find({ user: userId }).select('-__v');
    res.status(StatusCodes.OK).json({ playlist });
};

const addSongToPlaylist = async (req, res) => {
    const { id: playlistId } = req.params;
    const { songId } = req.body;
    const playlist = await Playlist.findOne({ _id: playlistId });
    if (!playlist)
        throw new CustomError.NotFoundError(`Playlist not found`);
    const song = await Song.findOne({ _id: songId });
    if (!song)
        throw new CustomError.NotFoundError(`Song not found`);

    const index = playlist.list
        .findIndex((songItem) => songItem.song.toString() === songId);

    if (index !== -1)
        throw new CustomError.BadRequestError('This song is already in this playlist');

    const songItem = {
        title: song.title,
        artist: song.artist,
        thumbnail: song.thumbnail.url,
        song: song._id
    };

    playlist.list = [...playlist.list, songItem];
    await playlist.save();

    res.status(StatusCodes.OK).json({ msg: 'Added successufully' });
};

const removeSongFromPlaylist = async (req, res) => {
    const { id } = req.params;
    const { songId } = req.body;
    const playlist = await Playlist.findOne({ _id: id });
    if (!playlist)
        throw new CustomError.NotFoundError('Can not find this playlist');
    const index = playlist.list.findIndex((songItem) => songItem.song.toString() === songId);
    if (index === -1)
        throw new CustomError.NotFoundError('Can not find this song');
    playlist.list.splice(index, 1);
    await playlist.save();
    res.status(StatusCodes.OK).json({ msg: 'Removed successfully' });
};

const deletePlaylist = async (req, res) => {
    const { id } = req.params;
    const playlist = await Playlist.findOne({ _id: id });
    if (!playlist)
        throw new CustomError.NotFoundError('Can not find this playlist');
    await playlist.deleteOne();
    res.status(StatusCodes.OK).json({ msg: 'Removed successfully' });
};

module.exports = {
    createPlaylist,
    getCurrentUserPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    addSongToPlaylist
};