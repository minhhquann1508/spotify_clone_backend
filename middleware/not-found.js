const notFoundMiddlware = async (req, res, next) => res.status(404).json({ msg: 'Can not found this route' });

module.exports = notFoundMiddlware;