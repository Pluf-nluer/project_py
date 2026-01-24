import React, { useState, useEffect } from "react";
import { X, Clock, AlertCircle, CheckCircle } from "lucide-react";

const PlacementQuiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 phút
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/courses/placement-quiz/")
      .then((res) => res.json())
      .then((data) => {
        setQuiz(data);
        setLoading(false);
      })
      .catch((err) => {
        alert("Không tải được bài kiểm tra");
        setLoading(false);
      });
  }, []);

  // Đếm ngược thời gian
  useEffect(() => {
    if (!quiz || result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, result]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Vui lòng đăng nhập để làm bài");
      return;
    }

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/courses/placement-quiz/submit/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answers }),
        },
      );
      const data = await res.json();
      setResult(data);
      alert("Hoàn thành quiz! Bạn sẽ không thấy lời mời này nữa.");
    } catch (err) {
      console.error("Lỗi:", err);
      alert("Lỗi khi nộp bài");
    }
  };

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    window.history.back();
  };

  const answeredCount = Object.keys(answers).length;
  const progress = quiz ? (answeredCount / quiz.questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Đang tải bài kiểm tra...</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>

            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
              Kết quả kiểm tra
            </h2>

            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 text-white text-center mb-8">
              <div className="text-6xl font-bold mb-2">{result.score}%</div>
              <p className="text-xl mb-4">Trình độ: {result.level}</p>
              <div className="flex justify-center gap-8 text-sm">
                <div>
                  <div className="font-semibold">Tổng số câu</div>
                  <div className="text-2xl">{result.total_questions}</div>
                </div>
                <div>
                  <div className="font-semibold">Câu đúng</div>
                  <div className="text-2xl">{result.correct_answers}</div>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              Khóa học phù hợp với bạn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {result.recommended_courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-500 transition-all hover:shadow-lg"
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="text-xs text-blue-600 font-semibold mb-2">
                      {course.level}
                    </div>
                    <h4 className="font-bold text-gray-800 mb-3">
                      {course.title}
                    </h4>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => window.history.back()}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Quay lại trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{quiz.title}</h1>
              <p className="text-sm text-gray-600">
                Câu {currentQuestion + 1}/{quiz.questions.length}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-orange-600">
                  {formatTime(timeLeft)}
                </span>
              </div>

              <button
                onClick={handleExit}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <X className="w-5 h-5" />
                <span className="font-semibold">Thoát</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Tiến độ hoàn thành</span>
              <span>
                {answeredCount}/{quiz.questions.length} câu
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="mb-6">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mb-4">
              Câu hỏi {currentQuestion + 1}
            </span>
            <h3 className="text-2xl font-semibold text-gray-800">
              {currentQ.text}
            </h3>
          </div>

          <div className="space-y-3">
            {currentQ.choices.map((choice) => (
              <label
                key={choice.id}
                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  answers[currentQ.id] === choice.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name={`question_${currentQ.id}`}
                  value={choice.id}
                  checked={answers[currentQ.id] === choice.id}
                  onChange={() =>
                    setAnswers({ ...answers, [currentQ.id]: choice.id })
                  }
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-gray-700 flex-1">{choice.text}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ← Câu trước
          </button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Nộp bài kiểm tra
            </button>
          ) : (
            <button
              onClick={() =>
                setCurrentQuestion(
                  Math.min(quiz.questions.length - 1, currentQuestion + 1),
                )
              }
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Câu tiếp →
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h4 className="font-semibold text-gray-800 mb-4">
            Danh sách câu hỏi
          </h4>
          <div className="grid grid-cols-10 gap-2">
            {quiz.questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(index)}
                className={`aspect-square rounded-lg font-semibold transition ${
                  answers[q.id]
                    ? "bg-blue-600 text-white"
                    : currentQuestion === index
                      ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="w-16 h-16 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-center mb-4">
              Xác nhận thoát
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Bạn có chắc chắn muốn thoát? Tiến trình làm bài của bạn sẽ không
              được lưu.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Hủy
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Thoát
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementQuiz;
