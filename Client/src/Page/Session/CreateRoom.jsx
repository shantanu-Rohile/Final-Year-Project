// client/src/pages/Session/CreateRoom.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import QuestionForm from "../../Components/Session/QuestionForm";
import QuestionCard from "../../Components/Session/QuestionCard";
import QuizQueue from "../../Components/Session/QuizQueue";
import { PlusCircle, ListChecks, CheckCircle2 } from "lucide-react";

const CreateRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [roomData, setRoomData] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Load room initialization data and quiz queue from localStorage
  useEffect(() => {
    const roomInitData = localStorage.getItem("currentRoomInit");
    if (roomInitData) {
      const data = JSON.parse(roomInitData);
      if (data.roomId === roomId) {
        setRoomData(data);
      } else {
        alert("Invalid room initialization");
        navigate("/");
      }
    } else {
      alert("Room initialization data not found");
      navigate("/");
    }

    // Load saved quiz queue
    const savedQueue = localStorage.getItem(`quizQueue_${roomId}`);
    if (savedQueue) {
      setSelectedQuestions(JSON.parse(savedQueue));
    }
  }, [roomId, navigate]);

  const handleQuestionsGenerated = (questions) => {
    // Add unique IDs to questions
    const questionsWithIds = questions.map((q, idx) => ({
      ...q,
      id: `${Date.now()}_${idx}`,
    }));
    setGeneratedQuestions(questionsWithIds);
  };

  const handleToggleQuestion = (question) => {
    const isAlreadySelected = selectedQuestions.some(
      (q) => q.id === question.id,
    );

    if (isAlreadySelected) {
      setSelectedQuestions((prev) => prev.filter((q) => q.id !== question.id));
    } else {
      setSelectedQuestions((prev) => [...prev, question]);
    }
  };

  const handleCreateRoom = async () => {
    if (selectedQuestions.length < 5) {
      alert("Please select at least 5 questions");
      return;
    }

    setIsCreating(true);

    try {
      const token = localStorage.getItem("token");

      // Prepare questions data (remove temporary id)
      const questionsData = selectedQuestions.map(({ id, ...rest }) => rest);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/rooms/create`,
        {
          roomName: roomData.roomName,
          category: roomData.category,
          description: roomData.description,
          questions: questionsData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        // Clear localStorage
        localStorage.removeItem("currentRoomInit");
        localStorage.removeItem(`quizQueue_${roomId}`);

        alert("Room created successfully!");
        navigate("/session");
      } else {
        alert(response.data.error || "Failed to create room");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      alert(error.response?.data?.error || "Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  if (!roomData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--btn)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--txt)]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--bg-ter)] border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left: Room Info */}
          <div>
            <h1 className="text-xl font-semibold text-[var(--txt)]">
              {roomData.roomName}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-[var(--txt-dim)]">
              <span className="font-mono">ID: {roomData.roomId}</span>
              <span className="w-1 h-1 bg-[var(--txt-dim)] rounded-full" />
              <span className="px-2 py-0.5 rounded bg-[var(--bg-sec)]">
                {roomData.category}
              </span>
            </div>
          </div>

          {/* Right: Create Room Action */}
          <button
            onClick={handleCreateRoom}
            disabled={selectedQuestions.length < 5 || isCreating}
            className="flex items-center gap-2 px-5 py-2 rounded-md
                 bg-[var(--btn)] text-white text-sm font-medium
                 hover:bg-[var(--btn-hover)] transition
                 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={16} />
            {isCreating ? "Creating..." : "Create Room"}
          </button>
        </div>
      </header>

      {/* Main Workflow */}
      <main className="p-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full ">
          {/* Step 1 */}
          <section
            className="lg:col-span-3 h-full bg-[var(--bg-ter)]
                        rounded-lg border border-black/5 p-4
                        flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold shrink-0">
              <PlusCircle size={18} />
              Generate Questions
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar">
              <QuestionForm
                onQuestionsGenerated={handleQuestionsGenerated}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </div>
          </section>

          {/* Step 2 */}
          <section
            className="lg:col-span-5 h-full bg-[var(--bg-ter)] rounded-lg border border-black/5 p-4
                        flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <ListChecks size={18} />
                Question Pool
              </div>
              <span className="text-xs text-[var(--txt-dim)]">
                {generatedQuestions.length} questions
              </span>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar pr-1">
              {generatedQuestions.length === 0 ? (
                <div
                  className="h-full flex flex-col items-center justify-center
                          text-center text-[var(--txt-dim)]"
                >
                  <p className="text-sm">No questions generated</p>
                  <p className="text-xs mt-1">Use the left panel to start</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {generatedQuestions.map((q) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      onToggle={() => handleToggleQuestion(q)}
                      isSelected={selectedQuestions.some((s) => s.id === q.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Step 3 */}
          <section
            className="lg:col-span-4 h-full bg-[var(--bg-ter)]
                        rounded-lg border border-black/5
                        flex flex-col overflow-hidden"
          >
            <QuizQueue
              selectedQuestions={selectedQuestions}
              setSelectedQuestions={setSelectedQuestions}
              roomId={roomId}
            />
          </section>
        </div>
      </main>
    </div>
  );
};

export default CreateRoom;
