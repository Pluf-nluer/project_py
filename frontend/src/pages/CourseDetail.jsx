import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaStar,
  FaClock,
  FaBook,
  FaPlay,
  FaCheckCircle,
  FaQuestionCircle,
  FaDownload,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaChalkboardTeacher,
  FaCertificate,
} from "react-icons/fa";
import Header from "../components/Header";
import CourseQuiz from "./CourseQuiz";
import Login from "./Login";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [message, setMessage] = useState(null);
  const [errorType, setErrorType] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolledClass, setEnrolledClass] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");

        // Fetch course detail với token để lấy is_enrolled
        const courseRes = await axios.get(
          `http://127.0.0.1:8000/api/courses/${id}/`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );

        setCourse(courseRes.data);
        setIsEnrolled(courseRes.data.is_enrolled || false);
        setEnrolledClass(courseRes.data.enrolled_class || null);

        // Fetch classes
        const classesRes = await axios.get(
          `http://127.0.0.1:8000/api/courses/course-classes/?course=${id}`,
        );
        setClasses(classesRes.data.results || classesRes.data);

        // Fetch quizzes nếu đã login
        if (token) {
          try {
            const quizzesRes = await axios.get(
              `http://127.0.0.1:8000/api/courses/courses/${id}/quizzes/`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            setQuizzes(quizzesRes.data.results || quizzesRes.data || []);
          } catch (err) {
            console.log("Không thể tải quizzes:", err);
          }
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
    window.location.reload();
  };

  const handleEnroll = async (classId) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn đăng ký lớp học này?")) return;

    setMessage(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/courses/enroll/",
        { class_id: classId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMessage("✓ Đăng ký thành công! Chuyển đến trang học...");
      setErrorType("success");

      // Reload để cập nhật trạng thái
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        if (status === 409) {
          setErrorType("conflict");
          setMessage(`⚠️ CẢNH BÁO TRÙNG LỊCH: ${errorData.error}`);
        } else if (status === 400) {
          setErrorType("error");
          setMessage(`✖ Không thể đăng ký: ${errorData.error}`);
        } else {
          setErrorType("error");
          setMessage("Lỗi hệ thống, vui lòng thử lại sau.");
        }
      }
    }
  };

  const handleStartQuiz = (quizId) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    setSelectedQuizId(quizId);
    setShowQuiz(true);
  };

  const scrollToClasses = () => {
    const element = document.getElementById("class-list-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (showQuiz) {
    return (
      <CourseQuiz quizId={selectedQuizId} onClose={() => setShowQuiz(false)} />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Không tìm thấy khóa học.</p>
          <button
            onClick={() => navigate("/courses")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
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
              className={`p-4 mb-8 rounded-lg text-white font-bold text-center text-lg shadow-md ${
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
              {isEnrolled && (
                <span className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold uppercase flex items-center gap-1">
                  <FaCheckCircle /> ĐÃ ĐĂNG KÝ
                </span>
              )}
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
                      <FaQuestionCircle className="text-blue-500" />
                      {course.prerequisites_text ||
                        "Không yêu cầu kiến thức trước."}
                    </p>
                  </div>
                </div>
              )}
              {activeTab === "curriculum" && (
                <div className="space-y-4">
                  {course.modules && course.modules.length > 0 ? (
                    course.modules.map((module, index) => (
                      <div
                        key={module.id}
                        className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
                      >
                        {/* Tiêu đề Phần học (Module) */}
                        <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                          <h4 className="font-bold text-gray-800 flex items-center gap-3">
                            <span className="bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full text-xs">
                              {index + 1}
                            </span>
                            {module.title}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {module.lessons?.length || 0} bài học
                          </span>
                        </div>

                        {/* Danh sách Bài học (Lessons) */}
                        <div className="divide-y divide-gray-100">
                          {module.lessons && module.lessons.length > 0 ? (
                            module.lessons.map((lesson, lIndex) => (
                              <div
                                key={lesson.id}
                                className="p-4 flex justify-between items-center hover:bg-gray-50 transition cursor-pointer group"
                              >
                                <div className="flex items-center gap-3">
                                  <FaPlay className="text-gray-400 group-hover:text-blue-500 text-xs" />
                                  <span className="text-gray-700 font-medium">
                                    Bài {index + 1}.{lIndex + 1}: {lesson.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-4">
                                  {lesson.is_preview && (
                                    <span className="text-[10px] font-bold uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200">
                                      Học thử
                                    </span>
                                  )}
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <FaClock className="text-xs" />
                                    <span>{lesson.duration || "00:00"}</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-sm text-gray-400 italic">
                              Chưa có bài học nào trong phần này.
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      Khóa học này hiện chưa có nội dung chi tiết.
                    </div>
                  )}
                </div>
              )}
              {activeTab === "quizzes" && (
                <div className="space-y-4">
                  {quizzes.length > 0 ? (
                    quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="p-4 border rounded-lg flex justify-between items-center hover:shadow-md transition"
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
                          className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-green-700"
                        >
                          Làm bài
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      Chưa có bài kiểm tra nào
                    </div>
                  )}
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
                src={
                  course.image ||
                  "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png"
                }
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

                {/* Nút hành động */}
                <div>
                  {isEnrolled ? (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                          <FaCheckCircle />
                          Bạn đã đăng ký khóa học này
                        </div>
                        {enrolledClass && (
                          <p className="text-sm text-gray-600">
                            Lớp:{" "}
                            <span className="font-semibold">
                              {enrolledClass.class_name}
                            </span>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/learning/${id}`)}
                        className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2"
                      >
                        <FaPlay /> Vào học ngay
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4" id="class-list-section">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-600" /> Lớp học phần
                        đang mở
                      </h4>
                      {classes.length > 0 ? (
                        <div className="space-y-3">
                          {classes.map((cls) => (
                            <div
                              key={cls.id}
                              className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-300 transition"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-sm">
                                  {cls.name}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <FaMapMarkerAlt />
                                  {cls.current_enrollment || 0}/
                                  {cls.max_capacity}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mb-3 italic">
                                Khai giảng: {cls.start_date}
                              </p>
                              <button
                                onClick={() => handleEnroll(cls.id)}
                                disabled={cls.is_full}
                                className={`w-full py-2 rounded font-bold text-xs transition ${
                                  cls.is_full
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                                }`}
                              >
                                {cls.is_full ? "Lớp đã đầy" : "Đăng ký lớp này"}
                              </button>
                            </div>
                          ))}
                        </div>
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
                      <FaClock className="text-blue-500 w-4" />
                      {course.duration || "10h 45m"} video
                    </li>
                    <li className="flex items-center gap-3">
                      <FaBook className="text-blue-500 w-4" />
                      {course.total_lessons || 0} bài giảng
                    </li>
                    <li className="flex items-center gap-3">
                      <FaDownload className="text-blue-500 w-4" />
                      Tài liệu tải xuống
                    </li>
                    <li className="flex items-center gap-3">
                      <FaCertificate className="text-blue-500 w-4" />
                      Chứng chỉ hoàn thành
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
