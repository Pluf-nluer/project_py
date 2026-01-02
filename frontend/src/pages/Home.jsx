import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import CourseCard from "../components/CourseCard";

function Home() {
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // Tạm thời bỏ IF để test xem dữ liệu có lên không
    fetch("http://localhost:8000/api/ai/recommendations/", {
      headers: {
        // Nếu không có token thì gửi chuỗi rỗng hoặc bỏ luôn header này để test
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((response) => {
        console.log("Dữ liệu nhận được:", response); // Thêm dòng này để debug
        if (response.status === "success") {
          setRecommendedCourses(response.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch:", err);
        setLoading(false);
      });
  }, []);
  // Dữ liệu giả lập (Mock Data)
  const popularCourses = [
    {
      id: 1,
      title: "Introduction to LearnPress – LMS Plugin",
      instructor: "John Doe",
      image:
        "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
      category: "Photography",
      price: "Free",
      students: 120,
      lessons: 10,
    },
    {
      id: 2,
      title: "Learning jQuery Mobile for Beginners",
      instructor: "Kenny White",
      image:
        "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
      category: "IT & Software",
      price: "59.00",
      students: 50,
      lessons: 25,
    },
    {
      id: 3,
      title: "The Art of Black & White Photography",
      instructor: "John Doe",
      image:
        "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
      category: "Art",
      price: "39.00",
      students: 230,
      lessons: 6,
    },
    {
      id: 4,
      title: "Become a PHP Master and Make Money",
      instructor: "Harry Potter",
      image:
        "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
      category: "Backend",
      price: "69.00",
      students: 150,
      lessons: 40,
    },
  ];

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
                <CourseCard
                  key={`ai-${course.id}`}
                  course={{
                    ...course,
                    // Đảm bảo có ảnh mặc định nếu backend chưa trả về
                    image:
                      course.image ||
                      "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
                    instructor: course.instructor_name || "Chuyên gia",
                    students: 100, // Có thể bổ sung từ DB sau
                    lessons: course.total_lessons || 0,
                  }}
                />
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
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
