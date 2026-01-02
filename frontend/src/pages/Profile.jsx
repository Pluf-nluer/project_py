import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaCamera,
  FaEdit,
  FaSave,
  FaBook,
  FaClock,
  FaLock,
  FaChevronLeft,
  FaChevronRight,
  FaCalendar,
  FaPhoneAlt,
  FaRegUser,
  FaRegBell,
  FaAward
} from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { IoMailOutline } from "react-icons/io5";
import { FiMapPin } from "react-icons/fi";
import { MdLogin } from "react-icons/md";
import axios from "axios";
import { Link } from "react-router-dom";

const Header = () => (
  <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto flex items-center">
      {/* Nút quay về trang chủ */}
      <Link
        to="/"
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
      >
        <FaArrowLeft size={15} />
        <span>Trang chủ</span>
      </Link>
    </div>
  </header>
);

const EnrolledCourseCard = ({ course }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <div className="relative">
      <img
        src={course.thumbnail || course.image}
        alt={course.title}
        className="w-full h-40 object-cover"
      />
      <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
        {course.progress || 0}% Hoàn thành
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-bold text-lg mb-2 line-clamp-2">{course.title}</h3>
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <FaClock size={16} />
        <span>Cập nhật: {course.last_accessed || course.lastAccessed}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${course.progress || 0}%` }}
        />
      </div>
      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
        Tiếp tục học
      </button>
    </div>
  </div>
);

const WeeklySchedule = ({ hasSchedule, scheduleData }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const dayNames = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];
  const timeSlots = [
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

  const getWeekDates = () => {
    const curr = new Date(currentWeek);
    const first = curr.getDate() - curr.getDay() + 1;
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(curr.setDate(first + i));
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const previousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const formatDateRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${
      end.getMonth() + 1
    }/${end.getFullYear()}`;
  };

  if (!hasSchedule) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center py-12">
          <FaCalendar size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Chưa có thời khóa biểu
          </h3>
          <p className="text-gray-600 mb-6">
            Bạn chưa xếp lịch học cho các khóa học đã đăng ký.
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            Xếp lịch học ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Thời khóa biểu tuần
          </h3>
          <p className="text-gray-600 text-sm">{formatDateRange()}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={previousWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaChevronLeft size={20} />
          </button>
          <button
            onClick={nextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-center font-semibold text-gray-600 text-sm py-2">
              Giờ
            </div>
            {dayNames.map((day, index) => {
              const date = weekDates[index];
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={day}
                  className={`text-center py-2 rounded-lg ${
                    isToday ? "bg-blue-100" : ""
                  }`}
                >
                  <div
                    className={`font-semibold text-sm ${
                      isToday ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    {day}
                  </div>
                  <div
                    className={`text-xs ${
                      isToday ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {date.getDate()}/{date.getMonth() + 1}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-8 gap-2">
            {timeSlots.map((time) => (
              <React.Fragment key={time}>
                <div className="text-xs text-gray-500 py-4 text-right pr-2">
                  {time}
                </div>
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                  const daySchedule = scheduleData?.[dayIndex];
                  const classAtTime = daySchedule?.find((c) => c.time === time);

                  return (
                    <div
                      key={`${time}-${dayIndex}`}
                      className="border border-gray-100 min-h-[60px] rounded relative"
                    >
                      {classAtTime && (
                        <div
                          className={`absolute inset-0 bg-${classAtTime.color}-100 border-l-4 border-${classAtTime.color}-500 rounded p-2`}
                          style={{ height: `${classAtTime.duration * 60}px` }}
                        >
                          <div
                            className={`text-xs font-semibold text-${classAtTime.color}-700`}
                          >
                            {classAtTime.course}
                          </div>
                          <div
                            className={`text-xs text-${classAtTime.color}-600 mt-1`}
                          >
                            {classAtTime.time} -{classAtTime.room}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    avatar: "",
    enrolledCourses: [],
    achievements: [],
    hasSchedule: false,
    scheduleData: [],
  });
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Bạn chưa đăng nhập.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          "http://127.0.0.1:8000/api/courses/profile/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;
        const fullName =
          `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
          "Chưa đặt tên";

        setProfileData({
          name: fullName,
          email: data.email || "",
          phone: data.phone || "",
          location: "", // Backend chưa có, để trống
          bio: data.bio || "Chưa có giới thiệu",
          avatar: data.avatar || "https://via.placeholder.com/200?text=Avatar",
          enrolledCourses: [], // Fetch riêng nếu cần
          achievements: [],
          hasSchedule: false,
          scheduleData: [],
        });

        setEditData({
          name: fullName,
          email: data.email || "",
          phone: data.phone || "",
          location: "",
          bio: data.bio || "",
        });
      } catch (err) {
        console.error("Lỗi lấy profile:", err);
        setError("Không thể tải thông tin. Kiểm tra kết nối backend.");
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleEditProfile = () => {
    setEditData({ ...profileData });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Bạn chưa đăng nhập.");
      return;
    }

    try {
      // 1. Chuẩn bị data text (name, phone, bio)
      const nameParts = editData.name.trim().split(" ");
      const first_name = nameParts.slice(0, -1).join(" ") || "";
      const last_name = nameParts[nameParts.length - 1] || "";

      // 2. Nếu có file avatar mới → dùng FormData để gửi cả text + file
      if (avatarFile) {
        const formData = new FormData();
        formData.append("first_name", first_name);
        formData.append("last_name", last_name);
        formData.append("phone", editData.phone);
        formData.append("bio", editData.bio);
        formData.append("avatar", avatarFile); // File thật

        const response = await axios.patch(
          "http://127.0.0.1:8000/api/courses/profile/",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const data = response.data;

        // Cập nhật state từ response mới (avatar URL mới từ backend)
        const fullName =
          `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
          "Chưa đặt tên";

        setProfileData({
          ...profileData,
          name: fullName,
          email: data.email || profileData.email,
          phone: data.phone || "",
          bio: data.bio || "Chưa có giới thiệu",
          avatar: data.avatar || "https://via.placeholder.com/200?text=Avatar",
        });
      } else {
        // 3. Nếu KHÔNG có avatar mới → chỉ gửi text (JSON)
        const textData = {
          first_name,
          last_name,
          phone: editData.phone,
          bio: editData.bio,
        };

        const response = await axios.patch(
          "http://127.0.0.1:8000/api/courses/profile/",
          textData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = response.data;
        const fullName =
          `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
          "Chưa đặt tên";

        setProfileData({
          ...profileData,
          name: fullName,
          phone: data.phone || "",
          bio: data.bio || "Chưa có giới thiệu",
          // avatar giữ nguyên
        });
      }

      setIsEditingProfile(false);
      setAvatarFile(null); // Reset file sau khi upload
      alert("Cập nhật hồ sơ thành công!");
    } catch (err) {
      console.error("Lỗi cập nhật profile:", err.response?.data || err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.avatar?.[0] ||
        "Vui lòng thử lại.";
      alert("Cập nhật thất bại: " + msg);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return <div>Lỗi: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6 text-center">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ảnh đại diện
                </label>
                <div className="relative inline-block">
                  <img
                    src={
                      editData.avatar ||
                      profileData.avatar ||
                      "https://via.placeholder.com/150?text=Avatar"
                    }
                    alt="Preview Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-md"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 cursor-pointer shadow-lg transition"
                  >
                    <FaCamera size={20} />
                  </label>
                </div>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <h2 className="text-xl font-bold text-center mb-2">
                {profileData.name}
              </h2>
              <p className="text-gray-600 text-center mb-6">Học viên</p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <IoMailOutline size={18} />
                  {profileData.email}
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FaPhoneAlt size={18} />
                  {profileData.phone}
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FiMapPin size={18} />
                  {profileData.location}
                </div>
              </div>

              <button
                onClick={handleEditProfile}
                className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaEdit size={16} />
                Chỉnh sửa hồ sơ
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full px-6 py-4 text-left font-semibold flex items-center gap-3 transition-colors ${
                  activeTab === "overview"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaRegUser size={20} />
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab("courses")}
                className={`w-full px-6 py-4 text-left font-semibold flex items-center gap-3 transition-colors ${
                  activeTab === "courses"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaBook size={20} />
                Khóa học của tôi
              </button>
              <button
                onClick={() => setActiveTab("schedule")}
                className={`w-full px-6 py-4 text-left font-semibold flex items-center gap-3 transition-colors ${
                  activeTab === "schedule"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaCalendar size={20} />
                Thời khóa biểu
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full px-6 py-4 text-left font-semibold flex items-center gap-3 transition-colors ${
                  activeTab === "settings"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <IoIosSettings size={20} />
                Cài đặt
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-green-600 to-blue-400 rounded-lg shadow-sm p-8 text-white">
                  <h2 className="text-3xl font-bold mb-3">
                    👋 Xin chào, {profileData.name}!
                  </h2>
                  <p className="text-blue-50 text-lg">{profileData.bio}</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold mb-6">Tổng quan</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6 text-center">
                      <FaBook
                        className="mx-auto text-blue-600 mb-4"
                        size={32}
                      />
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {profileData.enrolledCourses.length}
                      </div>
                      <div className="text-gray-600">Khóa học đang học</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6 text-center">
                      <FaAward
                        className="mx-auto text-green-600 mb-4"
                        size={32}
                      />
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {profileData.achievements.length}
                      </div>
                      <div className="text-gray-600">Thành tựu đạt được</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6 text-center">
                      <FaClock
                        className="mx-auto text-purple-600 mb-4"
                        size={32}
                      />
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        128
                      </div>
                      <div className="text-gray-600">Giờ học tích lũy</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold mb-6">Khóa học gần đây</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profileData.enrolledCourses
                      .slice(0, 3)
                      .map((course, index) => (
                        <EnrolledCourseCard key={index} course={course} />
                      ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "courses" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Khóa học của tôi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profileData.enrolledCourses.map((course, index) => (
                    <EnrolledCourseCard key={index} course={course} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "achievements" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Thành tựu</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profileData.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow"
                    >
                      <div className="text-4xl mb-4">{achievement.icon}</div>
                      <h3 className="font-bold text-lg mb-2">
                        {achievement.name}
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm">
                        {achievement.description}
                      </p>
                      <div className="text-gray-500 text-xs">
                        {achievement.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "schedule" && (
              <WeeklySchedule
                hasSchedule={profileData.hasSchedule}
                scheduleData={profileData.scheduleData}
              />
            )}

            {activeTab === "settings" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Cài đặt tài khoản</h2>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <FaLock className="text-gray-600" size={20} />
                      <div className="text-left">
                        <div className="font-semibold">Đổi mật khẩu</div>
                        <div className="text-sm text-gray-600">
                          Cập nhật mật khẩu của bạn
                        </div>
                      </div>
                    </div>
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <FaRegBell className="text-gray-600" size={20} />
                      <div className="text-left">
                        <div className="font-semibold">Thông báo</div>
                        <div className="text-sm text-gray-600">
                          Quản lý cài đặt thông báo
                        </div>
                      </div>
                    </div>
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-red-600">
                    <div className="flex items-center gap-3">
                      <MdLogin size={20} />
                      <div className="text-left">
                        <div className="font-semibold">Đăng xuất</div>
                        <div className="text-sm">Đăng xuất khỏi tài khoản</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Chỉnh sửa hồ sơ</h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <IoCloseSharp  size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({ ...editData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) =>
                      setEditData({ ...editData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) =>
                      setEditData({ ...editData, location: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giới thiệu bản thân
                  </label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) =>
                      setEditData({ ...editData, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
                >
                  <FaSave size={18} />
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;