const mongoose = require("mongoose");
const slugify = require("slugify");

const commentsSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  feedback: {
    type: String,
    trim: true,
  },
});

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    metaDescription: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    categories: {
      type: [String],
      required: true,
      trim: true,
    },
    likes: {
      type: Number,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value",
      },
    },
    comments: [commentsSchema],
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Owner",
    },
    thumbnail: {
      type: Buffer,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

articleSchema.pre("validate", function (next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  next();
});

module.exports = mongoose.model("Article", articleSchema);
