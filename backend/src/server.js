const express = require("express");
const app = express();
const http = require("http");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const api = require("./api");
require("dotenv").config();
require("./ws");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
    session({
        secret: process.env.SECRET || "DEFAULT_SECRET",
        resave: false,
        saveUninitialized: false
    })
);

app.use("/api", api);

app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message
    });
});

const server = http.createServer(app);

const port = process.env.PORT || 3000;
server.listen(process.env.PORT, () => {
    console.log("Listening on port " + port);
});

if (!process.env.MONGO_URI) {
    console.error("ERR: MONGO_URI env variable not found");
    process.exit(1);
} else {
    mongoose
        .connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .catch(err => {
            console.error(
                "ERR: could not connect to MongoDB: " + process.env.MONGO_URI
            );
            console.error(err.message);
            process.exit(1);
        });
}

module.exports = server;
