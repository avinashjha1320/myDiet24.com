const express = require("express");
const mongoose = require("mongoose");
const alert = require("alert");

const Contact = require("../models/contact");
const Article = require("../models/article");
const Newsletter = require("../models/news-letters")

const { auth, virtualAuth } = require("../middleware/auth");


const router = express.Router();

router.get("/", virtualAuth, async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 }).limit(3);
    res.render("articles/index", { articles, isAuthorized: req.isAuthorized });
  } catch (error) {
    console.log(error);
    res, status(500).json(error);
  }
});

router.get("/about", virtualAuth, (req, res) => {
  res.render("about", { isAuthorized: req.isAuthorized });
});

router.get("/contact", virtualAuth, (req, res) => {
  res.render("contact", { isAuthorized: req.isAuthorized });
});

router.post("/contact", async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    alert("Sent successfully");
    res.redirect("/contact");
  } catch (error) {
    console.log(error);
    alert("Server error !, error in sending ");
    res.redirect("/")
  }
});

router.patch("/news-letter", async (req, res) => {
  try {
    const newsletter = await Newsletter.create(req.body);
    alert("Subscribed successfully")
    res.redirect("/")

  } catch (error) {
    alert("Server error !, error in subscribing ");
    res.redirect("/")
  }
})

module.exports = router;
