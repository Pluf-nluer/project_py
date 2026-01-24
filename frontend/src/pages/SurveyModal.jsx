import React, { useState } from "react";

const tags = [".net", "advanced", "ai", "algorithm", "application", "basic", "c#", "c++", "cpp", "css", "database", "datastructure", "high", "html", "java", "javascript", "primary", "python", "scratch", "secondary", "sql"];

const screenerQuiz = {
  questions: [
    {
      id: 1,
      text: "Trong một dự án, bạn tự tin nhất ở mảng nào?",
      choices: [
        { text: "Xây dựng giao diện (HTML/CSS/JS)", tag_hint: "web" },
        { text: "Xử lý logic server & Database (Java/SQL)", tag_hint: "system" },
        { text: "Phân tích dữ liệu & AI (Python)", tag_hint: "ai" },
        { text: "Tôi mới bắt đầu học lập trình", tag_hint: "basic" },
      ],
    },
    {
      id: 2,
      text: "Hãy chọn kết quả của biểu thức: 2 + '2' trong JavaScript?",
      choices: [
        { text: "4", tag_hint: null },
        { text: "'22'", tag_hint: "javascript" },
        { text: "Lỗi", tag_hint: null },
        { text: "Không biết", tag_hint: null },
      ],
    },
    {
      id: 3,
      text: "Bạn đã từng nghe đến khái niệm 'Big O Notation' chưa?",
      choices: [
        { text: "Chưa từng", tag_hint: null },
        { text: "Đã nghe qua nhưng không rõ", tag_hint: "algorithm" },
        { text: "Tôi có thể giải thích nó", tag_hint: "advanced" },
      ],
    },
  ],
};

function SurveyModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1); // Step 1: Tags, Step 2: Screener
  const [selectedTags, setSelectedTags] = useState([]);
  const [screenerHints, setScreenerHints] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleNextStep = () => {
    if (selectedTags.length === 0) {
      alert("Vui lòng chọn ít nhất một nội dung quan tâm.");
      return;
    }
    setStep(2);
  };

  const handleScreenerAnswer = (tagHint) => {
    if (tagHint) {
      setScreenerHints((prev) => [...new Set([...prev, tagHint])]);
    }

    if (currentQ < screenerQuiz.questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      saveAllData();
    }
  };

  const saveAllData = async () => {
    const token = localStorage.getItem("access_token");
    setLoading(true);

    // Gộp tất cả tag đã chọn và tag_hint từ câu hỏi
    const finalTags = [...new Set([...selectedTags, ...screenerHints])];

    try {
      const response = await fetch("http://127.0.0.1:8000/api/courses/save-interests/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
            tags: finalTags,
            is_screener_completed: true 
        }),
      });

      if (response.ok) {
        localStorage.setItem("survey_completed", "true");
        onComplete(finalTags); 
      } else {
        alert("Lỗi lưu dữ liệu.");
      }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-8 relative shadow-2xl">
        
        {step === 1 ? (
          /* BƯỚC 1: CHỌN TAGS */
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Sở thích học tập</h2>
            <div className="flex flex-wrap gap-2 mb-6 max-h-60 overflow-y-auto">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    selectedTags.includes(tag) ? "bg-blue-600 text-white" : "bg-gray-50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3 border-t pt-6">
              <button onClick={onClose} className="px-6 py-2 text-gray-700">Bỏ qua</button>
              <button onClick={handleNextStep} className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold">
                Tiếp theo
              </button>
            </div>
          </>
        ) : (
          /* BƯỚC 2: SCREENER QUIZ */
          <>
            <div className="mb-4">
                <span className="text-blue-600 font-bold text-sm">Câu hỏi {currentQ + 1}/{screenerQuiz.questions.length}</span>
                <h2 className="text-xl font-bold text-gray-800 mt-1">
                    {screenerQuiz.questions[currentQ].text}
                </h2>
            </div>
            <div className="space-y-3 mb-8">
              {screenerQuiz.questions[currentQ].choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleScreenerAnswer(choice.tag_hint)}
                  className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-sm font-medium text-gray-700"
                >
                  {choice.text}
                </button>
              ))}
            </div>
            {loading && <p className="text-center text-blue-600 animate-pulse">Đang phân tích năng lực...</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default SurveyModal;