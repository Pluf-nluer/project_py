// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom"; // Import cái này
import Home from "./pages/Home"; // Import trang Home
import Courses from "./pages/Courses"; // Import trang Courses
import CourseDetail from "./pages/CourseDetail";
import Schedule from "./pages/Schedule";
import Admin from "./pages/AdminDashboard";

function App() {
  return (
    <div className="font-sans">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;
