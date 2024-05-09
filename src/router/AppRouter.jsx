import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FaceDetection from '../components/FaceDetection';
import Register from '../components/Register';
const AppRouter = () => {
    return (
        <Router>
        <Routes>
            <Route path="/" element={<FaceDetection />} />
            <Route path="/register" element={<Register />} />
        </Routes>
        </Router>
    );

}

export default AppRouter;