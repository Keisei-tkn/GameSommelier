import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useDebounce } from "./hooks/useDebounce";
import { getRecommendations, searchGames } from "./services/api";
import { Card, CardFooter, CardTitle } from "./components/ui/card";
import { cn } from "@/lib/utils";

type Game = {
  id: number;
  name: string;
  background_image: string;
  genres: { slug: string; name: string }[];
  tags: { slug: string; name: string }[];
};

function App() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const debouncedQuery = useDebounce(searchQuery, 500);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Game[]>([]);
  const [isRecsLoading, setIsRecsLoading] = useState(false);
  const [recsError, setRecsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndSetGames = async () => {
      if (debouncedQuery.trim() === "") {
        setSearchResults([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await searchGames(debouncedQuery);
        const availableGames = data.filter(
          (game) => !selectedGames.some((selected) => selected.id === game.id)
        );
        setSearchResults(availableGames);
      } catch (err) {
        console.error("Error fetching games:", err);
        setError("Failed to fetch games. Please try again later.");
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndSetGames();
  }, [debouncedQuery, selectedGames]);

  const handleSelectGame = (game: Game) => {
    if (selectedGames.length < 5) {
      setSelectedGames((prev) => [...prev, game]);
      setSearchQuery("");
    }
  };

  const handleRemoveGame = (gameId: number) => {
    setSelectedGames((prev) => prev.filter((game) => game.id !== gameId));
  };

  const handleGetRecommendations = async () => {
    if (selectedGames.length === 0) return;

    setIsRecsLoading(true);
    setRecsError(null);
    setRecommendations([]);

    try {
      const genreSlugs = new Set<string>();
      const tagSlugs = new Set<string>();

      selectedGames.forEach((game) => {
        game.genres.forEach((genre) => genreSlugs.add(genre.slug));
        game.tags.slice(0, 3).forEach((tag) => tagSlugs.add(tag.slug));
      });

      if (genreSlugs.size === 0 && tagSlugs.size === 0) {
        throw new Error("No genres or tags found to base recommendations on.");
      }

      const recs = await getRecommendations(
        Array.from(genreSlugs).join(","),
        Array.from(tagSlugs).join(",")
      );

      const finalRecs = recs.filter(
        (rec) => !selectedGames.some((selected) => selected.id === rec.id)
      );

      setRecommendations(finalRecs);
    } catch (err) {
      console.error(err);
      setRecsError("Could not fetch recommendations. Please try again.");
    } finally {
      setIsRecsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen w-full flex flex-col mx-auto px-4 py-6 bg-[#111121]">
        <div className="mx-auto my-6 justify-center text-center">
          <h1 className="text-white text-2xl md:text-3xl font-inter font-bold">
            Select Your Favorite Games
          </h1>
          <p className="text-white text-base md:text-lg font-inter">
            Choose up to 5 games to get new recommendations.
          </p>
        </div>

        <div className="w-full max-w-2xl mx-auto">
          <div className="relative">
            <Input
              type="search"
              placeholder={
                selectedGames.length >= 5
                  ? "Maximum of 5 games selected"
                  : "Search for a game..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={selectedGames.length >= 5}
              className="w-full py-4 md:py-6 !text-lg md:!text-2xl font-inter text-white placeholder:text-lg md:placeholder:text-2xl bg-gray-900 border-0 shadow-lg focus:ring-2 focus:ring-blue-400"
            />
            {isLoading && (
              <div className="absolute top-full mt-2 w-full p-4 text-center bg-card border rounded-md">
                <p className="text-muted-foreground">Searching...</p>
              </div>
            )}
            {error && (
              <div className="absolute top-full mt-2 w-full p-4 text-center bg-destructive border border-destructive-foreground rounded-md">
                <p className="text-destructive-foreground">{error}</p>
              </div>
            )}
            {!isLoading &&
              !error &&
              searchResults.length > 0 &&
              selectedGames.length < 5 && (
                <div className="absolute top-full mt-2 w-full border border-gray-700 rounded-md shadow-lg z-10 bg-gray-900">
                  <ul>
                    {searchResults.map((game) => (
                      <li
                        key={game.id}
                        onClick={() => handleSelectGame(game)}
                        className="px-4 py-3 hover:bg-accent hover:text-blue-400 cursor-pointer rounded-md bg-gray-900 text-white"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            style={{
                              backgroundImage: `url(${game.background_image})`,
                            }}
                            className="w-10 h-10 rounded-md bg-cover bg-center flex-shrink-0"
                          ></div>
                          <span className="truncate">{game.name}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>

        <div className="w-full max-w-5xl mx-auto mt-10">
          <div className="flex flex-col sm:flex-row justify-between items-baseline mb-4">
            <h2 className="text-white text-2xl font-inter font-bold text-left">
              Selected Games ({selectedGames.length}/5)
            </h2>
            <h2
              className="text-blue-500 text-sm font-inter hover:text-blue-400 cursor-pointer mt-2 sm:mt-0"
              onClick={() => setSelectedGames([])}
            >
              Clear all selections
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {selectedGames.map((game) => (
              <Card
                key={game.id}
                className="w-full aspect-square relative overflow-hidden bg-cover bg-center border-0 shadow-lg"
                style={{ backgroundImage: `url(${game.background_image})` }}
              >
                <div className="absolute inset-0 h-full w-full flex flex-col justify-end bg-gradient-to-t from-black via-transparent to-transparent">
                  <CardTitle>
                    <Badge
                      variant="destructive"
                      className="absolute top-2 right-2 cursor-pointer font-inter"
                      onClick={() => handleRemoveGame(game.id)}
                    >
                      Remove
                    </Badge>
                  </CardTitle>
                  <CardFooter className="p-2 md:p-4">
                    <h3 className="text-white text-sm md:text-xl font-bold">
                      {game.name}
                    </h3>
                  </CardFooter>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mx-auto mt-10 mb-10">
            <Button
              disabled={selectedGames.length === 0}
              className={cn(
                "px-6 py-3 text-lg font-inter font-bold rounded-md h-full transition-all duration-300",
                {
                  // Styles for the ENABLED state (neon effect)
                  "bg-blue-500 text-white hover:bg-blue-600 shadow-[0_0_5px_theme(colors.blue.500),0_0_10px_theme(colors.blue.500)]":
                    selectedGames.length > 0,
                  // Styles for the DISABLED state (dimmed)
                  "bg-gray-700 text-gray-400 cursor-not-allowed opacity-60":
                    selectedGames.length === 0,
                }
              )}
            >
              Get Recommendations
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
