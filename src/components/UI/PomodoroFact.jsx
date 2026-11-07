/**
 * Where the name comes from. One fixed line, always the same - a rotating
 * list turned out to be noise next to a running timer.
 */
export default function PomodoroFact() {
  return (
    <div className="border-t border-dark-600/50 pt-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-dark-500 mb-1.5">
        Why pomodoro
      </p>
      <p className="text-[12px] leading-relaxed text-dark-400">
        Pomodoro is Italian for tomato. Francesco Cirillo named the technique
        after the tomato-shaped kitchen timer he used as a university student
        in the late 1980s.
      </p>
    </div>
  )
}
