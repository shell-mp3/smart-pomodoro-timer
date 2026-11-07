/**
 * Facts about the Pomodoro Technique, drawn from the documented history
 * rather than productivity folklore.
 *
 * Deliberately omitted: the "first session was 2 minutes / 10 minutes" story,
 * which secondary sources contradict each other on, and the claim that focus
 * peaks at 20-45 minutes, which traces to no identifiable study.
 */
export const POMODORO_FACTS = [
  'Pomodoro is simply Italian for tomato. The technique is named after the tomato-shaped kitchen timer its inventor used.',
  'Francesco Cirillo devised the method in the late 1980s, as a university student trying to survive an exam.',
  'One pomodoro is indivisible. Half a pomodoro does not exist — if it breaks, it never counted.',
  'The classic rhythm: 25 minutes of work, a 5 to 10 minute break, and a 20 to 30 minute break after every fourth one.',
  'Interruptions get the "inform, negotiate, schedule, call back" treatment: write it down, agree a time, return to work.',
  'Winding a physical timer is a small act of commitment — it is the moment you decide the next 25 minutes are spoken for.',
  'A study comparing fixed Pomodoro breaks with self-chosen ones found the self-directed group worked longer stretches and reported more fatigue, less concentration and less motivation.',
  'A 2025 scoping review found time-structured intervals improved focus and reduced mental fatigue versus self-paced breaks.',
]

export function randomFact(exclude) {
  const pool = exclude
    ? POMODORO_FACTS.filter(f => f !== exclude)
    : POMODORO_FACTS
  return pool[Math.floor(Math.random() * pool.length)]
}
