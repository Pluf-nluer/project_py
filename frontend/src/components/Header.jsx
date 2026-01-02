import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaSearch, FaChevronDown, FaShoppingBag } from "react-icons/fa";
import axios from "axios";
import Login from "../pages/Login";
import MyCourses from "../pages/MyCourses";

const Header = () => {
  // 1. Khởi tạo trạng thái dựa trên Token có sẵn trong máy
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );
  const [user, setUser] = useState({ name: "", email: "", avatar: null });

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCoursesMenu, setShowCoursesMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 2. Tự động lấy thông tin User từ Django khi đã có Token
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserProfile();
    }
  }, [isLoggedIn]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        "http://127.0.0.1:8000/api/courses/profile/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser({
        name: response.data.first_name || response.data.username,
        email: response.data.email,
        avatar: response.data.avatar,
      });
    } catch (error) {
      console.error("Lỗi xác thực hoặc Token hết hạn");
      handleLogout(); // Nếu lỗi (token hết hạn), tự động đăng xuất
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsLoggedIn(false);
    setUser({ name: "", email: "", avatar: null });
    setShowUserMenu(false);
  };

  const handleCoursesClick = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
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
          </ul>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-6 text-gray-600">
          <FaSearch className="cursor-pointer hover:text-primary text-lg" />

          {isLoggedIn && (
            <MyCourses
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

          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:text-primary"
              >
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      className="w-full h-full object-cover"
                    />
                  ) : // Thêm kiểm tra user.name có tồn tại không trước khi charAt
                  user.name ? (
                    user.name.charAt(0).toUpperCase()
                  ) : (
                    "U"
                  )}
                </div>
                <FaChevronDown className="text-xs" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border py-2">
                  <div className="px-4 py-3 border-b">
                    <p className="font-bold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="py-2">
                    <NavLink
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Tài khoản của tôi
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
                    >
                      Đăng xuất
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

      <Login
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLoginSuccess}
      />
    </>
  );
};

export default Header;
