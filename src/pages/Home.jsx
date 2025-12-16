import React from "react";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import CourseCard from "../components/CourseCard";

function Home() {
  // Dữ liệu giả lập (Mock Data)
  const courses = [
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
      price: "$59.00",
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
      price: "$39.00",
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
      price: "$69.00",
      students: 150,
      lessons: 40,
    },
  ];

  return (
    <div className="font-sans">
      <Header />
      <HeroSection />

      {/* Popular Courses Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-10">
          <div className="text-center mb-12">
            <p className="text-gray-500 font-medium uppercase tracking-widest mb-2">
              Khóa học mới
            </p>
            <h2 className="text-4xl font-bold text-text-dark">
              Các khóa học phổ biến
            </h2>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="border border-gray-200 text-gray-500 px-8 py-3 rounded-full hover:bg-primary hover:text-white hover:border-primary transition font-bold text-sm uppercase">
              Browse All Courses
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
