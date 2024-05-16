import { useRef, useEffect, useState } from "react";
import "./styles.sass";
import * as faceapi from "face-api.js";
import axios from "axios";
function FaceDetection() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [persons, setPersons] = useState([]);

  console.log(persons);
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
      const labeledDescriptors = response.data.map((person) => 
        new faceapi.LabeledFaceDescriptors(person.name, person.descriptors)
      );
      
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
        .withFaceDescriptors()

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

      faceapi.draw.drawDetections(canvasRef.current, resized);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);

      // Comparar si existe un match
      if (resized.length > 0) {
        const faceDescriptor = resized[0].descriptor; // Obtener el descriptor de la primera detección

        // Verifica que faceDescriptor no sea undefined antes de continuar
        if (!faceDescriptor) {
          console.warn("No face descriptor found");
          return;
        }

        const bestMatch = persons.reduce(
          (best, person) => {
            // Verifica que person.descriptors tenga al menos un elemento antes de calcular la distancia
            if (!person.descriptors || person.descriptors.length === 0) {
              console.warn("No descriptors found for this person", person.id);
              return best;
            }

            const descriptor = person.descriptors[0]; // Asumiendo que solo hay un descriptor por persona
            const score = faceapi.euclideanDistance(faceDescriptor, descriptor);

            return score < best.score ? { score, person } : best;
          },
          { score: Infinity }
        );

        if (bestMatch) {
          // Si hay una coincidencia, muestra el nombre de la persona
          alert(`Persona identificada: ${bestMatch.person.name}`);
        }
      }
    }, 1000);
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
