const express = require("express");
const crypto = require("crypto");
const gravatar = require("gravatar")
const alert = require("alert");
const multer = require("multer")
const sharp = require("sharp")

const Owner = require("../models/owner");
const Article = require("../models/article");
const { auth, virtualAuth } = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");
const router = express.Router();

router.get("/register", (req, res) => {
  res.render("auth");
});
router.get("/login", (req, res) => {
  res.redirect("/auth/register");
});

router.get("/profile", auth, async (req, res) => {
  try {
    const articles = await Article.find({ owner: req.owner._id })
    res.render("profile", { user: req.owner, articles })
  } catch (error) {
    alert('Please login again')
    res.redirect("/")
  }
})

router.post("/register", async (req, res) => {
  try {

    const existingUser = await Owner.findOne({ email: req.body.email });
    if (existingUser) {
      alert("User already registered");
      res.status(400).send();
    }
    //Get user's gravatar
    req.body.avatar = gravatar.url(req.body.email, {
      protocol: 'https', //protocol
      s: '200', //default size
      r: 'pg', //rating
      d: 'mm' //default image
    })
    req.body.socialMedia = {}

    req.body.socialMedia.facebook = req.body.facebook
    req.body.socialMedia.twitter = req.body.twitter
    req.body.socialMedia.googlePlus = req.body.googlePlus
    req.body.socialMedia.instagram = req.body.instagram
    req.body.socialMedia.twitter = req.body.twitter

    const owner = await Owner.create(req.body)
    await owner.save();

    const token = await owner.generateAuthToken();
    res.cookie("session-token", token);

    res.redirect('/auth/profile');
  } catch (error) {
    alert("Server error");
    console.log(error)
    res.redirect("/auth/register");
  }
});

router.post("/login", async (req, res) => {
  try {
    const owner = await Owner.findByCredentials(
      req.body.email,
      req.body.password
    );
    if (!owner) {
      alert("Invalid credentials");
      res.status(400).send();
    }
    const token = await owner.generateAuthToken();
    res.cookie("session-token", token);
    res.redirect("/auth/profile");
  } catch (error) {
    alert("Server error");
    res.redirect("/auth/register");
  }
});

router.get("/forgotPassword", (req, res) => {
  try {
    res.render("forgotPassword");
  } catch (error) {
    alert("Server error");
    res.status(500).send();
  }
});

router.post("/forgotPassword", async (req, res) => {
  try {
    const owner = await Owner.findOne({ email: req.body.email });
    if (!owner) {
      alert("User not found");
      res.status(400).send();
    }
    const resetToken = owner.getResetPasswordToken();
    await owner.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/auth/resetPassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click this link: \n\n ${resetUrl}`;
    await sendEmail(owner.email, message);
    alert("Please check your gmail inbox/spam for password resetting");
    res.redirect("/auth/forgotPassword");
  } catch (error) {
    alert("Server error");
    res.status(500).send();
  }
});

router.get("/resetPassword/:resetToken", (req, res) => {
  try {
    // console.log(req.params);
    res.render("resetPassword", { resetToken: req.params.resetToken });
  } catch (error) {
    alert("Server error");
    res.status(500).send();
  }
});

router.patch("/resetPassword/:resetToken", async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");
    const owner = await Owner.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    console.log(req.params.resetToken);
    console.log(resetPasswordToken);
    if (!owner) {
      alert("Server error");
      res.status(500).send();
    }
    // set new password
    owner.password = req.body.password;
    owner.resetPasswordToken = undefined;
    owner.resetPasswordExpire = undefined;
    await owner.save();
    alert("Password changed");
    res.redirect("/auth/login");
  } catch (error) {
    alert("Server error");
    res.status(500).send();
  }
});

const upload = multer({
  // dest: 'avatars',
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload a valid image"));
    }

    cb(undefined, true);
  },
});
router.patch("/profile/image", auth, upload.single("profilePicture"), async (req, res) => {
  try {
    const BufferData = await sharp(req.file.buffer)
      .resize({ width: 480, height: 360 })
      .png()
      .toBuffer();


    req.owner.avatar = Buffer.from(BufferData).toString("base64")
    await req.owner.save();
    alert("Photo updated successfully")
    res.redirect("/auth/profile")
  } catch (error) {
    alert('Failed to update photo')
    res.redirect("/auth/profile")
  }
})

router.get("/logout", auth, (req, res) => {
  try {
    res.clearCookie("session-token");
    res.redirect("/");
  } catch (error) {
    alert("Server error");
    res.redirect("/auth/profile");
  }
});

module.exports = router;
