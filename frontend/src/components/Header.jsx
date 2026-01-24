import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import axios from "axios";
import Login from "../pages/Login";
import MyCourses from "../pages/MyCourses";
import SurveyModal from "../pages/SurveyModal";
import QuizInviteModal from "../pages/QuizInviteModal";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token"),
  );
  const [user, setUser] = useState({ name: "", email: "", avatar: null });

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCoursesMenu, setShowCoursesMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [myCourses, setMyCourses] = useState([]);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showQuizInvite, setShowQuizInvite] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserProfile();
      fetchMyCourses();
    }
  }, [isLoggedIn]);

  const fetchMyCourses = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(
        "http://127.0.0.1:8000/api/courses/my-courses/",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMyCourses(res.data);
    } catch (err) {
      setMyCourses([]);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(
        "http://127.0.0.1:8000/api/courses/profile/",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setUser({
        name: res.data.first_name || res.data.username,
        email: res.data.email,
        avatar: res.data.avatar,
      });
    } catch {
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.clear();

    setIsLoggedIn(false);
    setUser({ name: "", email: "", avatar: null });
    setShowUserMenu(false);
  };

  const handleCoursesClick = () => {
    if (!isLoggedIn) setShowAuthModal(true);
    else setShowCoursesMenu(!showCoursesMenu);
  };
  const handleLoginSuccess = async () => {
    setIsLoggedIn(true);
    setShowAuthModal(false);

    // ✅ GỌI API thay vì check localStorage
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        "http://127.0.0.1:8000/api/courses/check-survey/",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();

      if (!data.is_surveyed) {
        setTimeout(() => setShowSurvey(true), 500);
      } else if (!data.is_quizzed) {
        setTimeout(() => setShowQuizInvite(true), 500);
      }
    } catch (error) {
      console.error("Lỗi check survey/quiz:", error);
    }
  };

  const handleSurveyComplete = () => {
    setShowSurvey(false);
    handleLoginSuccess();
  };

  const handleStartQuiz = () => {
    setShowQuizInvite(false);
    navigate("/placement-quiz");
  };

  return (
    <>
      <header className="flex items-center px-10 py-4 bg-white shadow-sm sticky top-0 z-50">
        {/* LEFT: Logo + Menu */}
        <div className="flex items-center gap-12">
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
            </ul>
          </nav>
        </div>

        {/* RIGHT: Search + User */}
        <div className="ml-auto flex items-center gap-6 text-gray-600">
          <FaSearch className="cursor-pointer hover:text-primary text-lg" />

          {isLoggedIn && (
            <MyCourses
              myCourses={myCourses}
              isOpen={showCoursesMenu}
              onToggle={handleCoursesClick}
              isLoggedIn={isLoggedIn}
            />
          )}

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
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name?.charAt(0)?.toUpperCase() || "U"
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
              className="text-sm font-bold uppercase hover:text-primary"
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
      <SurveyModal
        isOpen={showSurvey}
        onClose={() => setShowSurvey(false)}
        onComplete={handleSurveyComplete}
      />

      <QuizInviteModal
        isOpen={showQuizInvite}
        onClose={() => setShowQuizInvite(false)}
        onAccept={handleStartQuiz}
      />
    </>
  );
};

export default Header;
