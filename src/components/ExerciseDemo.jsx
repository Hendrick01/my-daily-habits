import { IMAGE_BASE } from "../data/exercises";

// Demonstração estilo GIF: alterna a foto do início e a do fim do movimento.
// Em miniatura mostra só a primeira foto (economiza dados).
export default function ExerciseDemo({ image, name, size = "large" }) {
  if (!image) {
    return (
      <div className={`exercise-demo is-${size} is-empty`} aria-hidden="true">
        🏋️
      </div>
    );
  }

  const frame = (index) => `${IMAGE_BASE}${image}/${index}.jpg`;

  if (size === "small") {
    return (
      <div className="exercise-demo is-small">
        <img src={frame(0)} alt="" loading="lazy" />
      </div>
    );
  }

  return (
    <div className="exercise-demo is-large" role="img" aria-label={`Demonstração de ${name}: posição inicial e final`}>
      <img src={frame(0)} alt="" />
      <img src={frame(1)} alt="" className="frame-end" />
    </div>
  );
}
