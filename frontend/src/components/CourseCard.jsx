// src/components/CourseCard.jsx
import React from "react";
import { FaStar, FaUser, FaRegFileAlt } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { CiClock2 } from "react-icons/ci";
import { FiBookOpen } from "react-icons/fi";
import { Link } from "react-router-dom";

function CourseCard({ course }) {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 cursor-pointer">
      <div className="relative overflow-hidden">
        <img
          // Nếu image từ backend là null, sử dụng ảnh placeholder
          src={course.image || "https://via.placeholder.com/850x500"}
          alt={course.title}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/95 backdrop-blur-sm text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
            {course.category}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
            <FaStar size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-gray-900">
              {parseFloat(course.rating).toFixed(1)}
            </span>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
            <Link to={`/course/${course.id}`} className="block">
              <button className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-semibold hover:bg-yellow-600 hover:text-white transition-colors">
                Xem chi tiết
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors line-clamp-2 leading-tight h-14">
          {course.title}
        </h3>
        <div className="flex items-center gap-2 mb-4">
          <img
            src="https://secure.gravatar.com/avatar/7604638c9451218c07f13019b9f39553?s=96&d=mm&r=g"
            className="w-5 h-5 rounded-full"
            alt="instructor"
          />
          <span className="text-gray-600 text-sm font-medium">
            {course.instructor_name}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-5 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <FaUsers size={16} className="text-blue-500" />
            {/* Nếu backend chưa trả về students_count, mặc định là 0 */}
            <span className="font-medium">{course.students_count || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FiBookOpen size={16} className="text-purple-500" />
            <span className="font-medium">{course.total_lessons} bài</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CiClock2 size={16} className="text-orange-500" />
            <span className="font-medium">{course.duration}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span
            className={`text-2xl font-bold ${
              parseFloat(course.price) === 0
                ? "text-blue-600"
                : "text-green-600"
            }`}
          >
            {parseFloat(course.price) === 0 ? "Miễn phí" : `$${course.price}`}
          </span>
          <Link to={`/course/${course.id}`}>
            <button className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
