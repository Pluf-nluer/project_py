import React, { useState } from "react";
import {
  FaClock,
  FaCalendarAlt,
  FaBook,
  FaTrash,
  FaEdit,
  FaPlus,
  FaSave,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import Header from "../components/Header";

// Time Slot Component
function TimeSlot({
  time,
  schedules,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
}) {
  const days = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];

  return (
    <div className="grid grid-cols-8 border-b border-gray-200">
      {/* Time Column */}
      <div className="border-r border-gray-200 p-4 bg-gray-50 flex items-center justify-center">
        <span className="font-semibold text-gray-700 text-sm">{time}</span>
      </div>

      {/* Day Columns */}
      {days.map((day, index) => {
        const schedule = schedules.find(
          (s) => s.day === day && s.time === time
        );

        return (
          <div
            key={day}
            className="border-r border-gray-200 p-2 min-h-[100px] hover:bg-gray-50 transition relative group"
          >
            {schedule ? (
              <div
                className={`${schedule.color} rounded-lg p-3 h-full relative group-hover:shadow-lg transition`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-white text-sm line-clamp-1">
                    {schedule.course}
                  </h4>
                  <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                    <button
                      onClick={() => onEditSchedule(schedule)}
                      className="w-6 h-6 bg-white bg-opacity-20 hover:bg-opacity-30 rounded flex items-center justify-center"
                    >
                      <FaEdit className="text-white text-xs" />
                    </button>
                    <button
                      onClick={() => onDeleteSchedule(schedule.id)}
                      className="w-6 h-6 bg-white bg-opacity-20 hover:bg-opacity-30 rounded flex items-center justify-center"
                    >
                      <FaTrash className="text-white text-xs" />
                    </button>
                  </div>
                </div>
                <p className="text-white text-xs opacity-90 mb-1">
                  {schedule.room}
                </p>
                <p className="text-white text-xs opacity-75">
                  {schedule.instructor}
                </p>
              </div>
            ) : (
              <button
                onClick={() => onAddSchedule(day, time)}
                className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <FaPlus className="text-gray-400" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Schedule Form Modal
function ScheduleModal({
  isOpen,
  onClose,
  onSave,
  editingSchedule,
  courses,
  selectedDay,
  selectedTime,
}) {
  const [formData, setFormData] = useState(
    editingSchedule || {
      course: "",
      day: selectedDay || "Thứ 2",
      time: selectedTime || "7:00 - 9:00",
      room: "",
      instructor: "",
      color: "bg-blue-500",
    }
  );

  React.useEffect(() => {
    if (editingSchedule) {
      setFormData(editingSchedule);
    } else if (selectedDay && selectedTime) {
      setFormData((prev) => ({
        ...prev,
        day: selectedDay,
        time: selectedTime,
      }));
    }
  }, [editingSchedule, selectedDay, selectedTime]);

  const colors = [
    { name: "Xanh dương", value: "bg-blue-500" },
    { name: "Xanh lá", value: "bg-green-500" },
    { name: "Đỏ", value: "bg-red-500" },
    { name: "Tím", value: "bg-purple-500" },
    { name: "Cam", value: "bg-orange-500" },
    { name: "Hồng", value: "bg-pink-500" },
    { name: "Vàng", value: "bg-yellow-500" },
    { name: "Xanh ngọc", value: "bg-teal-500" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">
            {editingSchedule ? "Chỉnh sửa lịch học" : "Thêm lịch học"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Course Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Môn học *
            </label>
            <select
              value={formData.course}
              onChange={(e) =>
                setFormData({ ...formData, course: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">-- Chọn môn học --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.title}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Day Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Thứ *
            </label>
            <select
              value={formData.day}
              onChange={(e) =>
                setFormData({ ...formData, day: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="Thứ 2">Thứ 2</option>
              <option value="Thứ 3">Thứ 3</option>
              <option value="Thứ 4">Thứ 4</option>
              <option value="Thứ 5">Thứ 5</option>
              <option value="Thứ 6">Thứ 6</option>
              <option value="Thứ 7">Thứ 7</option>
              <option value="Chủ nhật">Chủ nhật</option>
            </select>
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Giờ học *
            </label>
            <select
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="7:00 - 9:00">7:00 - 9:00</option>
              <option value="9:00 - 11:00">9:00 - 11:00</option>
              <option value="13:00 - 15:00">13:00 - 15:00</option>
              <option value="15:00 - 17:00">15:00 - 17:00</option>
              <option value="18:00 - 20:00">18:00 - 20:00</option>
              <option value="20:00 - 22:00">20:00 - 22:00</option>
            </select>
          </div>

          {/* Room */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phòng học
            </label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) =>
                setFormData({ ...formData, room: e.target.value })
              }
              placeholder="Ví dụ: A101, Online"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Instructor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Giảng viên
            </label>
            <input
              type="text"
              value={formData.instructor}
              onChange={(e) =>
                setFormData({ ...formData, instructor: e.target.value })
              }
              placeholder="Tên giảng viên"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Màu sắc
            </label>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, color: color.value })
                  }
                  className={`${color.value} h-12 rounded-lg relative hover:scale-105 transition`}
                >
                  {formData.color === color.value && (
                    <FaCheck className="absolute inset-0 m-auto text-white text-xl" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition flex items-center justify-center gap-2"
            >
              <FaSave />
              Lưu lại
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Schedule Page
function SchedulePage() {
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      course: "Introduction to LearnPress",
      day: "Thứ 2",
      time: "7:00 - 9:00",
      room: "A101",
      instructor: "John Doe",
      color: "bg-blue-500",
    },
    {
      id: 2,
      course: "Learning jQuery Mobile",
      day: "Thứ 3",
      time: "13:00 - 15:00",
      room: "Online",
      instructor: "Kenny White",
      color: "bg-green-500",
    },
    {
      id: 3,
      course: "PHP Master Course",
      day: "Thứ 5",
      time: "18:00 - 20:00",
      room: "B205",
      instructor: "Harry Potter",
      color: "bg-purple-500",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Enrolled courses
  const enrolledCourses = [
    { id: 1, title: "Introduction to LearnPress" },
    { id: 2, title: "Learning jQuery Mobile" },
    { id: 3, title: "PHP Master Course" },
    { id: 4, title: "Complete Web Design" },
    { id: 5, title: "Digital Marketing" },
  ];

  const timeSlots = [
    "7:00 - 9:00",
    "9:00 - 11:00",
    "13:00 - 15:00",
    "15:00 - 17:00",
    "18:00 - 20:00",
    "20:00 - 22:00",
  ];

  const handleAddSchedule = (day, time) => {
    setSelectedDay(day);
    setSelectedTime(time);
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setSelectedDay(null);
    setSelectedTime(null);
    setIsModalOpen(true);
  };

  const handleDeleteSchedule = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa lịch học này?")) {
      setSchedules(schedules.filter((s) => s.id !== id));
    }
  };

  const handleSaveSchedule = (formData) => {
    if (editingSchedule) {
      // Update existing schedule
      setSchedules(
        schedules.map((s) =>
          s.id === editingSchedule.id ? { ...formData, id: s.id } : s
        )
      );
    } else {
      // Add new schedule
      setSchedules([...schedules, { ...formData, id: Date.now() }]);
    }
  };

  // Statistics
  const totalHours = schedules.length * 2;
  const coursesCount = new Set(schedules.map((s) => s.course)).size;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="container mx-auto px-6 lg:px-10 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Lịch học của tôi
          </h1>
          <p className="text-gray-600">
            Quản lý và xếp lịch học cho các môn đã đăng ký
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Tổng số môn</p>
                <p className="text-3xl font-bold text-gray-900">
                  {coursesCount}
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <FaBook className="text-blue-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Tổng số buổi</p>
                <p className="text-3xl font-bold text-gray-900">
                  {schedules.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <FaCalendarAlt className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Tổng giờ học</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalHours}h
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <FaClock className="text-purple-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelectedDay(null);
                setSelectedTime(null);
                setEditingSchedule(null);
                setIsModalOpen(true);
              }}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition flex items-center gap-2"
            >
              <FaPlus />
              Thêm lịch học
            </button>
            <button className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
              Xuất lịch học
            </button>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Header */}
              <div className="grid grid-cols-8 bg-primary text-white">
                <div className="p-4 border-r border-blue-600 flex items-center justify-center">
                  <FaClock className="mr-2" />
                  <span className="font-bold">Giờ</span>
                </div>
                {[
                  "Thứ 2",
                  "Thứ 3",
                  "Thứ 4",
                  "Thứ 5",
                  "Thứ 6",
                  "Thứ 7",
                  "Chủ nhật",
                ].map((day) => (
                  <div
                    key={day}
                    className="p-4 border-r border-blue-600 text-center"
                  >
                    <span className="font-bold">{day}</span>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {timeSlots.map((time) => (
                <TimeSlot
                  key={time}
                  time={time}
                  schedules={schedules}
                  onAddSchedule={handleAddSchedule}
                  onEditSchedule={handleEditSchedule}
                  onDeleteSchedule={handleDeleteSchedule}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">Chú thích</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Công nghệ thông tin</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Thiết kế</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm text-gray-600">Lập trình</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm text-gray-600">Marketing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSchedule}
        editingSchedule={editingSchedule}
        courses={enrolledCourses}
        selectedDay={selectedDay}
        selectedTime={selectedTime}
      />
    </div>
  );
}

export default SchedulePage;
