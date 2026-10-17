import { Routes, Route } from "react-router-dom";
import "./App.css";
import AppLayout from "./layouts/AppLayout";
import HomePage from "./pages/HomePage";
import NewHabitPage from "./pages/NewHabitPage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Índice (página inicial) */}
        <Route index element={<HomePage />} />
        
        {/* Outras rotas */}
        <Route path="novo" element={<NewHabitPage />} />
        <Route path="sobre" element={<AboutPage />} />
        
        {/* Rota 404 para qualquer outro caminho não mapeado */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
