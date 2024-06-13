import "./styles.sass";
import { useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Registrar la imagen para guardarla en mongoDB

const Register = () => {
  const [name, setName] = useState("");
  const [descriptors, setDescriptors] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ]);
    };
    loadModels();
  }, []);

  const handleImageChange = async (event) => {
    // Continúa con el procesamiento de la imagen solo después de que todos los modelos estén cargados
    const img = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = async () => {
      const image = new Image();
      image.src = reader.result;
      image.onload = async () => {
        // Detecta rostros en la imagen y obtiene sus descripciones
        const detection = await faceapi
          .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();
        if (detection) {
          console.log("Detected face descriptor");
          const descriptorsArray = detection.descriptor;
          setDescriptors(descriptorsArray);
        } else {
          console.log("No face detected");
        }
      };
    };
    // Lee el archivo de imagen como DataURL
    reader.readAsDataURL(img);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (name && descriptors) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/register`,
          {
            descriptor: descriptors,
            name: name,
          }
        );
        // navigate("/login");
        console.log(response.data);
      } catch (error) {
        console.error("Error during registration:", error);
      }
    } else {
      console.log("Name or descriptors are missing");
    }
  };
  return (
    <div className="register">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="image">Upload an image</label>
        <input
          type="file"
          accept="image/*"
          id="image"
          onChange={handleImageChange}
        />
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Write your name"
          onChange={handleNameChange}
          value={name}
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
