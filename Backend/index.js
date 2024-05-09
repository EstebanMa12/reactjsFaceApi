const {json, urlencoded} = require('express');
const express = require('express')
const cors = require('cors')
const mongoDB = require( './config/mongoConfig' );
const { default: mongoose } = require('mongoose');

const {upload} = require('./utils/upload');

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

//Initializations
const port = 3000
const app = express();
app.use(cors());
mongoDB.connect();

let bucket;
(()=>{
    mongoose.connection.on("connected", ()=>{
        bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: "uploads"
        });
    })
})



app.set('port', port);
app.listen(app.get('port'), async () => {
    console.log(`Server running on port ${app.get('port')}`);
});

// Middleware 
app.use(json());

app.use(urlencoded({ extended: false }));

app.post("/upload/file", upload().single("file"), async (req, res) => {
    try {
        const file = req.file;
        console.log(file)
        res.status(200).json({ message: "File uploaded successfully" });
    } catch (error) {
        res.status(500).json({ message: "File upload failed" });
    }
})

// GET

app.get("/files", async (req, res) => {
    try {
        let files = [];
        await bucket.find().forEach((file) => {
            files.push(file);
        });
        res.status(200).json({ files });
    } catch (error) {
        res.status(500).json({ message: "Error fetching files" });
    }
})