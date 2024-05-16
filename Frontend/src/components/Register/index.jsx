import "./styles.sass";
import { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Registrar la imagen para guardarla en mongoDB

const Register = () => {
  const image = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = async (event) => {
    // Carga los modelos necesarios para el procesamiento de imágenes
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]);

    // Continúa con el procesamiento de la imagen solo después de que todos los modelos estén cargados
    const img = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = async () => {
      const image = new Image();
      image.src = reader.result;

      image.onload = async () => {
        // Detecta rostros en la imagen y obtiene sus descripciones
        const detections = await faceapi
          .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (detections && detections.length>0) {
          console.log("Detected face descriptor");
            
          const descriptorsArray = detections.map(detection => detection.descriptor);  

          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/register`,
            {
              descriptors: descriptorsArray,
              name: "Test",
            }
          );
            console.log(response.data);
            navigate("/login");
        }else{
            console.log("No face detected");
        }
      };
    };

    // Lee el archivo de imagen como DataURL
    reader.readAsDataURL(img);
  };
  return (
    <div className="register">
      <h1>Register</h1>
      <form>
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </form>
    </div>
  );
};

export default Register;
