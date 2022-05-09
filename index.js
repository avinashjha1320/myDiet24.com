const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const indexRouter = require("./routes/index");
const articleRouter = require("./routes/articles");
const ownerRouter = require("./routes/owners");
const methodOverride = require("method-override");
const app = express();

require("dotenv").config();
const connectDB = require("./db");
connectDB();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use("/styles", express.static(path.resolve(__dirname, "public/styles")));
app.use("/js", express.static(path.resolve(__dirname, "public/js")));
app.use("/plugins", express.static(path.resolve(__dirname, "public/plugins")));
app.use(
  "/ckeditor",
  express.static(path.resolve(__dirname, "public/ckeditor"))
);
app.use("/images", express.static(path.resolve(__dirname, "public/images")));

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(cookieParser());

// app.get("/", (req, res) => {
//   res.redirect("/articles");
// });

app.use("/", indexRouter);
app.use("/auth", ownerRouter);
app.use("/blogs", articleRouter);

const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
