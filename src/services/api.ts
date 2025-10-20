export type Game = {
  id: number;
  name: string;
  background_image: string;
};

/**
 * Searches for games by making a call to the RAWG.io API.
 * @param query The search term entered by the user.
 * @returns A Promise that resolves to an array of matching games.
 */

export const searchGames = async (query: string): Promise<Game[]> => {
  console.log(`Fetching games from RAWG API with query: "${query}"`);

  if (query.trim() === "") {
    return [];
  }

  const apiKey = import.meta.env.VITE_RAWG_API_KEY;

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
      .filter(
        (game: { background_image: string | null }) => game.background_image
      )
      .map((game: { id: number; name: string; background_image: string }) => ({
        id: game.id,
        name: game.name,
        background_image: game.background_image,
      }));

    return results;
  } catch (error) {
    console.error("Failed to fetch games from RAWG API:", error);
    throw error;
  }
};
