// client/src/components/QuizQueue.jsx
import { useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Layers, CheckCircle2 } from "lucide-react";
import QuestionCard from "./QuestionCard";

/* ---------------- Sortable Item ---------------- */
const SortableQuestionCard = ({ question, index, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative group"
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        title="Drag to reorder"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10
                   p-1.5 rounded-md cursor-grab active:cursor-grabbing
                   bg-[var(--bg-sec)] text-[var(--txt-dim)]
                   opacity-0 group-hover:opacity-100
                   transition"
      >
        <GripVertical size={16} />
      </div>

      {/* Card */}
      <div className="pl-8">
        <QuestionCard
          question={question}
          onToggle={onRemove}
          isSelected={true}
          showOrder={true}
          order={index + 1}
        />
      </div>
    </div>
  );
};

/* ---------------- Main Queue ---------------- */
const QuizQueue = ({ selectedQuestions, setSelectedQuestions, roomId }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (roomId) {
      localStorage.setItem(
        `quizQueue_${roomId}`,
        JSON.stringify(selectedQuestions)
      );
    }
  }, [selectedQuestions, roomId]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSelectedQuestions((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleRemove = (id) => {
    setSelectedQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="h-full bg-[var(--bg-ter)] rounded-lg border border-black/5
                    flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Layers size={16} />
          Quiz Queue
          <span className="text-xs text-[var(--txt-dim)]">
            ({selectedQuestions.length})
          </span>
        </div>

        {selectedQuestions.length >= 5 && (
          <span className="flex items-center gap-1 px-2.5 py-1
                           bg-green-500/10 text-green-400
                           text-xs font-medium rounded-full">
            <CheckCircle2 size={14} />
            Ready
          </span>
        )}
      </div>

      {/* Content */}
      {selectedQuestions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-sec)]
                          flex items-center justify-center mb-3">
            <Layers className="text-[var(--txt-dim)]" />
          </div>
          <p className="text-sm text-[var(--txt-dim)]">
            No questions selected
          </p>
          <p className="text-xs text-[var(--txt-disabled)] mt-1">
            Select at least 5 questions
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto hide-scrollbar pr-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedQuestions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 py-1">
                {selectedQuestions.map((q, i) => (
                  <SortableQuestionCard
                    key={q.id}
                    question={q}
                    index={i}
                    onRemove={() => handleRemove(q.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Footer Hint */}
      {selectedQuestions.length > 0 && selectedQuestions.length < 5 && (
        <p className="text-xs text-amber-500 mt-3 text-center shrink-0">
          Add {5 - selectedQuestions.length} more question(s) to create room
        </p>
      )}
    </div>
  );
};

export default QuizQueue;
