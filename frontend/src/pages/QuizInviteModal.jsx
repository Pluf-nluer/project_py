import React from "react";

function QuizInviteModal({ isOpen, onClose, onAccept }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">
            Đánh giá trình độ của bạn
          </h2>
          <p className="text-gray-600 mb-4">
            Làm bài kiểm tra đầu vào để chúng tôi gợi ý khóa học phù hợp nhất
            với trình độ của bạn
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 text-sm text-gray-700">
              <span>⏱️</span>
              <div className="text-left">
                <p className="font-semibold">Thời gian: 30 phút</p>
                <p className="text-gray-600">20 câu hỏi trắc nghiệm</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onAccept}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
          >
            Bắt đầu làm bài
          </button>
          <button
            onClick={() => {
              onClose();
            }}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizInviteModal;
