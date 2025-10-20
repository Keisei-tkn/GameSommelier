export type Game = {
  id: number;
  name: string;
  background_image: string;
  genres: { slug: string; name: string }[];
  tags: { slug: string; name: string }[];
};

export type GameDetail = Game & {
  developers: { name: string }[];
  parent_platforms: { platform: { slug: string; name: string } }[];
  playtime: number;
};

/**
 * Searches for games by making a call to the RAWG.io API.
 * @param query The search term entered by the user.
 * @returns A Promise that resolves to an array of matching games.
 */

const apiKey = import.meta.env.VITE_RAWG_API_KEY;

export const searchGames = async (query: string): Promise<Game[]> => {
  console.log(`Fetching games from RAWG API with query: "${query}"`);

  if (query.trim() === "") {
    return [];
  }

  if (!apiKey) {
    throw new Error(
      "RAWG API key is missing. Please add it to your .env.local file."
    );
  }

  const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(
    query
  )}&page_size=10`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.json();

    const results: Game[] = data.results
      .filter((game: Game) => game.background_image && game.genres.length > 0)
      .map((game: Game) => ({
        id: game.id,
        name: game.name,
        background_image: game.background_image,
        genres: game.genres.map((genre: { slug: string; name: string }) => ({
          slug: genre.slug,
          name: genre.name,
        })),
        tags: game.tags.map((tag: { slug: string; name: string }) => ({
          slug: tag.slug,
          name: tag.name,
        })),
      }));

    return results;
  } catch (error) {
    console.error("Failed to fetch games from RAWG API:", error);
    throw error;
  }
};

export const getGameDetails = async (id: number): Promise<GameDetail> => {
  // ... implementation remains the same
  if (!apiKey) throw new Error("RAWG API key is missing.");
  const url = `https://api.rawg.io/api/games/${id}?key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch details for game ID ${id}`);
  return await response.json();
};

export const getRecommendations = async (
  genreSlugs: string,
  tagSlugs: string
): Promise<GameDetail[]> => {
  if (!apiKey) {
    throw new Error("RAWG API key is missing.");
  }
  const url = `https://api.rawg.io/api/games?key=${apiKey}&genres=${genreSlugs}&tags=${tagSlugs}&page_size=10&platforms_count=2`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch recommendations.");
  }
  const data = await response.json();
  return data.results;
};
