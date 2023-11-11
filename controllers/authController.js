const User = require('../models/User');
const Token = require('../models/Token');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const crypto = require('crypto');
const { sendVerifyEmail, createToken, attachCookiesToResponse, sendResetPasswordEmail } = require('../utils');

const register = async (req, res) => {
    const { email } = req.body;

    const isEmailExisted = await User.findOne({ email });

    if (isEmailExisted)
        throw new CustomError.BadRequestError('This email already exists');

    const verificationToken = crypto.randomBytes(40).toString('hex');
    const isFirstAccount = await User.countDocuments({}) === 0;
    const role = isFirstAccount ? 'admin' : 'user';
    const origin = 'http://localhost:3000';

    const user = await User.create({ ...req.body, role, verificationToken });

    await sendVerifyEmail({
        name: user.name,
        email: user.email,
        verificationToken: user.verificationToken,
        origin
    })

    res.status(StatusCodes.CREATED).json({ msg: 'Successfully! Please check your mail to verify your account' });
};

const verifyEmail = async (req, res) => {
    const { email, verificationToken } = req.body;

    const user = await User.findOne({ email });
    if (!user)
        throw new CustomError.BadRequestError('Can not find user with this email');

    if (user.verificationToken !== verificationToken)
        throw new CustomError.UnauthorizedError('Verify failed');

    user.isVerified = true;
    user.verified = Date.now();
    user.verificationToken = '';
    await user.save();
    res.status(StatusCodes.OK).json({ msg: 'Verify successfull' });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        throw new CustomError.BadRequestError('Please provide email and password');

    const user = await User.findOne({ email });
    if (!user)
        throw new CustomError.NotFoundError('User not found');

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect)
        throw new CustomError.UnauthenticatedError('Password incorrect');

    if (!user.isVerified)
        throw new CustomError.UnauthenticatedError('You are not verify your email');

    const tokenUser = createToken(user);

    let refreshToken = '';

    const existingToken = await Token.findOne({ user: user._id });

    if (existingToken) {
        const { isValid } = existingToken;
        if (!isValid)
            throw new CustomError.UnauthenticatedError('Invalid Credentials');
        refreshToken = existingToken.refreshToken;
        attachCookiesToResponse({ res, user: tokenUser, refreshToken });
        res.status(StatusCodes.OK).json({ user: tokenUser });
        return;
    }

    refreshToken = crypto.randomBytes(40).toString('hex');
    await Token.create({ user: user._id, refreshToken });
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
        throw new CustomError.NotFoundError('Can not find user with this email');

    const origin = 'http://localhost:3000';
    const resetPasswordToken = crypto.randomBytes(70).toString('hex');

    await sendResetPasswordEmail({
        name: user.name,
        email: user.email,
        token: resetPasswordToken,
        origin
    });

    const tenMinutes = 60 * 10 * 1000;
    const resetPasswordExpiresIn = new Date(Date.now() + tenMinutes);

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpiresIn = resetPasswordExpiresIn;
    await user.save();

    res.status(StatusCodes.OK).json({ msg: 'Please check your email to reset password' });
};

const resetPassword = async (req, res) => {
    const { password, email, resetPasswordToken } = req.body;
    if (!password || !email || !resetPasswordToken)
        throw new CustomError.UnauthenticatedError('Please provide all values')

    const user = await User.findOne({ email });
    if (!user)
        throw new CustomError.NotFoundError('Can not found any user with this email');

    if (
        user.resetPasswordToken !== resetPasswordToken ||
        user.resetPasswordExpiresIn < new Date()
    )
        throw new CustomError.UnauthenticatedError('Reset password failed');

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpiresIn = null;
    await user.save();

    res.status(StatusCodes.OK).json({ msg: 'Reset password successfully updated' });
};

const logout = async (req, res) => {
    await Token.findOneAndDelete({ user: req.user.userId });

    res.cookie('accessToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    });

    res.cookie('refreshToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    });
    res.status(StatusCodes.OK).json({ msg: 'Log out successfully' });
};

module.exports = {
    register,
    verifyEmail,
    login,
    forgotPassword,
    resetPassword,
    logout
};