// O || garante um valor padrão seguro caso o .env não seja carregado
const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://jsonplaceholder.typicode.com";

export async function fetchSuggestions() {
  const response = await fetch(`${baseUrl}/todos?_limit=6`);

  if (!response.ok) {
    throw new Error(`Erro na busca das sugestões. Status da resposta: ${response.status}`);
  }

  const data = await response.json();

  // O map varre o array original e devolve um novo apenas com as propriedades que me interessam
  return data.map((item) => ({
    id: String(item.id),
    title: item.title,
    completed: item.completed,
  }));
}
