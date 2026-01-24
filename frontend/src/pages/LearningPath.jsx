import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaPlay, FaCheck } from "react-icons/fa";

export default function LearningPath() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lessonNumbers = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-white font-sans">
      {/* Header Bar */}
      <div className="h-14 bg-[#2d2d2d] flex items-center px-4 justify-between border-b border-black">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="hover:text-blue-400">
            <FaChevronLeft />
          </button>
          <span className="font-medium text-sm">[Basic_DSAA] Hướng dẫn toàn tập</span>
        </div>
        
        {/* Navigation Numbers */}
        <div className="flex gap-1">
          {lessonNumbers.map((n) => (
            <button key={n} className={`w-8 h-8 flex items-center justify-center rounded text-xs transition ${n === 1 ? "bg-blue-600" : "bg-[#3c3c3c] hover:bg-gray-600"}`}>
              {n}
            </button>
          ))}
        </div>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Task Description */}
        <div className="w-1/3 bg-white text-gray-800 overflow-y-auto p-8 shadow-inner">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">Bài tập</h2>
          <p className="mb-4 text-lg">Viết chương trình để in ra màn hình chữ <span className="text-red-600 font-mono bg-red-50 px-1">"Ready"</span>.</p>
          
          <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200 mt-8">
            <ul className="space-y-3 text-sm">
              <li><strong>Đầu vào:</strong> Không có.</li>
              <li><strong>Đầu ra:</strong> Chữ <code className="text-pink-600">"Ready"</code> trên một dòng duy nhất.</li>
            </ul>
          </div>

          <div className="mt-10 p-4 bg-blue-50 rounded-lg text-blue-800 text-sm">
             <strong>Gợi ý:</strong> Sử dụng lệnh <code>Console.WriteLine()</code> trong C#.
          </div>
        </div>

        {/* Right: IDE Editor */}
        <div className="flex-1 flex flex-col border-l border-black">
          <div className="h-9 bg-[#252526] text-gray-400 text-xs flex items-center px-4 border-b border-black">
            C# (v9.0) - Program.cs
          </div>
          
          <div className="flex-1 p-6 font-mono text-base leading-relaxed overflow-auto">
            <div className="flex gap-4">
              <span className="text-gray-600 select-none">1</span>
              <p><span className="text-blue-400">using</span> System;</p>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-600 select-none">2</span>
              <p><span className="text-blue-400">class</span> <span className="text-yellow-200">Tutorial</span> {"{"}</p>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-600 select-none">3</span>
              <p>&nbsp;&nbsp;<span className="text-blue-400">static void</span> <span className="text-yellow-200">Main</span>() {"{"}</p>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-600 select-none">4</span>
              <p className="bg-blue-900/30 w-full">&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-400">// Viết code của bạn tại đây...</span></p>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-600 select-none">5</span>
              <p>&nbsp;&nbsp;{"}"}</p>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-600 select-none">6</span>
              <p>{"}"}</p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="h-16 bg-[#2d2d2d] flex items-center justify-between px-6 border-t border-black">
            <button className="text-gray-400 hover:text-white flex items-center gap-2 transition text-sm">
              <FaPlay className="text-xs"/> Chạy thử
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded font-bold transition flex items-center gap-2">
              <FaCheck /> Nộp bài (10)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}