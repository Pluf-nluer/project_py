// src/components/CourseCard.jsx
import React from 'react';
import { FaStar, FaUser, FaRegFileAlt } from 'react-icons/fa';

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-xl transition duration-300 overflow-hidden group">
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
        <span className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded">
          {course.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
            <img src="https://secure.gravatar.com/avatar/7604638c9451218c07f13019b9f39553?s=96&d=mm&r=g" className="w-8 h-8 rounded-full"/>
            <span className="text-sm text-gray-500">{course.instructor}</span>
        </div>
        <h3 className="text-lg font-bold text-text-dark mb-2 hover:text-primary cursor-pointer">
          {course.title}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center text-gray-400 text-sm mb-4">
            <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => <FaStar key={i} />)}
            </div>
            <span>(12 reviews)</span>
        </div>
        
        <hr className="border-gray-100 mb-4"/>

        {/* Footer Card */}
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><FaUser /> {course.students}</span>
                <span className="flex items-center gap-1"><FaRegFileAlt /> {course.lessons}</span>
            </div>
            <span className="text-green-500 font-bold text-xl">{course.price}</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;