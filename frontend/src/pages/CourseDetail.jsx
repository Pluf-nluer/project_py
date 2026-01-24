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
import SurveyModal from "./SurveyModal";
import Login from "./Login";

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

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);


  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // 1. Fetch course detail... (như code cũ của bạn)
    // Giả sử API trả về field is_enrolled
    // setIsEnrolled(courseRes.data.is_enrolled);

    // 2. Kiểm tra xem đã làm khảo sát chưa (Logic mẫu)
    const hasSurveyed = localStorage.getItem("has_surveyed");
    if (!hasSurveyed) {
      setShowSurvey(true);
      localStorage.setItem("has_surveyed", "true");
    }
  }, [id]);
  const renderEnrollButton = () => {
    if (isEnrolled) {
      return (
        <button
          onClick={() => navigate(`/learning/${id}`)}
          className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2"
        >
          <FaPlay className="text-sm" /> Vào học ngay
        </button>
      );
    }

    return (
      <button
        onClick={scrollToClasses}
        className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
      >
        Đăng ký ngay
      </button>
    );
  };

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);

        // --- BƯỚC 2: PHẢI LẤY TOKEN LÊN ĐẦU TIÊN ---
        const token = localStorage.getItem("access_token");

        // Gửi token kèm theo ngay từ bước này để backend trả về is_enrolled
        const courseRes = await axios.get(
          `http://127.0.0.1:8000/api/courses/${id}/`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );
        setCourse(courseRes.data);
        setIsEnrolled(courseRes.data.is_enrolled || false);

        // Kiểm tra Survey: Hiện nếu có token và chưa hiện trong session này
        if (token && !sessionStorage.getItem("survey_shown")) {
          setShowSurvey(true);
          sessionStorage.setItem("survey_shown", "true");
        }

        // --- BƯỚC 3: CÁC FETCH SAU DÙNG TOKEN ĐÃ CÓ ---
        const classesRes = await axios.get(
          `http://127.0.0.1:8000/api/courses/course-classes/?course=${id}`,
        );
        setClasses(classesRes.data.results || classesRes.data);

        if (token) {
          const quizzesRes = await axios.get(
            `http://127.0.0.1:8000/api/courses/courses/${id}/quizzes/`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setQuizzes(quizzesRes.data.results || quizzesRes.data || []);
        }
      } catch (error) {
        console.error("Lỗi fetch dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [id]);

  const handleLoginSuccess = () => {
    setShowAuthModal(false);
    window.location.reload(); // Load lại trang để cập nhật trạng thái đã đăng nhập và fetch lại dữ liệu
  };

  // --- HÀM XỬ LÝ ĐĂNG KÝ & CHECK TRÙNG LỊCH ---
  const handleEnroll = async (classId) => {
    // Kiểm tra đăng nhập
    const token = localStorage.getItem("access_token");
    if (!token) {
      setShowAuthModal(true);
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

      setTimeout(() => {
        setShowSurvey(true);
      }, 1500); // Hiện sau 1.5s để user kịp nhìn thấy thông báo thành công

      // Cập nhật lại trạng thái đã đăng ký để đổi nút thành "Vào học"
      setIsEnrolled(true);
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
      setShowAuthModal(true);
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
      <SurveyModal isOpen={showSurvey} onClose={() => setShowSurvey(false)} />
      <Header />
      <Login
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLoginSuccess}
      />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-6 lg:px-10 py-12">
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
                  ({course.imported_enrollments || 0} học viên)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaChalkboardTeacher className="text-gray-400" />
                <span>{course.instructor_name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-10 py-12 grid lg:grid-cols-3 gap-12">
        {/* MAIN CONTENT (LEFT) */}
        <div className="lg:col-span-2 space-y-8">
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
                      ? "Nội dung"
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
                      <FaQuestionCircle className="text-blue-500" />{" "}
                      {course.prerequisites_text ||
                        "Không yêu cầu kiến thức trước."}
                    </p>
                  </div>
                </div>
              )}
              {activeTab === "curriculum" && (
                <div className="text-center py-10 text-gray-500 italic">
                  Nội dung bài học đang cập nhật...
                </div>
              )}
              {activeTab === "quizzes" && (
                <div className="space-y-4">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="p-4 border rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-bold">{quiz.title}</h4>
                        <p className="text-sm text-gray-500">
                          {quiz.time_limit} phút | {quiz.total_questions} câu
                          hỏi
                        </p>
                      </div>
                      <button
                        onClick={() => handleStartQuiz(quiz.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm"
                      >
                        Làm bài
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR (RIGHT) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
              <img
                src="https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png"
                className="w-full h-48 object-cover"
                alt="preview"
              />

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900">
                    {parseFloat(course.price) === 0
                      ? "Miễn phí"
                      : formatPrice(course.price)}
                  </span>
                </div>

                {/* KHỐI LỚP HỌC PHẦN (THAY THẾ NÚT ĐĂNG KÝ CŨ) */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-600" /> Lớp học phần
                    đang mở
                  </h4>

                  {isEnrolled ? (
                    <button
                      onClick={() => navigate(`/learning/${id}`)}
                      className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2"
                    >
                      <FaPlay /> Vào học ngay
                    </button>
                  ) : (
                    <div className="space-y-3">
                      {classes.length > 0 ? (
                        classes.map((cls) => (
                          <div
                            key={cls.id}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-sm">
                                {cls.name}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <FaMapMarkerAlt /> {cls.current_enrollment}/
                                {cls.max_capacity}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-3 italic">
                              Khai giảng: {cls.start_date}
                            </p>
                            <button
                              onClick={() => handleEnroll(cls.id)}
                              disabled={
                                cls.current_enrollment >= cls.max_capacity
                              }
                              className={`w-full py-2 rounded font-bold text-xs transition ${
                                cls.current_enrollment >= cls.max_capacity
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                              }`}
                            >
                              {cls.current_enrollment >= cls.max_capacity
                                ? "Lớp đã đầy"
                                : "Đăng ký lớp này"}
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          Hiện chưa có lớp học phần nào được mở.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* THÔNG TIN KHÓA HỌC BAO GỒM */}
                <div className="border-t pt-6">
                  <h4 className="font-bold mb-4">Khóa học này bao gồm:</h4>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-center gap-3">
                      <FaClock className="text-blue-500 w-4" />{" "}
                      {course.duration || "10h 45m"} video
                    </li>
                    <li className="flex items-center gap-3">
                      <FaBook className="text-blue-500 w-4" />{" "}
                      {course.total_lessons || 0} bài giảng
                    </li>
                    <li className="flex items-center gap-3">
                      <FaDownload className="text-blue-500 w-4" /> Tài liệu tải
                      xuống
                    </li>
                    <li className="flex items-center gap-3">
                      <FaCertificate className="text-blue-500 w-4" /> Chứng chỉ
                      hoàn thành
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
