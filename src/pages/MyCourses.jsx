// src/components/MyCourses.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { FaBook, FaChevronDown } from "react-icons/fa";

const MyCourses = ({ myCourses, isOpen, onToggle, isLoggedIn }) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 hover:text-primary transition"
      >
        <FaBook className="text-lg" />
        <span className="font-medium text-sm">Khóa học của tôi</span>
        <FaChevronDown className="text-xs" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-100 py-2">
          {isLoggedIn && myCourses.length > 0 ? (
            <>
              {/* My Courses List */}
              <div className="px-4 py-3">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FaBook className="text-primary" />
                  Khóa học của bạn
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {myCourses.map((course) => (
                    <NavLink
                      key={course.id}
                      to={`/course/${course.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition"
                      onClick={onToggle}
                    >
                      <div className="flex gap-3">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-20 h-14 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
                            {course.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-primary h-1.5 rounded-full transition-all"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 font-medium">
                              {course.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </NavLink>
                  ))}
                </div>
              </div>

              {/* View All Button */}
              <div className="px-4 py-3 border-t border-gray-100">
                <NavLink
                  to="/my-courses"
                  className="block text-center text-sm text-primary font-semibold hover:underline"
                  onClick={onToggle}
                >
                  Xem tất cả khóa học →
                </NavLink>
              </div>
            </>
          ) : isLoggedIn && myCourses.length === 0 ? (
            // Empty State when logged in but no courses
            <div className="px-4 py-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaBook className="text-gray-400 text-2xl" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">
                Chưa có khóa học nào
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Bạn chưa đăng ký khóa học nào. Hãy khám phá và đăng ký ngay!
              </p>
              <NavLink
                to="/courses"
                className="inline-block bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition"
                onClick={onToggle}
              >
                Khám phá khóa học
              </NavLink>
            </div>
          ) : (
            // Not logged in state
            <div className="px-4 py-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaBook className="text-gray-400 text-2xl" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">
                Vui lòng đăng nhập
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Đăng nhập để xem các khóa học của bạn
              </p>
              <button
                onClick={onToggle}
                className="inline-block bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
