import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Lấy ID từ URL
import axios from "axios";
import {
  FaStar, FaUsers, FaClock, FaBook, FaPlay, FaCheckCircle,
  FaFileAlt, FaGlobe, FaInfinity, FaCertificate,
  FaChevronDown, FaChevronUp, FaQuestionCircle, FaDownload,
} from "react-icons/fa";
import Header from "../components/Header";

// Component con giữ nguyên logic hiển thị
function CourseSection({ section, index }) {
  const [isOpen, setIsOpen] = useState(index === 0);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition">
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-700">Phần {index + 1}:</span>
          <span className="font-semibold text-gray-800">{section.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{section.lessons?.length || 0} bài học</span>
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </button>
      {isOpen && (
        <div className="bg-white">
          {section.lessons?.map((lesson, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border-t border-gray-100 hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <FaPlay className="text-blue-600 text-sm" />
                <span className="text-gray-700">{lesson.title}</span>
              </div>
              <span className="text-sm text-gray-500">{lesson.duration}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseDetail() {
  const { id } = useParams(); // Lấy ID khóa học từ URL /course/:id
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Gọi API lấy dữ liệu từ Backend
  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/courses/${id}/`);
        setCourse(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết khóa học:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetail();
  }, [id]);

  if (loading) return <div className="text-center py-20 font-bold">Đang tải dữ liệu...</div>;
  if (!course) return <div className="text-center py-20">Không tìm thấy khóa học.</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-6 lg:px-10 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <span className="bg-yellow-500 text-gray-900 px-3 py-1 rounded text-sm font-bold">BESTSELLER</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-gray-300 mb-6">{course.subtitle || "Nâng tầm kỹ năng cùng chuyên gia"}</p>
              
              <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-yellow-400">{course.rating}</span>
                  <FaStar className="text-yellow-400" />
                  <span className="text-gray-300">({course.reviews?.length || 0} đánh giá)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers />
                  <span>{course.students_count || 0} học viên</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-gray-300">Giảng viên:</span>
                <span className="font-semibold text-blue-400">{course.instructor_name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 lg:px-10 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* What You'll Learn (Lấy từ trường skills_vector) */}
            <div className="bg-white rounded-xl p-8 mb-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold mb-6">Bạn sẽ học được gì</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {course.skills_vector?.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-t-xl border-b border-gray-200 flex gap-8 px-8 overflow-x-auto">
              {["overview", "curriculum", "instructor", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 font-semibold border-b-2 transition capitalize ${
                    activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"
                  }`}
                >
                  {tab === "overview" ? "Tổng quan" : tab === "curriculum" ? "Nội dung" : tab === "instructor" ? "Giảng viên" : "Đánh giá"}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-xl p-8 shadow-sm border border-gray-200">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Mô tả</h3>
                  <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
                </div>
              )}
              {activeTab === "curriculum" && (
                <div>
                   {course.sections?.map((section, index) => (
                     <CourseSection key={index} section={section} index={index} />
                   ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <img src={course.image || "https://via.placeholder.com/400"} alt={course.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <div className="text-4xl font-bold text-green-600 mb-6">${course.price}</div>
                <button className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition mb-3">
                  Đăng ký ngay
                </button>
                <div className="mt-6 space-y-3 text-sm text-gray-700">
                  <div className="flex items-center gap-3"><FaClock className="text-blue-600"/> <span>{course.duration} tổng thời lượng</span></div>
                  <div className="flex items-center gap-3"><FaBook className="text-blue-600"/> <span>{course.total_lessons} bài học</span></div>
                  <div className="flex items-center gap-3"><FaInfinity className="text-blue-600"/> <span>Truy cập trọn đời</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;