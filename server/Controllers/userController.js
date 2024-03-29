const User = require("../Models/userModels");
const bcrypt = require("bcrypt");

module.exports.register = async ( req, res, next ) => {
    try {
        const { username, email, password } = req.body;
        const usernameCheck = await User.findOne({ username });
        if(usernameCheck) {
            return res.json({ msg: "User already exists", status: false });
        }
        const emailCheck = await User.findOne({ email });
        if(emailCheck) {
            return res.json({ msg: "Email already exists", status: false });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });
        delete user.password;
        return res.json({ status: true, user });
    }
    catch(err) {
        console.log(`Register Error: ${err.message}`);
        next(err);
    }
};

module.exports.login = async ( req, res, next ) => {
    try {
        const { username, password } = req.body;
        const currentUser = await User.findOne({ username });
        if(!currentUser) {
            return res.json({ msg: "Incorrect Username or Password", status: false });
        }
        const isPasswordValid = await bcrypt.compare(password, currentUser.password);
        if(!isPasswordValid) {
            return res.json({ msg: "Incorrect Username or Password", status: false });
        }
        delete currentUser.password;
        return res.json({ status: true, currentUser });
    }
    catch(err) {
        console.log(`Login Error: ${err.message}`);
        next(err);
    }
};

module.exports.avatar = async ( req, res, next ) => {
    try {
        const userId = req.params.id;
        const avatarImage = req.body.image;
        const userData = await User.findByIdAndUpdate(
            userId ,
            {
                isAvatarImageSet: true,
                avatarImage,
            },
            { new: true },
        );

        return res.json({ isSet: userData.isAvatarImageSet, image: userData.avatarImage, });
    }
    catch(err) {
        console.log(`Avatar Error: ${err.message}`);
        next(err);
    }
};

module.exports.snaptalk = async ( req, res, next ) => {
    try {
        const users = await User.find({ "_id": { $ne: req.params.id }}).select([
            "email",
            "username",
            "avatarImage",
            "_id",
        ]).lean();

        return res.json(users);
    }
    catch(err) {
        console.log(`Snaptalk Error: ${err.message}`);
        next(err);
    }
}