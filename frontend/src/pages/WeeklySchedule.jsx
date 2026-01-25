import React, { useState } from "react";
import { FaCalendar, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const WeeklySchedule = ({ enrolledCourses }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const dayNames = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];

  const timeSlots = [
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

  // Tính toán các ngày trong tuần bắt đầu từ Thứ 2
  const getWeekDates = () => {
    const curr = new Date(currentWeek);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const firstDay = new Date(curr.setDate(diff));

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  const previousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const formatDateRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
  };

  /**
   * Chuyển đổi tên ngày thành index
   * @param {string} dayName - Tên ngày (vd: "Monday", "Tuesday")
   * @returns {number} - Index từ 0-6 (0 = Thứ 2, 6 = Chủ nhật)
   */
  const dayNameToIndex = (dayName) => {
    const dayMap = {
      Monday: 0,
      Tuesday: 1,
      Wednesday: 2,
      Thursday: 3,
      Friday: 4,
      Saturday: 5,
      Sunday: 6,
    };
    return dayMap[dayName] ?? -1;
  };

  /**
   * Tìm khóa học trong slot thời gian cụ thể
   * @param {number} dayIndex - Thứ trong tuần (0 = Thứ 2, 6 = Chủ nhật)
   * @param {string} time - Giờ bắt đầu slot (vd: "08:00")
   */
  const getCourseInSlot = (dayIndex, time) => {
    if (!enrolledCourses || enrolledCourses.length === 0) return null;

    return enrolledCourses.find((course) => {
      // Kiểm tra course.schedules tồn tại và là array
      if (!Array.isArray(course.schedules)) return false;

      return course.schedules.some((sched) => {
        // Kiểm tra cấu trúc schedule hợp lệ
        if (!sched || typeof sched !== "object") return false;

        // Xử lý cả 2 format: {day: 2} và {day: "Monday"}
        let schedDayIndex = -1;

        // Format 1: day là số (2-8)
        if (typeof sched.day === "number") {
          // Chuyển đổi: 2 -> 0, 3 -> 1, ..., 8 -> 6
          schedDayIndex = sched.day === 8 ? 6 : sched.day - 2;
        }
        // Format 2: day là string ("Monday", "Tuesday", ...)
        else if (typeof sched.day === "string") {
          schedDayIndex = dayNameToIndex(sched.day);
        }

        // Kiểm tra khớp ngày
        const dayMatch = schedDayIndex === dayIndex;
        if (!dayMatch) return false;

        // Xử lý cả 2 format giờ: start_time và start
        const schedStartTime = sched.start_time || sched.start || "";
        const schedStart = String(schedStartTime).padStart(5, "0");
        const slotTime = time.padStart(5, "0");

        return schedStart === slotTime;
      });
    });
  };

  // Kiểm tra có lịch học không
  const hasSchedule =
    enrolledCourses &&
    enrolledCourses.some(
      (course) =>
        Array.isArray(course.schedules) && course.schedules.length > 0,
    );

  if (!enrolledCourses || enrolledCourses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <FaCalendar size={64} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-800">Chưa có lịch học</h3>
        <p className="text-gray-600">
          Bạn chưa đăng ký khóa học nào để hiển thị lịch.
        </p>
      </div>
    );
  }

  if (!hasSchedule) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <FaCalendar size={64} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-800">
          Chưa có lịch học cụ thể
        </h3>
        <p className="text-gray-600">
          Các khóa học của bạn chưa có thời khóa biểu được thiết lập.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Thời khóa biểu tuần
          </h3>
          <p className="text-gray-600 text-sm">{formatDateRange()}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={previousWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Tuần trước"
          >
            <FaChevronLeft size={20} />
          </button>
          <button
            onClick={nextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Tuần sau"
          >
            <FaChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header - Các ngày trong tuần */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-center font-semibold text-gray-600 text-sm py-2">
              Giờ
            </div>
            {dayNames.map((day, index) => {
              const date = weekDates[index];
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={day}
                  className={`text-center py-2 rounded-lg ${
                    isToday ? "bg-blue-100" : ""
                  }`}
                >
                  <div
                    className={`font-semibold text-sm ${
                      isToday ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    {day}
                  </div>
                  <div
                    className={`text-xs ${
                      isToday ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {date.getDate()}/{date.getMonth() + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Body - Lịch học theo giờ */}
          <div className="grid grid-cols-8 gap-2">
            {timeSlots.map((time) => (
              <React.Fragment key={time}>
                <div className="text-xs text-gray-500 py-4 text-right pr-2">
                  {time}
                </div>
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                  const course = getCourseInSlot(dayIndex, time);
                  return (
                    <div
                      key={dayIndex}
                      className="border border-gray-100 min-h-[60px] rounded relative bg-gray-50/20"
                    >
                      {course && (
                        <div
                          className="absolute inset-1 bg-blue-600 text-white p-2 rounded shadow-sm text-[10px] leading-tight overflow-hidden z-10 cursor-pointer hover:bg-blue-700 transition-colors"
                          title={`${course.title} - ${course.class_name || ""}\n${
                            course.schedules?.find(
                              (s) =>
                                dayNameToIndex(s.day) === dayIndex ||
                                (s.day === 8 ? 6 : s.day - 2) === dayIndex,
                            )?.room || ""
                          }\n${
                            course.schedules?.find(
                              (s) =>
                                dayNameToIndex(s.day) === dayIndex ||
                                (s.day === 8 ? 6 : s.day - 2) === dayIndex,
                            )?.note || ""
                          }`}
                        >
                          <p className="font-bold truncate">{course.title}</p>
                          <p className="opacity-80 truncate text-[9px]">
                            {course.class_name}
                          </p>
                          {course.schedules?.find(
                            (s) =>
                              dayNameToIndex(s.day) === dayIndex ||
                              (s.day === 8 ? 6 : s.day - 2) === dayIndex,
                          )?.room && (
                            <p className="opacity-70 truncate text-[8px] mt-0.5">
                              📍{" "}
                              {
                                course.schedules.find(
                                  (s) =>
                                    dayNameToIndex(s.day) === dayIndex ||
                                    (s.day === 8 ? 6 : s.day - 2) === dayIndex,
                                ).room
                              }
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Chú thích */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          💡 Lịch học được tự động cập nhật từ các khóa học đã đăng ký
        </p>
      </div>
    </div>
  );
};

export default WeeklySchedule;
