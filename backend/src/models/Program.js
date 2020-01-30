const mongoose = require("mongoose");
const shortid = require("shortid");

const Program = new mongoose.Schema({
    _id: {
        type: String,
        default: shortid.generate
    },
    doc: String
});

module.exports = mongoose.model("Program", Program);
