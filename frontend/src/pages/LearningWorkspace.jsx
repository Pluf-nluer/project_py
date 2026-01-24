// Pages/LearningWorkspace.jsx
export default function LearningWorkspace() {
  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e]">
      {/* Header bar */}
      <div className="h-12 bg-[#2d2d2d] flex items-center px-4 justify-between border-b border-black">
        <span className="text-gray-300 font-medium">[Basic_DSAA] Hướng dẫn toàn tập</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded text-xs cursor-pointer">
              {n}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Instruction */}
        <div className="w-1/3 bg-white overflow-y-auto p-6">
          <h2 className="text-2xl font-bold mb-4">Bài tập</h2>
          <p className="mb-4 text-gray-700">Viết chương trình để in ra màn hình chữ <span className="text-red-500 font-mono">"Ready"</span>.</p>
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
            <p><strong>Đầu vào:</strong> Không có</p>
            <p><strong>Đầu ra:</strong> Ready</p>
          </div>
        </div>

        {/* Right: Code Editor */}
        <div className="flex-1 flex flex-col border-l border-black">
          <div className="h-8 bg-[#252526] text-gray-400 text-xs flex items-center px-4">
            C# Editor
          </div>
          <div className="flex-1 bg-[#1e1e1e] p-4 font-mono text-green-400">
            <span className="text-blue-400">using</span> System;<br/>
            <span className="text-blue-400">class</span> Program {"{"} <br/>
            &nbsp;&nbsp;<span className="text-gray-500">// Viết code tại đây</span><br/>
            {"}"}
          </div>
          {/* Footer actions */}
          <div className="h-14 bg-[#2d2d2d] flex items-center justify-end px-4 gap-4">
             <button className="text-gray-300 hover:text-white">Chạy thử</button>
             <button className="bg-blue-600 px-6 py-1.5 rounded text-white font-bold">Nộp bài</button>
          </div>
        </div>
      </div>
    </div>
  );
}