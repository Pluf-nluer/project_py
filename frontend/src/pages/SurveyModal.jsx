import React, { useState } from "react";
import axios from "axios"; // Đừng quên import axios nhé!

// Danh sách tag đầy đủ lấy từ ảnh screenshot của bạn
const tags = [
  ".net", "advanced", "ai", "algorithm", "application", "basic", "c#", "c++",
  "cpp", "css", "database", "datastructure", "high", "html", "java", "javascript",
  "primary", "python", "scratch", "secondary", "sql",
];

export default function SurveyModal({ isOpen, onClose }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false); // Thêm trạng thái chờ khi lưu

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (selectedTags.length === 0) {
      alert("Vui lòng chọn ít nhất một nội dung quan tâm.");
      return;
    }

    const token = localStorage.getItem("access_token");
    setLoading(true);
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/courses/save-interests/",
        { tags: selectedTags },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Lưu vào sessionStorage để không hiện lại trong phiên này
      sessionStorage.setItem("survey_shown", "true");
      onClose(); 
    } catch (error) {
      console.error("Lỗi lưu khảo sát:", error);
      alert("Không thể lưu khảo sát. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg p-8 relative shadow-2xl animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Khảo sát khóa học</h2>
        
        <div className="mb-6">
           <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 min-h-[45px] flex flex-wrap gap-2 text-sm text-gray-400">
              {selectedTags.length === 0 ? "Chọn nội dung quan tâm" : selectedTags.join(", ")}
           </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 max-h-60 overflow-y-auto p-1">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-4 py-1.5 rounded-full border transition-all text-xs font-medium ${
                selectedTags.includes(tag)
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <p className="text-gray-500 mb-6 italic text-sm">
          <strong>Chú ý:</strong> Khảo sát này giúp chúng tôi hiểu rõ nhu cầu của bạn để cung cấp
          những khóa học và nội dung phù hợp nhất.
        </p>

        <div className="flex justify-end gap-3 border-t pt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSave} // Gọi hàm handleSave thay vì onClick cũ
            disabled={loading}
            className={`px-8 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-100 transition-all ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700 active:scale-95"
            }`}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}