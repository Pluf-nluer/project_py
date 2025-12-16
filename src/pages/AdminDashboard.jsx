import React, { useState } from 'react';
import { FaUsers, FaBook, FaTrophy, FaStar, FaChartLine, FaUserGraduate, FaChevronDown, FaSearch, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

// Admin Sidebar
function AdminSidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', icon: <FaChartLine />, label: 'Tổng quan' },
    { id: 'courses', icon: <FaBook />, label: 'Quản lý khóa học' },
    { id: 'students', icon: <FaUsers />, label: 'Quản lý học viên' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <div className="text-2xl font-bold flex items-center gap-2">
          <span className="text-primary text-4xl">N</span>
          <span className="text-gray-800">NLU Admin</span>
        </div>
      </div>
      
      <nav className="p-4">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              activeTab === item.id
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

// Dashboard Overview Tab
function DashboardTab() {
  const stats = {
    totalStudents: 1245,
    studentGrowth: '+12%',
    totalCourses: 48,
    courseGrowth: '+5',
    outstandingStudents: 23,
    avgRating: 4.8,
    totalRatings: 3420
  };

  const topStudents = [
    { id: 1, name: 'Nguyễn Văn A', courses: 12, avgScore: 9.5, avatar: null },
    { id: 2, name: 'Trần Thị B', courses: 10, avgScore: 9.3, avatar: null },
    { id: 3, name: 'Lê Minh C', courses: 11, avgScore: 9.2, avatar: null },
    { id: 4, name: 'Phạm Thị D', courses: 9, avgScore: 9.0, avatar: null },
    { id: 5, name: 'Hoàng Văn E', courses: 8, avgScore: 8.9, avatar: null }
  ];

  const recentRatings = [
    { id: 1, student: 'Nguyễn Văn A', course: 'Introduction to LearnPress', rating: 5, comment: 'Khóa học rất hay, giảng viên nhiệt tình!', date: '2 giờ trước' },
    { id: 2, student: 'Trần Thị B', course: 'Learning jQuery Mobile', rating: 4, comment: 'Nội dung tốt nhưng hơi nhanh', date: '5 giờ trước' },
    { id: 3, student: 'Lê Minh C', course: 'PHP Master Course', rating: 5, comment: 'Tuyệt vời! Đã học được nhiều thứ', date: '1 ngày trước' },
    { id: 4, student: 'Phạm Thị D', course: 'Complete Web Design', rating: 5, comment: 'Best course ever!', date: '2 ngày trước' }
  ];

  const courseStats = [
    { name: 'Introduction to LearnPress', students: 320, rating: 4.8, revenue: '$25,600' },
    { name: 'Learning jQuery Mobile', students: 245, rating: 4.6, revenue: '$19,600' },
    { name: 'PHP Master Course', students: 198, rating: 4.9, revenue: '$15,840' },
    { name: 'Complete Web Design', students: 165, rating: 4.7, revenue: '$13,200' }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Tổng quan</h1>
        <p className="text-gray-600">Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Students */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaUsers className="text-2xl" />
            </div>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
              {stats.studentGrowth}
            </span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.totalStudents.toLocaleString()}</h3>
          <p className="text-blue-100">Tổng số học viên</p>
        </div>

        {/* Total Courses */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaBook className="text-2xl" />
            </div>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
              {stats.courseGrowth}
            </span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.totalCourses}</h3>
          <p className="text-green-100">Khóa học đã mở</p>
        </div>

        {/* Outstanding Students */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaTrophy className="text-2xl" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.outstandingStudents}</h3>
          <p className="text-purple-100">Học viên ưu tú</p>
        </div>

        {/* Average Rating */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaStar className="text-2xl" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.avgRating}/5.0</h3>
          <p className="text-orange-100">{stats.totalRatings.toLocaleString()} đánh giá</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Students */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaTrophy className="text-yellow-500" />
              Học viên ưu tú
            </h2>
            <button className="text-primary text-sm font-semibold hover:underline">
              Xem tất cả
            </button>
          </div>
          
          <div className="space-y-4">
            {topStudents.map((student, index) => (
              <div key={student.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {student.avatar ? (
                      <img src={student.avatar} alt={student.name} className="w-full h-full rounded-full" />
                    ) : (
                      student.name.charAt(0)
                    )}
                  </div>
                  {index < 3 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white">
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{student.name}</h4>
                  <p className="text-sm text-gray-500">{student.courses} khóa học</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">{student.avgScore}</div>
                  <p className="text-xs text-gray-500">Điểm TB</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Hiệu suất khóa học</h2>
            <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Tháng này</option>
              <option>Tháng trước</option>
              <option>Quý này</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {courseStats.map((course, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm">{course.name}</h4>
                  <span className="text-sm font-bold text-green-600">{course.revenue}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <FaUsers size={12} />
                      {course.students}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaStar size={12} className="text-yellow-400" />
                      {course.rating}
                    </span>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(course.students / 320) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Ratings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaStar className="text-yellow-500" />
            Đánh giá gần đây
          </h2>
        </div>
        
        <div className="space-y-4">
          {recentRatings.map(rating => (
            <div key={rating.id} className="flex gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {rating.student.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{rating.student}</h4>
                    <p className="text-sm text-gray-600">{rating.course}</p>
                  </div>
                  <span className="text-sm text-gray-500">{rating.date}</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < rating.rating ? 'text-yellow-400' : 'text-gray-300'}
                      size={14}
                    />
                  ))}
                </div>
                <p className="text-gray-700 text-sm">{rating.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Course Management Tab
function CoursesTab() {
  const [courses, setCourses] = useState([
    { id: 1, title: 'Introduction to LearnPress', instructor: 'John Doe', students: 320, status: 'active', price: '$89', rating: 4.8 },
    { id: 2, title: 'Learning jQuery Mobile', instructor: 'Kenny White', students: 245, status: 'active', price: '$59', rating: 4.6 },
    { id: 3, title: 'PHP Master Course', instructor: 'Harry Potter', students: 198, status: 'active', price: '$69', rating: 4.9 },
    { id: 4, title: 'Complete Web Design', instructor: 'Sarah Johnson', students: 165, status: 'draft', price: '$79', rating: 4.7 }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý khóa học</h1>
          <p className="text-gray-600">Quản lý tất cả khóa học trong hệ thống</p>
        </div>
        <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition flex items-center gap-2">
          <FaPlus />
          Thêm khóa học mới
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Tất cả trạng thái</option>
            <option>Đang hoạt động</option>
            <option>Nháp</option>
            <option>Đã đóng</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Sắp xếp: Mới nhất</option>
            <option>Nhiều học viên nhất</option>
            <option>Đánh giá cao nhất</option>
          </select>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Khóa học</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Giảng viên</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Học viên</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Đánh giá</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Giá</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Trạng thái</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCourses.map(course => (
              <tr key={course.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{course.title}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{course.instructor}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1 text-gray-700">
                    <FaUsers size={14} />
                    {course.students}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1 text-yellow-600 font-semibold">
                    <FaStar size={14} />
                    {course.rating}
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-semibold text-gray-900">{course.price}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    course.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {course.status === 'active' ? 'Hoạt động' : 'Nháp'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded transition">
                      <FaEye />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-50 rounded transition">
                      <FaEdit />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded transition">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-gray-600 text-sm">Hiển thị 1-{filteredCourses.length} trong tổng số {courses.length} khóa học</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Trước</button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg">1</button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">2</button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Sau</button>
        </div>
      </div>
    </div>
  );
}

// Students Management Tab
function StudentsTab() {
  const [students, setStudents] = useState([
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', courses: 12, avgScore: 9.5, status: 'active', joinDate: '15/01/2024' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', courses: 10, avgScore: 9.3, status: 'active', joinDate: '20/01/2024' },
    { id: 3, name: 'Lê Minh C', email: 'leminhc@email.com', courses: 11, avgScore: 9.2, status: 'active', joinDate: '22/01/2024' },
    { id: 4, name: 'Phạm Thị D', email: 'phamthid@email.com', courses: 9, avgScore: 9.0, status: 'inactive', joinDate: '25/01/2024' }
  ]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý học viên</h1>
          <p className="text-gray-600">Quản lý tất cả học viên trong hệ thống</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm học viên..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Tất cả trạng thái</option>
            <option>Đang học</option>
            <option>Tạm dừng</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Học viên</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Email</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Khóa học</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Điểm TB</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Ngày tham gia</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Trạng thái</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map(student => (
              <tr key={student.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {student.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-900">{student.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{student.email}</td>
                <td className="px-6 py-4 text-center font-semibold text-gray-900">{student.courses}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {student.avgScore}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-gray-600">{student.joinDate}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    student.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {student.status === 'active' ? 'Đang học' : 'Tạm dừng'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded transition">
                      <FaEye />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-50 rounded transition">
                      <FaEdit />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main Admin Dashboard
function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'courses' && <CoursesTab />}
        {activeTab === 'students' && <StudentsTab />}
      </main>
    </div>
  );
}

export default AdminDashboard;