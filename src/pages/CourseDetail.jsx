import React, { useState } from "react";
import {
  FaStar,
  FaUsers,
  FaClock,
  FaBook,
  FaPlay,
  FaCheckCircle,
  FaFileAlt,
  FaGlobe,
  FaInfinity,
  FaCertificate,
  FaMobileAlt,
  FaChevronDown,
  FaChevronUp,
  FaQuestionCircle,
  FaDownload,
} from "react-icons/fa";

// Header Component
import Header from "../components/Header";

// Course Section Component
function CourseSection({ section, index }) {
  const [isOpen, setIsOpen] = useState(index === 0);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-700">Phần {index + 1}:</span>
          <span className="font-semibold text-gray-800">{section.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {section.lessons.length} bài học •{" "}
            {section.quiz ? "1 quiz" : "0 quiz"}
          </span>
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </button>
      {isOpen && (
        <div className="bg-white">
          {section.lessons.map((lesson, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 border-t border-gray-100 hover:bg-gray-50 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FaPlay className="text-primary text-sm" />
                <span className="text-gray-700">{lesson.title}</span>
                {lesson.isPreview && (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-semibold">
                    Xem trước
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">{lesson.duration}</span>
            </div>
          ))}
          {section.quiz && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100 hover:bg-gray-50 transition cursor-pointer bg-blue-50">
              <div className="flex items-center gap-3">
                <FaQuestionCircle className="text-primary text-sm" />
                <span className="text-gray-700 font-semibold">
                  {section.quiz.title}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {section.quiz.questions} câu hỏi
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Review Component
function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
          {review.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-gray-800">{review.name}</h4>
            <span className="text-sm text-gray-500">{review.date}</span>
          </div>
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={
                  i < review.rating ? "text-yellow-400" : "text-gray-300"
                }
                size={14}
              />
            ))}
          </div>
          <p className="text-gray-600 leading-relaxed">{review.comment}</p>
        </div>
      </div>
    </div>
  );
}

// Main Course Detail Component
function CourseDetail() {
  const [activeTab, setActiveTab] = useState("overview");

  const course = {
    id: 1,
    title: "The Complete Web Development Bootcamp 2024",
    subtitle: "Become a Full-Stack Web Developer with just ONE course",
    instructor: {
      name: "Dr. Minh Quoc",
      title: "Developer and Lead Instructor",
      image: null,
      students: 50000,
      courses: 5,
      rating: 4.8,
    },
    rating: 4.8,
    reviewCount: 3,
    students: 120000,
    image:
      "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
    price: "$89.99",
    category: "Web Development",
    level: "Beginner",
    duration: "65 hours",
    lectures: 400,
    language: "Tiếng Việt",
    lastUpdated: "12/2025",
    description: `Master web development by building 100 unique projects in HTML, CSS, JavaScript, React, Node.js, MongoDB và nhiều hơn nữa. Khóa học này được thiết kế cho người mới bắt đầu hoàn toàn, không cần kinh nghiệm lập trình trước đó.

  Với hơn 65 giờ nội dung video chất lượng cao, bạn sẽ học từ những khái niệm cơ bản nhất đến các kỹ thuật nâng cao trong phát triển web. Khóa học được cập nhật thường xuyên với các công nghệ và best practices mới nhất.`,

    whatYouLearn: [
      "Xây dựng 16 dự án web thực tế để thêm vào portfolio của bạn",
      "Học HTML, CSS, Javascript, ES6, React, Node.js, MongoDB và nhiều hơn nữa",
      "Master cả Frontend và Backend development",
      "Build RESTful APIs và hiểu về authentication & authorization",
      "Triển khai ứng dụng của bạn lên Production với các platforms như Heroku và Netlify",
      "Học Git, GitHub và version control",
      "Hiểu về responsive design và mobile-first development",
      "Làm việc với databases như MongoDB và SQL",
    ],

    requirements: [
      "Không cần kiến thức lập trình trước đó - Tôi sẽ dạy bạn mọi thứ bạn cần biết",
      "Một máy tính Mac hoặc PC có kết nối internet",
      "Không cần phần mềm trả phí - tất cả các công cụ đều miễn phí",
      "Sẵn sàng học hỏi và thực hành coding mỗi ngày",
    ],

    features: [
      { icon: <FaClock />, text: "65 giờ video on-demand" },
      { icon: <FaBook />, text: "100+ bài tập coding" },
      { icon: <FaFileAlt />, text: "50+ tài liệu downloadable" },
      { icon: <FaInfinity />, text: "Truy cập trọn đời" },
      { icon: <FaCertificate />, text: "Chứng chỉ hoàn thành" },
    ],

    curriculum: [
      {
        title: "Giới thiệu về Web Development",
        quiz: { title: "Quiz: HTML Cơ bản & Nâng cao", questions: 20 },
        lessons: [
          {
            title: "Chào mừng đến với khóa học",
            duration: "5:30",
            isPreview: true,
          },
          {
            title: "Cài đặt môi trường phát triển",
            duration: "12:45",
            isPreview: true,
          },
          {
            title: "Tổng quan về Web Development",
            duration: "18:20",
            isPreview: false,
          },
          {
            title: "Cách Internet hoạt động",
            duration: "22:10",
            isPreview: false,
          },
        ],
      },
      {
        title: "HTML - Nền tảng của Web",
        quiz: { title: "Quiz: HTML Cơ bản & Nâng cao", questions: 20 },
        lessons: [
          { title: "HTML là gì?", duration: "8:15", isPreview: true },
          {
            title: "HTML Tags và Elements",
            duration: "15:30",
            isPreview: false,
          },
          { title: "HTML Attributes", duration: "10:20", isPreview: false },
          {
            title: "Tạo trang web đầu tiên",
            duration: "25:40",
            isPreview: false,
          },
          { title: "HTML Forms", duration: "18:55", isPreview: false },
        ],
      },
      {
        title: "CSS - Styling Your Websites",
        quiz: { title: "Quiz: CSS Layout", questions: 25 },
        lessons: [
          { title: "CSS Fundamentals", duration: "12:30", isPreview: false },
          { title: "CSS Selectors", duration: "16:45", isPreview: false },
          { title: "CSS Box Model", duration: "20:15", isPreview: false },
          { title: "Flexbox Layout", duration: "28:30", isPreview: false },
          { title: "CSS Grid", duration: "22:50", isPreview: false },
        ],
      },
      {
        title: "JavaScript Basics",
        lessons: [
          {
            title: "Introduction to JavaScript",
            duration: "14:20",
            isPreview: false,
          },
          {
            title: "Variables và Data Types",
            duration: "18:35",
            isPreview: false,
          },
          { title: "Functions", duration: "22:10", isPreview: false },
          { title: "Arrays và Objects", duration: "25:45", isPreview: false },
        ],
      },
    ],
    resources: [
      { title: "HTML & CSS Cheat Sheet (PDF)", type: "pdf" },
      { title: "JavaScript Exercises Workbook (PDF)", type: "pdf" },
      { title: "Source code tất cả dự án", type: "zip" },
      { title: "Responsive Design Guidelines", type: "pdf" },
      { title: "MongoDB Cheat Sheet", type: "pdf" },
    ],

    reviews: [
      {
        name: "Nguyễn Văn A",
        rating: 5,
        date: "2 tuần trước",
        comment:
          "Khóa học tuyệt vời! Giảng viên giải thích rất dễ hiểu, từng bước một. Sau khóa học này tôi đã tự tin xây dựng được website riêng của mình.",
      },
      {
        name: "Trần Thị B",
        rating: 5,
        date: "1 tháng trước",
        comment:
          "Best course ever! Nội dung rất chi tiết và cập nhật. Projects trong khóa học rất thực tế, giúp tôi có portfolio để apply công việc.",
      },
    ],
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-6 lg:px-10 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <span className="bg-yellow-500 text-gray-900 px-3 py-1 rounded text-sm font-bold">
                  BESTSELLER
                </span>
              </div>

              <h1 className="text-4xl font-bold mb-4 leading-tight">
                {course.title}
              </h1>

              <p className="text-xl text-gray-300 mb-6">{course.subtitle}</p>

              <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-yellow-400">
                    {course.rating}
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < Math.floor(course.rating)
                            ? "text-yellow-400"
                            : "text-gray-600"
                        }
                        size={14}
                      />
                    ))}
                  </div>
                  <span className="text-gray-300">
                    ({course.reviews.length} đánh giá)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FaUsers />
                  <span>{course.students.toLocaleString()} học viên</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-300">Tạo bởi</span>
                <div className="flex items-center gap-2">
                  <img
                    src="https://secure.gravatar.com/avatar/7604638c9451218c07f13019b9f39553?s=96&d=mm&r=g"
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="font-semibold">
                    {course.instructor.name}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <FaClock />
                  <span>Cập nhật {course.lastUpdated}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaGlobe />
                  <span>{course.language}</span>
                </div>
              </div>
            </div>

            {/* Right - Course Card (Desktop) */}
            <div className="hidden lg:block">
              {/* This space reserved for sticky card */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 lg:px-10 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2">
            {/* What You'll Learn */}
            <div className="bg-white rounded-xl p-8 mb-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Bạn sẽ học được gì
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {course.whatYouLearn.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-t-xl border-b border-gray-200">
              <div className="flex gap-8 px-8">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`py-4 font-semibold border-b-2 transition ${
                    activeTab === "overview"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tổng quan
                </button>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  className={`py-4 font-semibold border-b-2 transition ${
                    activeTab === "curriculum"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Nội dung khóa học
                </button>
                <button
                  onClick={() => setActiveTab("instructor")}
                  className={`py-4 font-semibold border-b-2 transition ${
                    activeTab === "instructor"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Giảng viên
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`py-4 font-semibold border-b-2 transition ${
                    activeTab === "reviews"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Đánh giá
                </button>
                <button
                  onClick={() => setActiveTab("file_resources")}
                  className={`py-4 font-semibold border-b-2 transition whitespace-nowrap ${
                    activeTab === "file_resources"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tài liệu
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-xl p-8 shadow-sm border border-gray-200">
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">
                      Mô tả khóa học
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {course.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">
                      Yêu cầu
                    </h3>
                    <ul className="space-y-2">
                      {course.requirements.map((req, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-gray-700"
                        >
                          <span className="text-primary mt-1">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "curriculum" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      Nội dung khóa học
                    </h3>
                    <span className="text-gray-600">
                      {course.curriculum.length} phần • {course.lectures} bài
                      giảng • {course.duration}
                    </span>
                  </div>
                  <div>
                    {course.curriculum.map((section, index) => (
                      <CourseSection
                        key={index}
                        section={section}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "instructor" && (
                <div>
                  <h3 className="text-xl font-bold mb-6 text-gray-900">
                    Giảng viên
                  </h3>
                  <div className="flex items-start gap-6">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-4xl flex-shrink-0">
                      {course.instructor.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">
                        {course.instructor.name}
                      </h4>
                      <p className="text-gray-600 mb-4">
                        {course.instructor.title}
                      </p>

                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <FaStar className="text-yellow-400" />
                            <span className="font-bold text-gray-900">
                              {course.instructor.rating}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            Đánh giá
                          </span>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="font-bold text-gray-900 mb-1">
                            {course.instructor.students.toLocaleString()}
                          </div>
                          <span className="text-sm text-gray-600">
                            Học viên
                          </span>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="font-bold text-gray-900 mb-1">
                            {course.instructor.courses}
                          </div>
                          <span className="text-sm text-gray-600">
                            Khóa học
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed">
                        Với hơn 10 năm kinh nghiệm trong lĩnh vực phát triển
                        web, tôi đã giúp hàng ngàn học viên thành công trong sự
                        nghiệp lập trình. Tôi tin rằng học lập trình nên vui vẻ
                        và dễ tiếp cận với tất cả mọi người.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      Đánh giá của học viên
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-1">
                          {course.rating}
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                i < Math.floor(course.rating)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                        <div className="text-sm text-gray-600">
                          {course.reviewCount.toLocaleString()} đánh giá
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {course.reviews.map((review, index) => (
                      <ReviewCard key={index} review={review} />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "file_resources" && (
                <div className="space-y-12">
                  {/* Phần tài liệu */}

                  <div className="border-t pt-12">
                    <h3 className="text-2xl font-bold mb-6 text-gray-900">
                      Tài liệu tải về (Downloadable Resources)
                    </h3>
                    <p className="text-gray-700 mb-8">
                      Tất cả tài liệu dưới đây đều có thể tải về miễn phí và sử
                      dụng trọn đời.
                    </p>
                    <div className="space-y-4">
                      {course.resources.map((resource, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <FaDownload className="text-primary text-xl" />
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                {resource.title}
                              </h4>
                              <span className="text-sm text-gray-600 uppercase">
                                {resource.type}
                              </span>
                            </div>
                          </div>
                          <button className="text-primary font-semibold hover:underline">
                            Tải về
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Course Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />

                <div className="p-6">
                  <div className="flex items-baseline gap-3 mb-6 ">
                    <span className="text-4xl font-bold text-green-600">
                      {course.price}
                    </span>
                  </div>

                  <button className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition mb-3">
                    Đăng ký ngay
                  </button>
                  <button className="w-full border-2 border-gray-300 text-gray-700 py-4 rounded-lg font-bold hover:bg-gray-50 transition">
                    Thêm vào giỏ hàng
                  </button>

                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                    {course.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 text-gray-700"
                      >
                        <span className="text-primary">{feature.icon}</span>
                        <span className="text-sm">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button className="w-full text-primary font-semibold hover:underline">
                      Chia sẻ khóa học này
                    </button>
                  </div>
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
