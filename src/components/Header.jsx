// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaShoppingBag, FaUser } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="flex justify-between items-center px-10 py-4 bg-white shadow-sm sticky top-0 z-50">
      {/* Logo */}
      <div className="text-2xl font-bold flex items-center gap-2">
        <span className="text-primary text-4xl">N</span>
        <span className="text-text-dark font-bold">NLU Learning</span>
      </div>

      {/* Navigation */}
      <nav>
        <ul className="flex gap-8 font-medium text-sm uppercase text-gray-600">
          <li className="hover:text-primary cursor-pointer">
             <Link to="/">Trang chủ</Link>
           </li>

           <li className="hover:text-primary cursor-pointer">
             <Link to="/courses">Khóa học</Link>
           </li>

           <li className="hover:text-primary cursor-pointer">
             <Link to="/features">Tính năng</Link>
           </li>
          <li className="hover:text-primary cursor-pointer">
            <Link to="/blog">Blog</Link>
          </li>
          <li className="hover:text-primary cursor-pointer">
            <Link to="/contact">Liên hệ</Link>
          </li>
        </ul>
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-6 text-gray-600">
        <FaSearch className="cursor-pointer hover:text-primary" />
        <div className="relative cursor-pointer hover:text-primary">
            <FaShoppingBag />
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
        </div>
        <button className="text-sm font-bold uppercase hover:text-primary">Login / Register</button>
      </div>
    </header>
  );
};

export default Header;