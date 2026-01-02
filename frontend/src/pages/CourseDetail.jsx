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
export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/courses/${id}/`);
        setCourse(response.data);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetail();
  }, [id]);

  if (loading) return <div className="text-center py-20 font-bold">Đang tải dữ liệu...</div>;
  if (!course) return <div className="text-center py-20">Không tìm thấy khóa học.</div>;

  // Hàm định dạng tiền tệ Việt Nam
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-6 lg:px-10 py-12">
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
            <p className="text-xl text-gray-300 mb-6">{course.description.substring(0, 150)}...</p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-yellow-400">
                  {parseFloat(course.rating).toFixed(1)}
                </span>
                <FaStar className="text-yellow-400" />
                <span className="text-gray-400">({course.imported_enrollments || 0} học viên đã học)</span>
              </div>
              <div className="flex items-center gap-2">
                <FaGlobe />
                <span>{course.language}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-10 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            
            {/* What You'll Learn - Chỉ hiển thị nếu có dữ liệu */}
            {course.skills_vector && course.skills_vector.length > 0 && (
              <div className="bg-white rounded-xl p-8 mb-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold mb-6">Bạn sẽ học được gì</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {course.skills_vector.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200 bg-gray-50">
                {["overview", "curriculum"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-4 font-bold transition ${
                      activeTab === tab ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab === "overview" ? "Tổng quan" : "Nội dung bài học"}
                  </button>
                ))}
              </div>

              <div className="p-8">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-3">Mô tả khóa học</h3>
                      <p className="text-gray-700 leading-relaxed">{course.description}</p>
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
                        <CourseSection key={index} section={section} index={index} />
                      ))
                    ) : (
                      <div className="text-center py-10 text-gray-500 italic">
                        Nội dung bài học đang được cập nhật...
                      </div>
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
                  src={"https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png"} 
                  className="w-full h-52 object-cover" 
                  alt="preview"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <FaPlay className="text-white text-5xl" />
                </div>
              </div>
              
              <div className="p-6">
                <div className="text-3xl font-bold text-gray-900 mb-6">
                  {parseFloat(course.price) === 0 ? "Miễn phí" : formatPrice(course.price)}
                </div>
                <button className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                  Đăng ký ngay
                </button>
                
                <div className="mt-8">
                  <h4 className="font-bold mb-4">Khóa học này bao gồm:</h4>
                  <ul className="space-y-4 text-sm text-gray-700">
                    <li className="flex items-center gap-3"><FaClock className="text-blue-500"/> {course.duration} video</li>
                    <li className="flex items-center gap-3"><FaBook className="text-blue-500"/> {course.total_lessons} bài giảng</li>
                    <li className="flex items-center gap-3"><FaDownload className="text-blue-500"/> Tài liệu tải xuống</li>
                    <li className="flex items-center gap-3"><FaCertificate className="text-blue-500"/> Chứng chỉ hoàn thành</li>
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