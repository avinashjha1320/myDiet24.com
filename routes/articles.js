const express = require("express");
const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const alert = require("alert");
const Article = require("../models/article");
const Owner = require("../models/owner");
const { auth, virtualAuth } = require("../middleware/auth");
const router = express.Router();

// let storage = multer.diskStorage({
//   destination: './public/images',
//   filename: (req, file, cb) => {
//       cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
//   }
// })

// let upload = multer({
//   storage: storage
// })
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

router.get("/", virtualAuth, async (req, res) => {
  const articles = await Article.find({});
  res.render("articles/blogs", { articles, isAuthorized: req.isAuthorized });
});

router.get("/dashboard", auth, async (req, res) => {
  const articles = await Article.find({ owner: req.owner._id }).sort({
    createdAt: "desc",
  });
  res.render("articles/dashboard", { articles });
});

router.get("/new", auth, (req, res) => {
  res.render("articles/new", { article: new Article() });
});

router.get("/edit/:slug", auth, async (req, res) => {
  const article = await Article.findOne({
    slug: req.params.slug,
    owner: req.owner._id,
  });
  res.render("articles/edit", { article: article });
});

router.get("/:slug", virtualAuth, async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug })
  const owner = await Owner.findOne({ _id: article.owner }).select("-password")
  if (article == null) res.redirect("/");
  res.render("articles/show", { article, owner, isAuthorized: req.isAuthorized });
});

router.post("/", upload.single("thumbnail"), auth, async (req, res, next) => {
  let article = new Article();
  article.title = req.body.title;
  article.metaDescription = req.body.metaDescription;
  article.description = req.body.description;
  const categories = req.body.categories.split(",").map((item) => item.trim());
  article.categories = categories;
  article.owner = req.owner._id;
  const Buffer = await sharp(req.file.buffer)
    .resize({ width: 720, height: 480 })
    .png()
    .toBuffer();
  article.thumbnail = Buffer;
  try {
    article = await article.save();
    res.redirect(`/blogs/${article.slug}`);
  } catch (e) {
    console.log(e);
    alert("Server error! ,Could not publish article");
    res.render("articles/new", { article });
  }
});

router.put(
  "/:slug",
  upload.single("thumbnail"),
  auth,
  async (req, res, next) => {
    let article = await Article.findOne({
      slug: req.params.slug,
      owner: req.owner._id,
    });
    article.title = req.body.title;
    article.metaDescription = req.body.metaDescription;
    article.description = req.body.description;
    const categories = req.body.categories
      .split(",")
      .map((item) => item.trim());
    article.categories = categories;
    let Buffer;
    if (req.file) {
      Buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer();
      article.thumbnail = Buffer;
    }
    try {
      article = await article.save();
      res.redirect(`/blogs/${article.slug}`);
    } catch (e) {
      console.log(e);
      alert("Could not edit article");
      res.render("articles/edit", { article: article });
    }
  }
);

router.patch("/like/:slug", async (req, res, next) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    article.likes = article.likes + 1;
    await article.save();
    res.redirect(`/blogs/${article.slug}`);
  } catch (error) {
    alert("Request failed");
  }
});

router.patch("/comment/:slug", async (req, res, next) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    article.comments.push(req.body);
    await article.save();
    alert("Commented successfully !");
    res.redirect(`/blogs/${article.slug}`);
  } catch (error) {
    alert("Server error !, Request failed");
  }
});

router.delete("/:slug", auth, async (req, res) => {
  try {
    await Article.findOneAndDelete({ slug: req.params.slug });
    res.redirect("/auth/profile");
  } catch (error) {
    alert("Could not delete article");
  }
});

module.exports = router;
