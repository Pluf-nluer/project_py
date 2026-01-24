import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaStar,
  FaClock,
  FaBook,
  FaPlay,
  FaCheckCircle,
  FaGlobe,
  FaCertificate,
  FaQuestionCircle,
  FaDownload,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaChalkboardTeacher,
  FaUserGraduate,
} from "react-icons/fa";
import Header from "../components/Header";
import CourseQuiz from "./CourseQuiz";

// Component con giữ nguyên logic hiển thị
export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]); // State lưu danh sách lớp học phần
  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]); // Thêm state cho list quizzes
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  // --- STATE XỬ LÝ ĐĂNG KÝ ---
  const [message, setMessage] = useState(null); // Nội dung thông báo
  const [errorType, setErrorType] = useState(""); // Loại lỗi: 'success', 'conflict', 'error'

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);

        // 1. Lấy thông tin khóa học (thường cho phép không login)
        const courseRes = await axios.get(
          `http://127.0.0.1:8000/api/courses/${id}/`,
        );
        setCourse(courseRes.data);

        // 2. Lấy danh sách lớp học
        const classesRes = await axios.get(
          `http://127.0.0.1:8000/api/courses/course-classes/?course=${id}`,
        );
        setClasses(classesRes.data.results || classesRes.data);

        // 3. Lấy danh sách bài kiểm tra (yêu cầu token)
        const token = localStorage.getItem("access_token");

        if (token) {
          const quizzesRes = await axios.get(
            `http://127.0.0.1:8000/api/courses/courses/${id}/quizzes/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          console.log("Danh sách quizzes từ CourseDetail:", quizzesRes.data);
          setQuizzes(quizzesRes.data.results || quizzesRes.data || []);
        } else {
          console.log("Chưa có token → không fetch quizzes");
          setQuizzes([]);
        }
      } catch (error) {
        console.error("Lỗi fetch dữ liệu:", error);
        if (error.response?.status === 401) {
          alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("access_token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [id, navigate]);

  // --- HÀM XỬ LÝ ĐĂNG KÝ & CHECK TRÙNG LỊCH ---
  const handleEnroll = async (classId) => {
    // Kiểm tra đăng nhập
    const token = localStorage.getItem("access_token");
    if (!token) {
      if (
        window.confirm(
          "Bạn cần đăng nhập để đăng ký. Chuyển đến trang đăng nhập?",
        )
      ) {
        navigate("/login");
      }
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn đăng ký lớp học này?")) return;

    setMessage(null); // Reset thông báo cũ

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/courses/enroll/",
        { class_id: classId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Thành công
      setErrorType("success");
      setMessage("✅ " + (response.data.message || "Đăng ký thành công!"));

      // Có thể reload lại danh sách lớp để cập nhật sĩ số
      window.location.reload();
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        // --- BẮT LỖI TRÙNG LỊCH ---
        if (status === 409) {
          setErrorType("conflict");
          setMessage(`⚠️ CẢNH BÁO TRÙNG LỊCH: ${errorData.error}`);
        }
        // Lỗi chưa đủ điều kiện tiên quyết hoặc đã học rồi
        else if (status === 400) {
          setErrorType("error");
          setMessage(`❌ Không thể đăng ký: ${errorData.error}`);
        } else {
          setErrorType("error");
          setMessage("Lỗi hệ thống, vui lòng thử lại sau.");
        }
      }
    }
  };

  // --- HÀM XỬ LÝ BẮT ĐẦU LÀM BÀI KIỂM TRA ---
  const handleStartQuiz = (quizId) => {
    console.log("Nhấn nút bắt đầu → quizId:", quizId);
    const token = localStorage.getItem("access_token");
    if (!token) {
      if (
        window.confirm("Bạn cần đăng nhập để làm bài kiểm tra. Đăng nhập ngay?")
      ) {
        navigate("/login");
      }
      return;
    }

    setSelectedQuizId(quizId);
    setShowQuiz(true);
    console.log("Đã set showQuiz = true");
  };

  // Cuộn xuống danh sách lớp
  const scrollToClasses = () => {
    const element = document.getElementById("class-list-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Hàm định dạng tiền tệ Việt Nam
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // === PHẦN RETURN ===
  if (showQuiz) {
    return (
      <CourseQuiz quizId={selectedQuizId} onClose={() => setShowQuiz(false)} />
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20 font-bold">Đang tải dữ liệu...</div>
    );
  }

  if (!course) {
    return <div className="text-center py-20">Không tìm thấy khóa học.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-6 lg:px-10 py-12">
          {/* --- KHU VỰC THÔNG BÁO KẾT QUẢ ĐĂNG KÝ --- */}
          {message && (
            <div
              className={`p-4 mb-8 rounded-lg text-white font-bold text-center text-lg shadow-md animate-bounce-short ${
                errorType === "success"
                  ? "bg-green-600"
                  : errorType === "conflict"
                    ? "bg-orange-500"
                    : "bg-red-600"
              }`}
            >
              {message}
            </div>
          )}
          <div className="max-w-4xl">
            <div className="flex gap-2 mb-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold uppercase">
                {course.category}
              </span>
              <span className="bg-yellow-500 text-gray-900 px-3 py-1 rounded text-xs font-bold uppercase">
                {course.level}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-gray-300 mb-6">
              {course.description.substring(0, 150)}...
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-yellow-400">
                  {parseFloat(course.rating).toFixed(1)}
                </span>
                <FaStar className="text-yellow-400" />
                <span className="text-gray-400">
                  ({course.imported_enrollments || 0} học viên đã học)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaChalkboardTeacher className="text-gray-400" />
                <span>Giảng viên: {course.instructor_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaGlobe className="text-gray-400" />
                <span>Ngôn ngữ: {course.language}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaUserGraduate className="text-gray-400" />
                <span>Cấp độ: {course.level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-10 py-12 grid lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Danh sách lớp học phần */}
          <div
            id="class-list-section"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Lớp học phần đang mở</h2>
            <div className="space-y-6">
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-xl mb-2">{cls.name}</h3>
                        <div className="space-y-2 text-gray-600">
                          <p className="flex items-center gap-2">
                            <FaCalendarAlt /> Khai giảng: {cls.start_date}
                          </p>
                          <p className="flex items-center gap-2">
                            <FaMapMarkerAlt /> Sĩ số: {cls.current_enrollment}/
                            {cls.max_capacity}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEnroll(cls.id)}
                        disabled={cls.current_enrollment >= cls.max_capacity}
                        className={`px-6 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition ${
                          cls.current_enrollment >= cls.max_capacity
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                        }`}
                      >
                        {cls.current_enrollment >= cls.max_capacity
                          ? "Đã Đầy"
                          : "Đăng Ký Học"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">
                  Hiện tại chưa có lớp học phần nào được mở cho môn học này.
                </p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200 bg-gray-50">
              {["overview", "curriculum", "quizzes"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 font-bold transition ${
                    activeTab === tab
                      ? "bg-white text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "overview"
                    ? "Tổng quan"
                    : tab === "curriculum"
                      ? "Nội dung bài học"
                      : "Bài kiểm tra"}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-3">Mô tả khóa học</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">Yêu cầu/Tiền đề</h3>
                    <p className="text-gray-700 flex items-center gap-2">
                      <FaQuestionCircle className="text-blue-500" />
                      {course.prerequisites_text}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "curriculum" && (
                <div>
                  {course.sections && course.sections.length > 0 ? (
                    course.sections.map((section, index) => (
                      // Giả sử bạn có component CourseSection, nếu không thì thay bằng div đơn giản
                      <div key={index}>
                        <h3>{section.title}</h3>
                        {/* Hiển thị lessons */}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500 italic">
                      Nội dung bài học đang được cập nhật...
                    </div>
                  )}
                </div>
              )}

              {activeTab === "quizzes" && (
                <div className="space-y-6">
                  {quizzes.length > 0 ? (
                    quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="bg-white p-6 rounded-lg shadow border border-gray-200"
                      >
                        <h3 className="font-bold text-lg mb-2">{quiz.title}</h3>
                        <p className="text-gray-600 mb-4">{quiz.description}</p>
                        <div className="flex gap-4 text-sm text-gray-500 mb-4">
                          <span>Số câu: {quiz.total_questions}</span>
                          <span>Thời gian: {quiz.time_limit} phút</span>
                          <span>
                            Lượt làm: {quiz.user_attempts_count}/
                            {quiz.max_attempts}
                          </span>
                        </div>
                        <button
                          type="button" // Thêm để tránh form submit
                          onClick={() => handleStartQuiz(quiz.id)}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
                        >
                          📝 Bắt đầu làm bài
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">
                      Chưa có bài kiểm tra cho khóa học này.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="relative group">
              <img
                src={
                  "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png"
                }
                className="w-full h-52 object-cover"
                alt="preview"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <FaPlay className="text-white text-5xl" />
              </div>
            </div>

            <div className="p-6">
              <div className="text-3xl font-bold text-gray-900 mb-6">
                {parseFloat(course.price) === 0
                  ? "Miễn phí"
                  : formatPrice(course.price)}
              </div>
              <button
                onClick={scrollToClasses}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                Đăng ký ngay
              </button>

              <div className="mt-8">
                <h4 className="font-bold mb-4">Khóa học này bao gồm:</h4>
                <ul className="space-y-4 text-sm text-gray-700">
                  <li className="flex items-center gap-3">
                    <FaClock className="text-blue-500" /> {course.duration}{" "}
                    video
                  </li>
                  <li className="flex items-center gap-3">
                    <FaBook className="text-blue-500" /> {course.total_lessons}{" "}
                    bài giảng
                  </li>
                  <li className="flex items-center gap-3">
                    <FaDownload className="text-blue-500" /> Tài liệu tải xuống
                  </li>
                  <li className="flex items-center gap-3">
                    <FaCertificate className="text-blue-500" /> Chứng chỉ hoàn
                    thành
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
