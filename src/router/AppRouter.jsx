import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FaceDetection from '../components/FaceDetection';
const AppRouter = () => {
    return (
        <Router>
        <Routes>
            <Route path="/" element={<FaceDetection />} />
        </Routes>
        </Router>
    );

}

export default AppRouter;