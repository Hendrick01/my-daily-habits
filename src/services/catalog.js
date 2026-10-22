// Catálogo completo do Free Exercise DB (800+ exercícios, em inglês), carregado só quando pedido.
const CATALOG_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

const MUSCLE_GROUP = {
  chest: "peito",
  lats: "costas",
  "middle back": "costas",
  "lower back": "costas",
  traps: "costas",
  shoulders: "ombros",
  biceps: "biceps",
  forearms: "biceps",
  triceps: "triceps",
  quadriceps: "pernas",
  hamstrings: "pernas",
  adductors: "pernas",
  abductors: "pernas",
  glutes: "gluteos",
  calves: "panturrilhas",
  abdominals: "abdomen",
  neck: "pescoco",
};

export const MUSCLES_PT = {
  chest: "peito",
  lats: "dorsais",
  "middle back": "meio das costas",
  "lower back": "lombar",
  traps: "trapézio",
  shoulders: "ombros",
  biceps: "bíceps",
  forearms: "antebraços",
  triceps: "tríceps",
  quadriceps: "quadríceps",
  hamstrings: "posterior de coxa",
  adductors: "adutores",
  abductors: "abdutores",
  glutes: "glúteos",
  calves: "panturrilhas",
  abdominals: "abdômen",
  neck: "pescoço",
};

export const EQUIPMENT_PT = {
  "body only": "Peso corporal",
  dumbbell: "Halteres",
  barbell: "Barra",
  machine: "Máquina",
  cable: "Polia",
  kettlebells: "Kettlebell",
  bands: "Elástico",
  "medicine ball": "Medicine ball",
  "exercise ball": "Bola suíça",
  "foam roll": "Rolo de espuma",
  "e-z curl bar": "Barra W",
  other: "Outro",
};

const TYPE = { stretching: "alongamento", cardio: "cardio" };
const LEVEL = { beginner: 1, intermediate: 2, expert: 3 };

function toExercise(entry) {
  return {
    id: `catalogo-${entry.id}`,
    name: entry.name,
    group: MUSCLE_GROUP[entry.primaryMuscles?.[0]] ?? "corpo-inteiro",
    equipmentLabel: EQUIPMENT_PT[entry.equipment] ?? "Sem equipamento",
    muscles: (entry.primaryMuscles ?? []).map((muscle) => MUSCLES_PT[muscle] ?? muscle),
    type: TYPE[entry.category] ?? "forca",
    level: LEVEL[entry.level] ?? 2,
    cautions: [],
    unit: entry.category === "stretching" ? "seg" : "reps",
    image: entry.images?.[0]?.split("/")[0] ?? null,
    steps: entry.instructions ?? [],
    tip: "",
    english: true,
  };
}

let catalog;

export function loadCatalog() {
  catalog ??= fetch(CATALOG_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`Não deu para carregar o catálogo (status ${response.status}).`);
      return response.json();
    })
    .then((list) => list.map(toExercise))
    .catch((error) => {
      catalog = undefined; // permite tentar de novo
      throw error;
    });
  return catalog;
}
