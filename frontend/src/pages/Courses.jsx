import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaUsers, FaStar } from "react-icons/fa";
import { CiFilter, CiClock2 } from "react-icons/ci";
import { FiBookOpen } from "react-icons/fi";
import { Link } from "react-router-dom";
import Header from "../components/Header";

// 1. Course Card Component: Đã sửa tên trường để khớp với Backend JSON
function CourseCard({ course }) {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 cursor-pointer">
      <div className="relative overflow-hidden">
        <img
          // Nếu image từ backend là null, sử dụng ảnh placeholder
          src={"https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png"}
          alt={course.title}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/95 backdrop-blur-sm text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
            {course.category}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
            <FaStar size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-gray-900">
              {parseFloat(course.rating).toFixed(1)}
            </span>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
            <Link to={`/course/${course.id}`} className="block">
              <button className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-semibold hover:bg-yellow-600 hover:text-white transition-colors">
                Xem chi tiết
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors line-clamp-2 leading-tight h-14">
          {course.title}
        </h3>
        <div className="flex items-center gap-2 mb-4">
          <img
            src="https://secure.gravatar.com/avatar/7604638c9451218c07f13019b9f39553?s=96&d=mm&r=g"
            className="w-5 h-5 rounded-full"
            alt="instructor"
          />
          <span className="text-gray-600 text-sm font-medium">
            {course.instructor_name}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-5 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <FaUsers size={16} className="text-blue-500" />
            {/* Nếu backend chưa trả về students_count, mặc định là 0 */}
            <span className="font-medium">{course.students_count || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FiBookOpen size={16} className="text-purple-500" />
            <span className="font-medium">{course.total_lessons} bài</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CiClock2 size={16} className="text-orange-500" />
            <span className="font-medium">{course.duration}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-2xl font-bold ${parseFloat(course.price) === 0 ? 'text-blue-600' : 'text-green-600'}`}>
            {parseFloat(course.price) === 0 ? "Miễn phí" : `$${course.price}`}
          </span>
          <button className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
             </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. Main Courses Component: Logic lọc đã được đồng bộ với tên trường Backend
function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [ratingFilters, setRatingFilters] = useState([]);

  const categories = ["All", ...new Set(courses.map(c => c.category))];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Gọi API lấy danh sách khóa học
        const response = await axios.get("http://127.0.0.1:8000/api/courses/");
        setCourses(response.data);
      } catch (error) {
        console.error("Lỗi khi kết nối API:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleRatingChange = (rating) => {
    setRatingFilters((prev) =>
      prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
    );
  };

  const filteredCourses = courses.filter((course) => {
    // Tìm kiếm theo Tiêu đề hoặc Tên giảng viên
    const matchesSearch = 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.instructor_name || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    
    const priceValue = parseFloat(course.price);
    const matchesPrice =
      priceFilter === "All" ||
      (priceFilter === "Free" && priceValue === 0) ||
      (priceFilter === "Paid" && priceValue > 0);

    const matchesRating = ratingFilters.length === 0 || ratingFilters.some((r) => course.rating >= r);

    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  });

  if (loading) return <div className="text-center py-20 font-bold text-xl">Đang tải dữ liệu từ máy chủ...</div>;

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <Header />
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-green-600 to-green-500 text-white py-20 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-10 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">Khám phá khóa học <span className="text-yellow-300">tuyệt vời nhất</span></h1>
            <div className="bg-white rounded-2xl p-2 shadow-2xl max-w-2xl flex items-center">
                <FaSearch className="text-gray-400 ml-4" size={20} />
                <input 
                 type="text" 
                 placeholder="Tìm tên khóa học hoặc giảng viên..." 
                 className="flex-1 p-3 outline-none text-black"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-10 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-1/4">
            <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24">
              <h3 className="font-bold mb-4 flex items-center gap-2"><CiFilter /> Bộ lọc</h3>
              <div className="mb-6">
                  <h4 className="font-semibold mb-2">Giá</h4>
                  {["All", "Free", "Paid"].map(p => (
                    <label key={p} className="flex items-center gap-2 mb-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="price" 
                        className="w-4 h-4 text-blue-600"
                        checked={priceFilter === p} 
                        onChange={() => setPriceFilter(p)} 
                      />
                      <span className="group-hover:text-blue-600 transition-colors">
                        {p === "All" ? "Tất cả" : p === "Free" ? "Miễn phí" : "Có phí"}
                      </span>
                    </label>
                  ))}
              </div>
              <div>
                  <h4 className="font-semibold mb-2">Đánh giá</h4>
                  {[4.5, 4.0, 3.5].map(r => (
                    <label key={r} className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={ratingFilters.includes(r)} 
                        onChange={() => handleRatingChange(r)}
                      />
                      <span className="flex items-center gap-1">{r} <FaStar className="text-yellow-400" size={12}/> trở lên</span>
                    </label>
                  ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            {/* Category Tabs */}
            <div className="mb-8 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
               {categories.map(cat => (
                 <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-8 py-2.5 rounded-full border transition-all duration-300 font-medium whitespace-nowrap ${
                    selectedCategory === cat
                    ? 'bg-green-600 text-white border-green-600 shadow-md transform scale-105' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-green-600'
                  }`}
                 >
                   {cat}
                 </button>
               ))}
            </div>

            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300">
                <div className="text-gray-400 mb-4 text-5xl">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
                <p className="text-gray-500">Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Courses;