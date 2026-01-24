// client/src/components/Timer.jsx
import { useState, useEffect, useRef } from "react";
import { Clock, AlertTriangle } from "lucide-react";

const Timer = ({ duration = 30, onTimeout, isActive, onTick }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();

      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const remaining = Math.max(0, duration - elapsed);

        setTimeLeft(remaining);

        // Call onTick with elapsed time
        if (onTick) {
          onTick(elapsed);
        }

        if (remaining <= 0) {
          clearInterval(intervalRef.current);
          if (onTimeout) {
            onTimeout();
          }
        }
      }, 100); // Update every 100ms for smooth animation
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, duration, onTimeout]);

  // Calculate progress percentage
  const progress = (timeLeft / duration) * 100;

  // Determine color based on time remaining
  const getColor = () => {
    if (timeLeft > 20) return "bg-green-500";
    if (timeLeft > 10) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTextColor = () => {
    if (timeLeft > 20) return "text-green-700";
    if (timeLeft > 10) return "text-yellow-700";
    return "text-red-700";
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-[var(--txt-dim)]">
          <Clock size={16} />
          <span>Time Remaining</span>
        </div>

        <span
          className={`text-2xl font-bold transition-colors
          ${getTextColor()}`}
        >
          {Math.ceil(timeLeft)}s
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 rounded-full overflow-hidden bg-[var(--bg-sec)]">
        <div
          className={`h-full transition-all duration-100 ${getColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Low Time Warning */}
      {timeLeft <= 5 && timeLeft > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs font-medium text-red-400 animate-pulse">
          <AlertTriangle size={14} />
          <span>Time running out!</span>
        </div>
      )}
    </div>
  );
};

export default Timer;
