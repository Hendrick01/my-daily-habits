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
        <Route path="sobre" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
