import { useRef, useEffect, useState } from "react";
import "./styles.sass";
import * as faceapi from "face-api.js";
import axios from "axios";
function FaceDetection() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [persons, setPersons] = useState([]);

  // console.log(persons);
  // LOAD FROM USEEFFECT
  useEffect(() => {
    startVideo();
    videoRef && loadModels();
    getDescriptorsFromMongo();
  }, []);

  const getDescriptorsFromMongo = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/descriptors`
      );
      // console.log(response)
      const labeledDescriptors = response.data.map((person) => {
        const descriptorValues = Object.values(person.descriptor[0]);
        const descriptorsAsFloat32Arrays = new Float32Array(
          descriptorValues.length
        );
        descriptorValues.forEach((value, i) => {
          descriptorsAsFloat32Arrays[i] = value;
        });

        return new faceapi.LabeledFaceDescriptors(
          person.name,
          [descriptorsAsFloat32Arrays]
        );
      });
      setPersons(labeledDescriptors);
    } catch (error) {
      console.error(error);
    }
  };
  // OPEN YOU FACE WEBCAM
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // LOAD MODELS FROM FACE API

  const loadModels = () => {
    Promise.all([
      // THIS FOR FACE DETECT AND LOAD FROM YOU PUBLIC/MODELS DIRECTORY
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]).then(() => {
      faceMyDetect();
    });
  };

  const faceMyDetect = () => {
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      // DRAW YOU FACE IN WEBCAM
      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(
        videoRef.current
      );
      faceapi.matchDimensions(canvasRef.current, {
        width: 940,
        height: 650,
      });

      const resized = faceapi.resizeResults(detections, {
        width: 940,
        height: 650,
      });

      
      // faceapi.draw.drawDetections(canvasRef.current, resized);
      faceapi.draw.DrawFaceLandmarks(canvasRef.current, resized);

      
      if (persons.length>0 && (resized.length > 0 && typeof resized !== 'undefined')  ) {

  
        const faceMatcher = new faceapi.FaceMatcher(persons, 0.6);

        const results = resized.map(fd => faceMatcher.findBestMatch(fd.descriptor))

        results.forEach((bestMatch, i) => {
          const box = resized[i].detection.box;
          const text = bestMatch.toString();
          const drawBox = new faceapi.draw.DrawBox(box, {
            label: text,
          });
          drawBox.draw(canvasRef.current);
        })
      }
    }, 2000);
  };

  return (
    <div className="myapp">
      <h1>Face Detection</h1>
      <div className="appvide">
        <video crossOrigin="anonymous" ref={videoRef} autoPlay></video>
      </div>
      <canvas ref={canvasRef} width="940" height="650" className="appcanvas" />
    </div>
  );
}

export default FaceDetection;