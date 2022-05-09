const mongoose = require('mongoose');
const crypto = require('crypto')
const alert = require('alert')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Article = require("./article");


const ownerSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: 100,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validator(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email')
            }
        }
    },
    profession: {
        type: String,
        trim: true,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    socialMedia: {
        facebook: String,
        twitter: String,
        googlePlus: String,
        instagram: String,
        youtube: String
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true
})


ownerSchema.statics.findByCredentials = async (email, password) => {
    const owner = await Owner.findOne({ email })
    if (!owner) {
        alert('Invalid credentials')
        res.redirect("/auth/register")
    }
    const isMatch = await bcrypt.compare(password, owner.password)
    if (!isMatch) {
        alert('Invalid credentials')
        res.redirect("/auth/register")
    }

    return owner
}

ownerSchema.methods.generateAuthToken = async function () {
    const owner = this
    const token = jwt.sign({ _id: owner._id.toString() }, 'spiderman')

    return token;
}

// Generate and hash password token
ownerSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    console.log(resetToken);
    return resetToken;
};

ownerSchema.pre('save', async function (next) {
    const owner = this
    if (owner.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        owner.password = await bcrypt.hash(owner.password, salt)
    }
    next()
})

// if user is removed, all their blogs are removed
ownerSchema.pre('remove', async function (next) {
    const owner = this
    await Article.deleteMany({ owner: owner._id })
    next()
})

module.exports = Owner = mongoose.model('owner', ownerSchema);