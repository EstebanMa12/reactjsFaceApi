require('@tensorflow/tfjs-node')
const { json, urlencoded } = require('express');
const express = require('express')
const cors = require('cors')
const mongoDB = require('./config/mongoConfig');
const Descriptor = require('./schemas/descriptor.model');
const faceapi = require("face-api.js");
const fileUpload = require("express-fileupload");
const { Canvas, Image } = require("canvas");
const canvas = require("canvas");

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}


//Initializations
const port = 3000
const app = express();
app.use(cors());
mongoDB.connect();


app.set('port', port);
app.listen(app.get('port'), async () => {
    console.log(`Server running on port ${app.get('port')}`);
});

// Middleware 
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(
    fileUpload({ useTempFiles: true })
);


const loadModels = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromDisk(__dirname + "/models");
    await faceapi.nets.faceLandmark68Net.loadFromDisk(__dirname + "/models");
    await faceapi.nets.faceRecognitionNet.loadFromDisk(__dirname + "/models");
    await faceapi.nets.faceExpressionNet.loadFromDisk(__dirname + "/models");
}

loadModels();

const getDescriptorsAndReturnBestMatch = async (image) => {
    const descriptors = await Descriptor.find();
    const labeledDescriptors = descriptors.map((person) => {
        const descriptorValues = Object.values(person.descriptor[0]);
        const descriptorsAsFloat32Arrays = new Float32Array(descriptorValues.length);
        descriptorValues.forEach((value, i) => {
            descriptorsAsFloat32Arrays[i] = value;
        });

        return new faceapi.LabeledFaceDescriptors(person.name, [descriptorsAsFloat32Arrays]);
    });

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
    const img = canvas.loadImage(image);
    let temp = faceapi.createCanvasFromMedia(img);

    const displaySize = { width: img.width, height: img.height };
    faceapi.matchDimensions(temp, displaySize);

    //Find Matching faces
    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));

    return results;

}

// POST
app.post('/register', async (req, res) => {
    const { descriptor, name } = req.body;
    const descriptorDB = new Descriptor({ descriptor, name });
    await descriptorDB.save();
    res.json({
        message: 'Descriptor saved',
        data: descriptorDB
    });
});

// GET
app.get('/descriptors', async (req, res) => {
    const descriptors = await Descriptor.find();
    res.json(descriptors);
});

// GET Best Match 
app.post('/detect', async (req, res) => {
    const image = req.files.image.tempFilePath
    const bestMatch = await getDescriptorsAndReturnBestMatch(image);
    res.json(bestMatch);
});