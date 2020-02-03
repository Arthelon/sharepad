const Router = require("express").Router();
const mongoose = require("mongoose");
const Program = require("./models/Program");
const automerge = require("automerge");

const DEFAULT_PROGRAM = "// Insert code here";

Router.get("/program/:id", async (req, res, next) => {
    const id = req.params.id;
    try {
        const program = await Program.findById(id);
        if (program === null) {
            res.status(404).json({
                message: "Program not found"
            });
        } else {
            res.json({
                message: "Successfully retrieved program",
                data: {
                    doc: program.doc,
                    id: program._id
                }
            });
        }
    } catch (err) {
        next(err);
    }
});

Router.post("/program", async (req, res) => {
    const program = new Program();
    let doc = automerge.init();
    doc = automerge.change(doc, docRef => {
        docRef.content = new automerge.Text();
        docRef.content.insertAt(0, ...DEFAULT_PROGRAM.split(""));
    });
    program.doc = automerge.save(doc);
    await program.save();
    res.json({
        message: "Successfully created new program",
        data: {
            doc: program.doc,
            id: program._id
        }
    });
});

module.exports = Router;
