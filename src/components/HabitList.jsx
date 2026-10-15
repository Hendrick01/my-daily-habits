import HabitCard from "./HabitCard";

export default function HabitList({ habits, onToggle }) {
  if (habits.length === 0) {
    return <p>Nenhum hábito cadastrado.</p>;
  }

  return (
    <section className="habit-list" aria-label="Hábitos de hoje">
      {habits.map((habit) => (
        <HabitCard key={habit.id} {...habit} onToggle={onToggle} />
      ))}
    </section>
  );
}
