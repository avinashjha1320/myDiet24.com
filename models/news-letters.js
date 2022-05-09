const mongoose = require("mongoose");

const newsLetterSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            validator(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Invalid email");
                }
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Newsletter", newsLetterSchema);
