import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useDebounce } from "./hooks/useDebounce";
import {
  getRecommendations,
  searchGames,
  type Game,
  type GameDetail,
} from "./services/api";
import { Card, CardFooter, CardTitle } from "./components/ui/card";
import { cn } from "@/lib/utils";
import { PlatformIcons } from "@/components/PlatformIcons";
import { mapPlatformNameToSlug } from "@/utils/functions";
import { GameDetailModal } from "@/components/GameDetail";

function App() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const debouncedQuery = useDebounce(searchQuery, 500);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<GameDetail[]>([]);
  const [isRecsLoading, setIsRecsLoading] = useState(false);

  const [modalGameDetail, setModalGameDetail] = useState<GameDetail | null>(
    null
  );

  useEffect(() => {
    const fetchAndSetGames = async () => {
      if (debouncedQuery.trim() === "" || searchQuery.trim() === "") {
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
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndSetGames();
  }, [debouncedQuery, selectedGames, searchQuery]);

  const handleSelectGame = (game: Game) => {
    if (selectedGames.length < 5) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedGames((prev) => [...prev, game]);

      setIsLoading(false);
    }
  };

  const handleRemoveGame = (gameId: number) => {
    setSelectedGames((prev) => prev.filter((game) => game.id !== gameId));
  };

  const handleGetRecommendations = async () => {
    if (selectedGames.length === 0) return;

    setIsRecsLoading(true);
    setRecommendations([]);

    try {
      const genreCounts = new Map<number, number>();
      const themeCounts = new Map<number, number>();
      const keywordCounts = new Map<number, number>();

      selectedGames.forEach((game) => {
        game.genres.forEach((genre) => {
          const count = genreCounts.get(Number(genre.id)) || 0;
          genreCounts.set(Number(genre.id), count + 1);
        });
        game.themes.forEach((theme) => {
          const count = themeCounts.get(Number(theme.id)) || 0;
          themeCounts.set(Number(theme.id), count + 1);
        });
        game.keywords.forEach((keyword) => {
          const count = keywordCounts.get(Number(keyword.id)) || 0;
          keywordCounts.set(Number(keyword.id), count + 1);
        });
      });

      if (genreCounts.size === 0 || themeCounts.size === 0) {
        throw new Error("No hay suficientes datos de género o tema.");
      }

      const dominantGenreId = [...genreCounts.entries()].reduce((a, b) =>
        b[1] > a[1] ? b : a
      )[0];

      const dominantThemeId = [...themeCounts.entries()].reduce((a, b) =>
        b[1] > a[1] ? b : a
      )[0];

      const sortedKeywords = [...keywordCounts.entries()].sort(
        (a, b) => b[1] - a[1]
      );
      const topThreeKeywordIDs = sortedKeywords
        .slice(0, 3)
        .map((entry) => entry[0]);

      if (topThreeKeywordIDs.length === 0) {
        console.warn(
          "No se encontraron keywords comunes. Las recomendaciones se basarán solo en género y tema."
        );
      }

      const recs = await getRecommendations(
        [dominantGenreId],
        [dominantThemeId],
        topThreeKeywordIDs
      );

      const finalRecs = recs.filter(
        (rec) => !selectedGames.some((selected) => selected.id === rec.id)
      );

      setRecommendations(finalRecs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecsLoading(false);
    }
  };

  const handleCardClick = (gameId: number) => {
    const gameToShow = recommendations.find((game) => game.id === gameId);
    if (gameToShow) {
      setModalGameDetail(gameToShow);
    } else {
      console.error("Clicked game not found in recommendations list.");
    }
  };

  const closeModal = () => {
    setModalGameDetail(null);
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
                              backgroundImage: `url(${game.cover_url})`,
                            }}
                            className="w-10 h-15 rounded-md bg-cover bg-center flex-shrink-0"
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
              onClick={() => {
                setSelectedGames([]);
                setRecommendations([]);
              }}
            >
              Clear all selections
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {selectedGames.map((game) => (
              <Card
                key={game.id}
                className="w-full aspect-square relative overflow-hidden bg-cover bg-center border-0 shadow-lg"
                style={{ backgroundImage: `url(${game.cover_url})` }}
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
              onClick={handleGetRecommendations}
              disabled={selectedGames.length === 0 || isRecsLoading}
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
          <div className="grid grid-cols-1 max-width-sm gap-6">
            {recommendations.map((game) => (
              <Card
                key={game.id}
                className="w-full flex flex-col md:flex-row bg-gray-900 border-0 shadow-lg px-4"
                onClick={() => handleCardClick(game.id)}
              >
                <div
                  style={{
                    backgroundImage: `url(${game.cover_url})`,
                  }}
                  className="w-full aspect-[3/4] md:w-48 md:h-64 rounded-md bg-cover bg-center bg-no-repeat my-auto"
                ></div>
                <div className="flex-grow px-4">
                  <h2 className="text-white text-2xl font-bold">{game.name}</h2>
                  <div className="flex-rows-2 mt-2">
                    <div>
                      <h3 className="text-white text-lg font-semibold mt-2">
                        Genres
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {game.genres.map((genre) => (
                          <Badge
                            key={genre.id}
                            className="bg-gray-800 text-gray-400"
                          >
                            {genre.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-semibold mt-2">
                        Themes
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {game.themes.map((theme) => (
                          <Badge
                            key={theme.id}
                            className="bg-gray-800 text-gray-400"
                          >
                            {theme.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-semibold mt-2">
                        Developers
                      </h3>
                      <p className="text-gray-400">
                        {game.involved_companies
                          .slice(0, 3)
                          .map((company) => company.company.name)
                          .join(", ") || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-semibold mt-2">
                        Platforms
                      </h3>
                      {game.platforms && game.platforms.length > 0 ? (
                        <div className="mt-1">
                          <PlatformIcons
                            platforms={game.platforms.map((p) => ({
                              platform: {
                                slug: mapPlatformNameToSlug(p.name),
                                name: p.name,
                              },
                            }))}
                          />
                        </div>
                      ) : (
                        <p className="text-gray-400">Unknown</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <GameDetailModal
            isOpen={!!modalGameDetail}
            game={modalGameDetail}
            onClose={closeModal}
          />
        </div>
      </div>
    </>
  );
}

export default App;
