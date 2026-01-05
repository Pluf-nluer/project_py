import React, { useState, useEffect } from "react";
import axios from "axios";

const PlacementQuiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/courses/placement-quiz/")
      .then((res) => {
        setQuiz(res.data);
        setLoading(false);
      })
      .catch((err) => {
        alert("Không tải được bài kiểm tra");
        setLoading(false);
      });
  }, []);

  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Vui lòng đăng nhập để làm bài");
      return;
    }

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/courses/submit-quiz/",
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch (err) {
      alert("Lỗi khi nộp bài");
    }
  };

  if (loading)
    return <div className="text-center py-10">Đang tải bài kiểm tra...</div>;
  if (result) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-center mb-6">
          Kết quả kiểm tra
        </h2>
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-blue-600">
            {result.score}%
          </div>
          <p className="text-2xl mt-4">
            Trình độ: <strong>{result.level}</strong>
          </p>
        </div>

        <h3 className="text-2xl font-bold mb-4">Khóa học gợi ý cho bạn</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {result.recommended_courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow p-4">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-48 object-cover rounded mb-4"
              />
              <h4 className="font-bold">{course.title}</h4>
              <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded">
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6">{quiz.title}</h2>
      <p className="text-center text-gray-600 mb-8">{quiz.description}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {quiz.questions.map((q, index) => (
          <div key={q.id} className="mb-8 p-6 bg-white rounded-lg shadow">
            <p className="font-semibold mb-4">
              {index + 1}. {q.text}
            </p>
            <div className="space-y-3">
              {q.choices.map((choice) => (
                <label
                  key={choice.id}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`question_${q.id}`}
                    value={choice.id}
                    onChange={() =>
                      setAnswers({ ...answers, [q.id]: choice.id })
                    }
                    required
                    className="text-blue-600"
                  />
                  <span>{choice.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center">
          <button
            type="submit"
            className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition"
          >
            Nộp bài kiểm tra
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlacementQuiz;
