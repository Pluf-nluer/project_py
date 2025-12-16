// src/components/Header.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaSearch, FaChevronDown, FaShoppingBag } from "react-icons/fa";
import Login from "../pages/Login";
import MyCourses from "../pages/MyCourses";

const Header = () => {
  // State quản lý đăng nhập (giả lập - thay đổi thành true để test)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCoursesMenu, setShowCoursesMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Thông tin user giả lập
  const user = {
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    avatar: null,
  };

  // Các khóa học đã đăng ký (rỗng)
  const myCourses = [];

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowUserMenu(false);
  };

  const handleCoursesClick = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      setShowCoursesMenu(false);
    } else {
      setShowCoursesMenu(!showCoursesMenu);
    }
  };

  return (
    <>
      <header className="flex justify-between items-center px-10 py-4 bg-white shadow-sm sticky top-0 z-50">
        {/* Logo */}
        <div className="text-2xl font-bold flex items-center gap-2">
          <span className="text-primary text-4xl">N</span>
          <span className="text-text-dark font-bold">NLU Learning</span>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="flex gap-8 font-medium text-sm uppercase">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "text-primary font-bold"
                    : "text-gray-600 hover:text-primary"
                }
              >
                Trang chủ
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/courses"
                className={({ isActive }) =>
                  isActive
                    ? "text-primary font-bold"
                    : "text-gray-600 hover:text-primary"
                }
              >
                Khóa học
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/schedule"
                className={({ isActive }) =>
                  isActive
                    ? "text-primary font-bold"
                    : "text-gray-600 hover:text-primary"
                }
              >
                Lịch trình
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive
                    ? "text-primary font-bold"
                    : "text-gray-600 hover:text-primary"
                }
              >
                admin
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  isActive
                    ? "text-primary font-bold"
                    : "text-gray-600 hover:text-primary"
                }
              >
                Liên hệ
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-6 text-gray-600">
          {/* Search Icon */}
          <FaSearch className="cursor-pointer hover:text-primary text-lg" />

          {/* My Courses Dropdown */}
          {isLoggedIn && (
            <MyCourses
              myCourses={myCourses}
              isOpen={showCoursesMenu}
              onToggle={handleCoursesClick}
              isLoggedIn={isLoggedIn}
            />
          )}
          <div className="relative cursor-pointer hover:text-primary">
            <FaShoppingBag />
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              0
            </span>
          </div>
          {/* User Menu or Login Button */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:text-primary"
              >
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <FaChevronDown className="text-xs" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-100 py-2">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-bold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <NavLink
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span>Tài khoản của tôi</span>
                    </NavLink>
                    <NavLink
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span>Cài đặt</span>
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-red-600 w-full text-left"
                    >
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-sm font-bold uppercase hover:text-primary transition"
            >
              Đăng nhập / Đăng ký
            </button>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <Login
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />
    </>
  );
};

export default Header;
