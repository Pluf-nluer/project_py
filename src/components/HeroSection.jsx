// src/components/HeroSection.jsx
import React from 'react';

const HeroSection = () => {
  return (
    <div className="relative h-[600px] flex items-center bg-gray-100">
      {/* Background Image Simulation */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{backgroundImage: "url('	https://dkmh.hcmuaf.edu.vn/assets/images/AQ1.png')"}}
      >
        {/* Overlay tối để chữ dễ đọc */}
        <div className="absolute inset-0 bg-black opacity-30"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-10 relative z-10 text-white w-full">
        <p className="text-primary font-bold text-lg uppercase mb-2">Học theo lịch trình của bạn</p>
        <h1 className="text-6xl font-bold mb-6 leading-tight">
          Giáo dục là <br /> con đường đến tương lai
        </h1>
        <div className="flex gap-4">
          <button className="bg-primary text-white px-8 py-4 rounded hover:bg-yellow-600 font-bold uppercase text-sm transition">
            Xem các khóa học
          </button>
          <button className="bg-white text-text-dark px-8 py-4 rounded hover:bg-gray-100 font-bold uppercase text-sm transition">
            Liên hệ với chúng tôi
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;