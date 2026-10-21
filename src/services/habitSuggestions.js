// Sem VITE_API_BASE_URL, busca no próprio site (public/api/sugestoes.json).
const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

// Embaralhamento de Fisher-Yates: cada busca traz uma seleção diferente.
function pickRandom(list, count) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export async function fetchSuggestions() {
  const response = await fetch(`${baseUrl}/api/sugestoes.json`);

  if (!response.ok) {
    throw new Error(`Erro na busca das sugestões. Status da resposta: ${response.status}`);
  }

  // Servidores de SPA devolvem o index.html (status 200) para arquivos que não existem.
  const data = await response.json().catch(() => null);
  if (!Array.isArray(data)) {
    throw new Error("Erro na busca das sugestões: a resposta não veio no formato esperado.");
  }

  return pickRandom(data, 6).map((item) => ({
    id: String(item.id),
    title: item.title,
    goal: item.goal,
  }));
}
