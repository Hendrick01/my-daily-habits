import { Routes, Route } from "react-router-dom";
import "./App.css";
import AppLayout from "./layouts/AppLayout";
import HomePage from "./pages/HomePage";
import NewHabitPage from "./pages/NewHabitPage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";
import HabitsLayout from "./layouts/HabitsLayout";
import HabitsPage from "./pages/HabitsPage";
import HabitDetailsPage from "./pages/HabitDetailsPage";
import ProgressPage from "./pages/ProgressPage";
import ProtectedProgressRoute from "./components/ProtectedProgressRoute";
import SuggestionsPage from "./pages/SuggestionsPage";
import AccountPage from "./pages/AccountPage";
import TrainingPage from "./pages/training/TrainingPage";
import AssessmentPage from "./pages/training/AssessmentPage";
import WorkoutPage from "./pages/training/WorkoutPage";
import LibraryPage from "./pages/training/LibraryPage";
import ExercisePage from "./pages/training/ExercisePage";
import CustomExercisePage from "./pages/training/CustomExercisePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Índice (página inicial) */}
        <Route index element={<HomePage />} />

        <Route path="habitos" element={<HabitsLayout />}>
          <Route index element={<HabitsPage />} />
          <Route path=":habitId" element={<HabitDetailsPage />} />
        </Route>

        {/* Outras rotas */}
        <Route path="novo" element={<NewHabitPage />} />
        <Route
          path="progresso"
          element={
            <ProtectedProgressRoute>
              <ProgressPage />
            </ProtectedProgressRoute>
          }
        />
        <Route path="treino">
          <Route index element={<TrainingPage />} />
          <Route path="avaliacao" element={<AssessmentPage />} />
          <Route path="exercicios" element={<LibraryPage />} />
          <Route path="exercicios/novo" element={<CustomExercisePage />} />
          <Route path="exercicios/:exerciseId" element={<ExercisePage />} />
          <Route path=":workoutId" element={<WorkoutPage />} />
        </Route>
        <Route path="sugestoes" element={<SuggestionsPage />} />
        <Route path="sobre" element={<AboutPage />} />
        <Route path="conta" element={<AccountPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
