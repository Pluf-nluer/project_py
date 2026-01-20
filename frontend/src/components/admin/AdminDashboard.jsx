import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/courses/admin/stats/');
        setStats(response.data);
      } catch (error) { console.error("Lỗi:", error); } 
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center mt-10 text-xl text-gray-600">Đang tải...</div>;
  if (!stats) return <div className="text-center mt-10 text-xl text-red-500">Lỗi tải dữ liệu</div>;

  const barChartData = {
    labels: stats.top_courses.labels,
    datasets: [{
      label: 'Học viên',
      data: stats.top_courses.data,
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }],
  };

  const pieChartData = {
    labels: stats.student_levels.map(i => i.recommended_level),
    datasets: [{
      data: stats.student_levels.map(i => i.count),
      backgroundColor: ['#FF6384', '#FFCE56', '#36A2EB'],
    }],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">📊 DASHBOARD QUẢN TRỊ</h2>

      {/* THẺ SỐ LIỆU (Thay thế cho Bootstrap Row/Col) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-blue-500 text-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold">Tổng Học Viên</h3>
          <p className="text-4xl font-bold mt-2">{stats.overview.total_students}</p>
        </div>
        <div className="bg-green-500 text-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold">Tổng Khóa Học</h3>
          <p className="text-4xl font-bold mt-2">{stats.overview.total_courses}</p>
        </div>
        <div className="bg-yellow-400 text-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold">Lượt Đăng Ký</h3>
          <p className="text-4xl font-bold mt-2">{stats.overview.total_enrollments}</p>
        </div>
        <div className="bg-red-500 text-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold">Điểm TB Quiz</h3>
          <p className="text-4xl font-bold mt-2">{stats.overview.avg_quiz_score}</p>
        </div>
      </div>

      {/* BIỂU ĐỒ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white shadow-lg rounded-lg p-6 border">
          <h3 className="text-xl font-bold mb-4 text-gray-700">Top Khóa Học</h3>
          <Bar 
            data={barChartData} 
            options={{
                responsive: true,
                scales: {
                y: {
                    ticks: {
                    stepSize: 1, 
                    precision: 0 
                    },
                    beginAtZero: true
                }
                }
            }} 
            />
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 border">
          <h3 className="text-xl font-bold mb-4 text-gray-700">Trình Độ</h3>
          <Pie data={pieChartData} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;