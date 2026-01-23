import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Award,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";

export default function CourseQuiz({ quizId, onClose }) {
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const API_URL = "http://127.0.0.1:8000/api/courses";
  const token = localStorage.getItem("access_token");

  console.log("CourseQuiz mounted với quizId:", quizId);

  // Bắt đầu làm bài
  useEffect(() => {
    if (!quizId || !token) {
      setError("Thiếu quizId hoặc token. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    startQuiz();
  }, [quizId]);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Bắt đầu gọi API start quiz cho quizId:", quizId);
      console.log("Token sử dụng:", token.substring(0, 20) + "...");

      const response = await axios.post(
        `${API_URL}/quizzes/${quizId}/start/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("API start quiz thành công:", response.data);
      setAttempt(response.data);
      setTimeRemaining(response.data.time_remaining || 0);

      if (
        response.data.status === "SUBMITTED" ||
        response.data.status === "TIME_UP"
      ) {
        setShowResult(true);
        // Tự động thoát sau 5 giây nếu đã nộp
        setTimeout(onClose, 5000);
      }
    } catch (err) {
      console.error("Lỗi start quiz chi tiết:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      let errorMsg = "Không thể bắt đầu bài kiểm tra. Vui lòng thử lại.";
      if (err.response) {
        if (err.response.status === 401) {
          errorMsg =
            "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.";
          localStorage.removeItem("access_token");
          setTimeout(() => (window.location.href = "/login"), 1500);
        } else if (err.response.status === 403) {
          errorMsg =
            "Bạn không có quyền làm bài kiểm tra này (có thể chưa đăng ký khóa học).";
        } else if (err.response.status === 400) {
          errorMsg =
            err.response.data?.detail ||
            err.response.data?.error ||
            "Dữ liệu không hợp lệ.";
        } else if (err.response.data?.detail) {
          errorMsg = err.response.data.detail;
        }
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Đếm ngược thời gian
  useEffect(() => {
    if (!attempt || showResult || attempt.status !== "IN_PROGRESS") return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt, showResult]);

  // Kiểm tra thời gian từ server mỗi 10 giây
  useEffect(() => {
    if (!attempt || showResult || attempt.status !== "IN_PROGRESS") return;

    const checkTimer = setInterval(async () => {
      try {
        const response = await axios.get(
          `${API_URL}/quiz-attempts/${attempt.id}/check-time/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.status !== "IN_PROGRESS") {
          setShowResult(true);
          fetchResult();
        } else {
          setTimeRemaining(response.data.time_remaining);
        }
      } catch (err) {
        console.error("Lỗi kiểm tra thời gian:", err);
      }
    }, 10000);

    return () => clearInterval(checkTimer);
  }, [attempt, showResult]);

  // Chọn đáp án
  const handleSelectAnswer = async (questionId, choiceId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }));

    try {
      await axios.post(
        `${API_URL}/quiz-attempts/${attempt.id}/answer/`,
        {
          question_id: questionId,
          choice_id: choiceId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (err) {
      console.error("Lỗi lưu câu trả lời:", err);
      if (err.response?.status === 400) {
        alert("Hết giờ làm bài!");
        fetchResult();
        setShowResult(true);
      }
    }
  };

  // Tự động nộp khi hết giờ
  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    console.log("Hết giờ → tự động nộp bài cho attempt:", attempt.id);

    try {
      const response = await axios.post(
        `${API_URL}/quiz-attempts/${attempt.id}/submit/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("Auto submit thành công:", response.data);
      await fetchResult();
      setShowResult(true);

      // Tự động thoát sau 5 giây
      setTimeout(onClose, 5000);
    } catch (err) {
      console.error("Lỗi auto submit:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [attempt, isSubmitting, onClose]);

  // Nộp bài thủ công
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    console.log("Bắt đầu nộp bài - attempt ID:", attempt.id);
    console.log("Trạng thái:", attempt.status);
    console.log("Số đáp án đã chọn:", Object.keys(selectedAnswers).length);

    if (attempt.status !== "IN_PROGRESS") {
      alert("Bài kiểm tra đã kết thúc hoặc chưa bắt đầu.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/quiz-attempts/${attempt.id}/submit/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Nộp bài thành công:", response.data);
      await fetchResult();
      setShowResult(true);

      // Tự động thoát sau 5 giây
      setTimeout(onClose, 5000);
    } catch (err) {
      console.error("Lỗi nộp bài chi tiết:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      let msg = "Có lỗi khi nộp bài.";
      if (err.response?.status === 400) {
        msg =
          err.response.data?.detail ||
          err.response.data?.error ||
          err.response.data?.non_field_errors?.[0] ||
          "Bài kiểm tra không hợp lệ (có thể chưa trả lời hoặc đã nộp trước đó)";
      } else if (err.response?.status === 401) {
        msg = "Phiên hết hạn. Đăng nhập lại nhé!";
        localStorage.removeItem("access_token");
        setTimeout(() => (window.location.href = "/login"), 1500);
      }

      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lấy kết quả
  const fetchResult = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/quiz-attempts/${attempt.id}/result/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setAttempt(res.data);
      setShowResult(true);
    } catch (err) {
      console.error("Lỗi lấy kết quả:", err);
    }
  };

  // Render
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">
            Đang khởi tạo bài kiểm tra...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <AlertCircle className="text-red-500 w-16 h-16 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
        <p className="text-xl text-gray-600">Không thể tải bài kiểm tra</p>
      </div>
    );
  }

  const currentQuestion = attempt.questions?.[currentQuestionIndex];
  const isLastQuestion =
    currentQuestionIndex === (attempt.questions?.length - 1 || 0);

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-blue-600 text-white flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {attempt.quiz?.title || "Bài kiểm tra"}
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-medium">
                {Math.floor(timeRemaining / 60)}:
                {(timeRemaining % 60).toString().padStart(2, "0")}
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
            >
              Thoát
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="p-4 bg-gray-100 flex justify-between items-center text-sm">
          <div className="font-medium">
            Câu {currentQuestionIndex + 1} / {attempt.questions?.length || 0}
          </div>
          <div>
            Điểm hiện tại: {attempt.score || 0} / {attempt.total_points || 0}
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 p-8 overflow-y-auto">
          {showResult ? (
            // Màn hình kết quả
            <div className="text-center py-12">
              <Award className="w-24 h-24 mx-auto text-yellow-500 mb-6" />
              <h2 className="text-3xl font-bold mb-4">
                Bài kiểm tra đã hoàn thành!
              </h2>
              <p className="text-2xl mb-2">
                Điểm số:{" "}
                <span className="font-bold text-blue-600">
                  {attempt.score || 0}
                </span>{" "}
                / {attempt.total_points || 0}
              </p>
              <p className="text-xl mb-6">
                {attempt.is_passed ? (
                  <span className="text-green-600 font-bold">
                    Chúc mừng! Bạn đã đạt yêu cầu.
                  </span>
                ) : (
                  <span className="text-red-600 font-bold">
                    Chưa đạt, hãy thử lại nhé!
                  </span>
                )}
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Thời gian làm: {Math.floor(attempt.time_spent / 60)} phút{" "}
                {attempt.time_spent % 60} giây
              </p>

              <button
                onClick={onClose}
                className="px-10 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg"
              >
                Xem chi tiết & Thoát
              </button>

              {/* Tự động thoát sau 5 giây */}
              <p className="mt-4 text-sm text-gray-500">
                Tự động thoát sau 5 giây...
              </p>
              {setTimeout(onClose, 5000)}
            </div>
          ) : currentQuestion ? (
            // Câu hỏi hiện tại
            <div>
              <h2 className="text-xl font-bold mb-6">
                {currentQuestion.question_text}
              </h2>

              <div className="space-y-4">
                {currentQuestion.choices?.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() =>
                      handleSelectAnswer(currentQuestion.id, choice.id)
                    }
                    className={`w-full p-5 text-left rounded-xl border-2 transition-all duration-200 ${
                      selectedAnswers[currentQuestion.id] === choice.id
                        ? "border-blue-600 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedAnswers[currentQuestion.id] === choice.id
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedAnswers[currentQuestion.id] === choice.id && (
                          <div className="w-4 h-4 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-lg">{choice.choice_text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 text-xl">
              Đang tải câu hỏi...
            </p>
          )}
        </div>

        {/* Navigation */}
        {!showResult && (
          <div className="p-6 border-t border-gray-200 flex justify-between items-center bg-gray-50">
            <button
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
              }
              disabled={currentQuestionIndex === 0}
              className="px-8 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Câu trước
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || loading}
                className="px-10 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 shadow-md"
              >
                <Send className="w-5 h-5" />
                {isSubmitting ? "Đang nộp..." : "Nộp bài"}
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    Math.min(attempt.questions?.length - 1 || 0, prev + 1),
                  )
                }
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-md"
              >
                Câu tiếp
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Grid câu hỏi (ẩn khi showResult) */}
        {!showResult && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <h3 className="font-bold mb-4 text-lg">Danh sách câu hỏi</h3>
            <div className="grid grid-cols-8 md:grid-cols-12 gap-2">
              {attempt.questions?.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
                    idx === currentQuestionIndex
                      ? "bg-blue-600 text-white ring-2 ring-blue-400"
                      : selectedAnswers[q.id]
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
