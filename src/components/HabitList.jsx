import HabitCard from "./HabitCard";

export default function HabitList({ habits, onShowDetails }) {
  if (habits.length === 0) {
    return <p>Nenhum hábito cadastrado.</p>;
  }

  return (
    <section className="habit-list" aria-label="Hábitos de hoje">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          {...habit}
          onShowDetails={onShowDetails}
        />
      ))}
    </section>
  );
}
