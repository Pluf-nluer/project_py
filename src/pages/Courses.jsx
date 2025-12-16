import React, { useState } from "react";
import { FaSearch, FaChevronDown, FaUsers, FaStar } from "react-icons/fa";
import { CiFilter, CiClock2 } from "react-icons/ci";
import { FiBookOpen } from "react-icons/fi";
import { Link } from "react-router-dom";
import Header from "../components/Header";

// Course Card Component
function CourseCard({ course }) {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 cursor-pointer">
      <div className="relative overflow-hidden">
        <img
          src={course.image}
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
              {course.rating}
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
          />
          <span className="text-gray-600 text-sm font-medium">
            {course.instructor}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-5 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <FaUsers size={16} className="text-blue-500" />
            <span className="font-medium">{course.students}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FiBookOpen size={16} className="text-purple-500" />
            <span className="font-medium">{course.lessons} bài</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CiClock2 size={16} className="text-orange-500" />
            <span className="font-medium">{course.duration}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            {course.price === "Miễn phí" ? (
              <span className="text-2xl font-bold text-blue-600">
                {course.price}
              </span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-600">
                  {course.price}
                </span>
              </div>
            )}
          </div>
          <button className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Courses Component
function Courses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [ratingFilters, setRatingFilters] = useState([]);

  const categories = [
    { name: "All" },
    { name: "Photography" },
    { name: "IT & Software" },
    { name: "Art" },
    { name: "Backend" },
  ];

  const allCourses = [
    {
      id: 1,
      title: "Introduction to LearnPress – LMS Plugin",
      instructor: "John Doe",
      image:
        "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
      category: "Photography",
      price: "Miễn phí",
      students: 120,
      lessons: 10,
      duration: "2h 30m",
      rating: 4.8,
    },
    {
      id: 2,
      title: "Learning jQuery Mobile for Beginners",
      instructor: "Kenny White",
      image:
        "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
      category: "IT & Software",
      price: "$59.00",
      students: 50,
      lessons: 25,
      duration: "5h 15m",
      rating: 4.6,
    },
    {
      id: 3,
      title: "The Art of Black & White Photography",
      instructor: "John Doe",
      image:
        "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
      category: "Art",
      price: "$39.00",
      students: 230,
      lessons: 6,
      duration: "3h 45m",
      rating: 4.9,
    },
    {
      id: 4,
      title: "Become a PHP Master and Make Money",
      instructor: "Harry Potter",
      image:
        "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
      category: "Backend",
      price: "$69.00",
      students: 150,
      lessons: 40,
      duration: "8h 20m",
      rating: 4.7,
    },
    {
      id: 5,
      title: "Complete Web Design Course",
      instructor: "Sarah Johnson",
      image:
        "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
      category: "Art",
      price: "$79.00",
      students: 340,
      lessons: 35,
      duration: "10h 30m",
      rating: 4.8,
    },
    {
      id: 6,
      title: "Digital Marketing Masterclass",
      instructor: "Mike Smith",
      image:
        "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
      category: "IT & Software",
      price: "$49.00",
      students: 280,
      lessons: 20,
      duration: "6h 15m",
      rating: 4.5,
    },
    {
      id: 7,
      title: "Business Strategy Fundamentals",
      instructor: "Emily Brown",
      image:
        "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
      category: "Art",
      price: "Miễn phí",
      students: 190,
      lessons: 15,
      duration: "4h 00m",
      rating: 4.6,
    },
    {
      id: 8,
      title: "Advanced Photography Techniques",
      instructor: "David Lee",
      image:
        "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
      category: "Photography",
      price: "$89.00",
      students: 420,
      lessons: 30,
      duration: "7h 45m",
      rating: 4.9,
    },
  ];
  const handleRatingChange = (rating) => {
    setRatingFilters((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating]
    );
  };

  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;
    const matchesPrice =
      priceFilter === "All" ||
      (priceFilter === "Free" && course.price === "Miễn phí") ||
      (priceFilter === "Paid" && course.price !== "Miễn phí");

    const matchesRating =
      ratingFilters.length === 0 ||
      ratingFilters.some((r) => course.rating >= r);

    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  });

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <Header />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-green-600 to-green-500 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="container mx-auto px-6 lg:px-10 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
              🎓 Hơn 10,000+ học viên đã tin tưởng
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Khám phá khóa học
              <br />
              <span className="text-yellow-300">tuyệt vời nhất</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Học từ những chuyên gia hàng đầu. Nâng cao kỹ năng của bạn với hơn
              1000+ khóa học chất lượng cao.
            </p>

            {/* Search Bar in Hero */}
            <div className="bg-white rounded-2xl p-2 shadow-2xl max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-3 px-4">
                  <FaSearch className="text-gray-400" size={24} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm khóa học bạn muốn..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-3 focus:outline-none text-gray-900 placeholder-gray-400"
                  />
                </div>
                <button className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-all duration-300">
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-10 py-5">
        {/* Quick Category Filter */}
        <div className="mb-8 overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max justify-center">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  selectedCategory === category.name
                    ? "bg-gradient-to-r from-green-600 to-green-600 text-white shadow-lg scale-105"
                    : "bg-white text-gray-700 hover:shadow-md border border-gray-200"
                }`}
              >
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block lg:w-75">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2 text-gray-900">
                <CiFilter size={22} className="text-blue-600" />
                Bộ lọc nâng cao
              </h3>

              {/* Price Filter */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  Giá khóa học
                </h4>
                <div className="space-y-3">
                  {["All", "Free", "Paid"].map((price) => (
                    <label
                      key={price}
                      className="flex items-center cursor-pointer group"
                    >
                      <div className="relative">
                        <input
                          type="radio"
                          name="price"
                          checked={priceFilter === price}
                          onChange={() => setPriceFilter(price)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all"></div>
                        <div className="absolute inset-0 m-auto w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                      </div>
                      <span className="ml-3 text-gray-700 group-hover:text-gray-900 font-medium transition-colors">
                        {price === "All"
                          ? "Tất cả"
                          : price === "Free"
                          ? "Miễn phí"
                          : "Có phí"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  Trình độ
                </h4>
                <div className="space-y-3">
                  {["Beginner", "Intermediate", "Advanced"].map((level) => (
                    <label
                      key={level}
                      className="flex items-center cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-gray-900 font-medium transition-colors">
                        {level === "Beginner"
                          ? "Cơ bản"
                          : level === "Intermediate"
                          ? "Trung cấp"
                          : "Nâng cao"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  ⭐ Đánh giá
                </h4>
                <div className="space-y-3">
                  {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                    <label
                      key={rating}
                      className="flex items-center cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={ratingFilters.includes(rating)}
                        onChange={() => handleRatingChange(rating)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            size={16}
                            className={
                              i < Math.floor(rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                        <span className="ml-1 text-gray-700 group-hover:text-gray-900 font-medium">
                          {rating}+
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Tìm thấy {filteredCourses.length} khóa học
                  </h2>
                  <p className="text-gray-600">
                    Phù hợp với tiêu chí tìm kiếm của bạn
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl font-semibold text-gray-700">
                    <CiFilter size={18} />
                    Lọc
                  </button>
                  <div className="relative">
                    <select className="appearance-none bg-gray-100 border-0 rounded-xl px-6 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-700 cursor-pointer">
                      <option>Mới nhất</option>
                      <option>Phổ biến nhất</option>
                      <option>Đánh giá cao</option>
                      <option>Giá thấp đến cao</option>
                      <option>Giá cao đến thấp</option>
                    </select>
                    <FaChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-2">
                  <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium text-gray-700">
                    Trước
                  </button>
                  <button className="px-4 py-2 rounded-lg  bg-primary text-white font-semibold shadow-lg">
                    1
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium text-gray-700">
                    2
                  </button>
                  <span className="px-2 text-gray-400">...</span>

                  <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium text-gray-700">
                    Sau
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                  <FiBookOpen Open size={40} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Không tìm thấy khóa học phù hợp
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác để tìm
                  khóa học phù hợp với bạn
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                    setPriceFilter("All");
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Courses;
