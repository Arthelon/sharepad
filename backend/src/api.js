const Router = require("express").Router();
const mongoose = require("mongoose");
const Program = require("./models/Program");

const DEFAULT_PROGRAM = "// Insert code here";

Router.get("/program/:id", async (req, res, next) => {
    const id = req.params.id;
    try {
        const program = await Program.findById(id);
        res.json({
            message: "Successfully retrieved program contents",
            data: {
                content: program.content,
                id: program._id
            }
        });
    } catch (err) {
        if (err instanceof mongoose.Error.DocumentNotFoundError) {
            res.status(404).json({
                message: "Program not found"
            });
        } else {
            next(err);
        }
    }
});

Router.post("/program", async (req, res) => {
    const program = new Program();
    program.content = DEFAULT_PROGRAM;
    await program.save();
    res.json({
        message: "Successfully created new program",
        data: {
            content: program.content,
            id: program._id
        }
    });
});

module.exports = Router;
