import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import CourseCard from "../components/CourseCard";

function Home() {

  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]); // Chuyển thành mảng rỗng ban đầu
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // 1. Fetch Khóa học gợi ý (Cần Token)
    fetch('http://localhost:8000/api/ai/recommendations/', {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(response => {
      if (response.status === "success") {
        setRecommendedCourses(response.data);
      }
    })
    .catch(err => console.error("Lỗi gợi ý:", err));

    // 2. Fetch Khóa học phổ biến (Không cần Token)
    fetch('http://localhost:8000/api/courses/popular/') 
    .then(res => res.json())
    .then(response => {
      if (response.status === "success") {
        setPopularCourses(response.data);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error("Lỗi phổ biến:", err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="font-sans">
      <Header />
      <HeroSection />

      {/* SECTION: GỢI Ý TỪ AI */}
      {recommendedCourses.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-10">
            <div className="mb-8">
              <p className="text-primary font-medium uppercase tracking-widest mb-2">
                Dành riêng cho bạn
              </p>
              <h2 className="text-3xl font-bold text-text-dark">
                Khóa học AI gợi ý
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {recommendedCourses.map((course) => (
                <CourseCard key={`ai-${course.id}`} course={{
                  ...course,
                  // Đảm bảo có ảnh mặc định nếu backend chưa trả về
                  image: course.image || "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
                  instructor: course.instructor_name || "Chuyên gia",
                  students: 100, // Có thể bổ sung từ DB sau
                  lessons: course.total_lessons || 0
                }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION: KHÓA HỌC PHỔ BIẾN */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-10">
          <div className="text-center mb-12">
            <p className="text-gray-500 font-medium uppercase tracking-widest mb-2">
              Khám phá ngay
            </p>
            <h2 className="text-4xl font-bold text-text-dark">
              Các khóa học phổ biến
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularCourses.map((course) => (
              <CourseCard key={`pop-${course.id}`} course={{
                ...course,
                image: course.image || "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
                instructor: course.instructor_name || "Chuyên gia",
                students: course.imported_enrollments || 100, // Lấy từ trường mới của dataset edX/Skillshare
                lessons: course.total_lessons || 12
              }} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
