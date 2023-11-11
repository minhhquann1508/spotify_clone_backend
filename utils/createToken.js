const createToken = (user) => {
    return {
        name: user.name,
        email: user.email,
        userId: user._id,
        avatar: user.avatar,
        role: user.role
    }
};

module.exports = createToken;