// src/App.jsx
import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import CourseCard from '../components/CourseCard';

function Courses() {
  // Dữ liệu giả lập (Mock Data)
  const courses = [
    {
      id: 1,
      title: "Introduction to LearnPress – LMS Plugin",
      instructor: "John Doe",
      image: "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
      category: "Photography",
      price: "Free",
      students: 120,
      lessons: 10
    },
    {
      id: 2,
      title: "Learning jQuery Mobile for Beginners",
      instructor: "Kenny White",
      image: "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
      category: "IT & Software",
      price: "$59.00",
      students: 50,
      lessons: 25
    },
    {
      id: 3,
      title: "The Art of Black & White Photography",
      instructor: "John Doe",
      image: "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
      category: "Art",
      price: "$39.00",
      students: 230,
      lessons: 6
    },
     {
      id: 4,
      title: "Become a PHP Master and Make Money",
      instructor: "Harry Potter",
      image: "https://eduma.thimpress.com/demo-online-learning/wp-content/uploads/sites/104/2022/12/Introduction-learnpress-lms-plugin-4-850x500.png",
      category: "Backend",
      price: "$69.00",
      students: 150,
      lessons: 40
    }
  ];

  return (
    <div className="font-sans">
      <Header />
      <HeroSection />
      
      
    </div>
  );
}

export default Courses;