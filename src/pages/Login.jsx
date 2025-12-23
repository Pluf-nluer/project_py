import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Đảm bảo đã chạy: npm install axios

const Auth = ({ isOpen, onClose, onLogin }) => {
  const [authMode, setAuthMode] = useState("login");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 1. Quản lý dữ liệu nhập vào (Form State)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Xóa lỗi khi người dùng bắt đầu nhập lại
  };

  // 2. Hàm Xử lý Đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("access_token", response.data.access);

      // GIẢ SỬ: Backend trả về thêm thông tin is_staff hoặc is_superuser
      if (response.data.user.is_staff) {
        window.location.href = "http://127.0.0.1:8000/admin/";
      } else {
        onLogin();
        onClose();
      }
    } catch (err) {
      setError("Email hoặc mật khẩu không chính xác.");
    }
  };

  // 3. Hàm Xử lý Đăng ký
  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/register/", {
        email: formData.email,
        password: formData.password,
        first_name: formData.fullName, // Gửi fullName vào field first_name của Django
      });

      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      setAuthMode("login"); // Chuyển sang chế độ đăng nhập sau khi đăng ký xong
    } catch (err) {
      setError(
        err.response?.data?.email || "Đăng ký thất bại. Vui lòng thử lại."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <div className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
            <span className="text-primary text-4xl">N</span>
            <span className="text-text-dark">NLU Learning</span>
          </div>
          <p className="text-gray-500">
            {authMode === "login" ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}
          </p>
          {error && (
            <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>
          )}
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setAuthMode("login")}
            className={`flex-1 py-2 font-semibold rounded-lg transition ${
              authMode === "login"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setAuthMode("register")}
            className={`flex-1 py-2 font-semibold rounded-lg transition ${
              authMode === "register"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Đăng ký
          </button>
        </div>

        <form
          onSubmit={authMode === "login" ? handleLogin : handleRegister}
          className="space-y-4"
        >
          {authMode === "register" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ và tên
              </label>
              <input
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Họ và tên"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Nhập email của bạn"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {authMode === "register" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Xác nhận mật khẩu"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition shadow-lg"
          >
            {authMode === "login" ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        {authMode === "login" && (
          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Hoặc tiếp tục với Admin
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate("/admin")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <span className="text-sm font-medium">
                Truy cập trang Quản trị
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
