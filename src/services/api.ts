export type Game = {
  id: number;
  name: string;
  cover_url: string;
  genres: { id: string; name: string }[];
  themes: { id: string; name: string }[];
  keywords: { id: number; name: string }[];
};

export type GameDetail = Game & {
  involved_companies: { company: { name: string } }[];
  platforms: { name: string }[];
  aggregated_rating: number;
};

function formatImageUrl(imageId: string): string {
  if (!imageId)
    return "https://placehold.co/400x600/111121/FFFFFF/png?text=No+Image";
  return `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`;
}

async function queryIGDB<T>(query: string): Promise<T> {
  const response = await fetch("http://localhost:3001/api/igdb", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`IGDB query failed: ${errorText}`);
  }
  return response.json();
}

export const searchGames = async (searchText: string): Promise<Game[]> => {
  if (!searchText.trim()) return [];

  const query = `
    search "${searchText}";
    fields name, cover.image_id, genres.name, themes.name, keywords.name;
    where cover != null & genres != null & keywords != null;
    limit 10;
  `;

  const results = await queryIGDB<any[]>(query);

  return results.map((game) => ({
    id: game.id,
    name: game.name,
    cover_url: formatImageUrl(game.cover?.image_id),
    genres: game.genres || [],
    themes: game.themes || [],
    keywords: game.keywords || [],
  }));
};

export const getRecommendations = async (
  genreIDs: number[],
  themeIDs: number[],
  keywordIDs: number[]
): Promise<GameDetail[]> => {
  if (genreIDs.length === 0) return [];

  const randomOffset = Math.floor(Math.random() * 25);

  const query = `
    fields name, cover.image_id, involved_companies.company.name, platforms.name, aggregated_rating, genres.name, themes.name, keywords.name;
    where 
      genres = (${genreIDs.join(",")}) & 
      themes = (${themeIDs.join(",")}) & 
      keywords = (${keywordIDs.join(",")}) &
      aggregated_rating > 75 & 
      aggregated_rating_count > 5;
    sort aggregated_rating desc;
    limit 10;
    offset ${randomOffset}; 
  `;
  console.log("Recommendation Query:", query);

  const results = await queryIGDB<any[]>(query);

  return results.map((game) => ({
    id: game.id,
    name: game.name,
    cover_url: formatImageUrl(game.cover?.image_id),
    genres: game.genres || [],
    themes: game.themes || [],
    keywords: game.keywords || [],
    involved_companies: game.involved_companies || [],
    platforms: game.platforms || [],
    aggregated_rating: game.aggregated_rating
      ? Math.round(game.aggregated_rating)
      : 0,
  }));
};
