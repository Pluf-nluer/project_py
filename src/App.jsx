// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Import cái này
import Home from './pages/Home';       // Import trang Home
import Courses from './pages/Courses'; // Import trang Courses

function App() {
  return (
    <div className="font-sans">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
      </Routes>
    </div>
  );
}

export default App;