// src/App.jsx
import React from "react";
import AdminDashboard from "./components/admin/AdminDashboard";
import { Routes, Route } from "react-router-dom"; // Import cái này
import Home from "./pages/Home"; // Import trang Home
import Courses from "./pages/Courses"; // Import trang Courses
import CourseDetail from "./pages/CourseDetail";
import Schedule from "./pages/Schedule";
import Profile from "./pages/Profile";
import PlacementQuiz from "./pages/Quiz";
import CourseQuiz from "./pages/CourseQuiz";
import LearningPath from "./pages/LearningPath";

function App() {
  return (
    <div className="font-sans">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/learning/:id" element={<LearningPath />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/placement-quiz" element={<PlacementQuiz />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/course/:id/quiz" element={<CourseQuiz />} />
      </Routes>
    </div>
  );
}

export default App;
