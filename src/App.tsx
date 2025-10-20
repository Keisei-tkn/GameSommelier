import Header from "@/components/header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useDebounce } from "./hooks/useDebounce";
import { searchGames } from "./services/api";
import { Card, CardFooter, CardTitle } from "./components/ui/card";

type Game = {
  id: number;
  name: string;
  background_image: string;
};

function App() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const debouncedQuery = useDebounce(searchQuery, 500);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <>
      <div>
        <Header />
      </div>
      <div className="h-screen w-full flex flex-col mx-auto px-4 py-6 bg-[#111121]">
        <div className="mx-auto my-6 justify-center text-center">
          <h1 className="text-white text-3xl font-inter font-bold">
            Select Your Favorite Games
          </h1>
          <p className="text-white text-lg font-inter">
            Choose up to 5 games to get new recommendations.
          </p>
        </div>
        <div className="w-2/3 mx-auto">
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
              className="w-full py-8 font-inter !text-2xl text-white placeholder:text-2xl bg-gray-900 border-0 shadow-lg focus:ring-2 focus:ring-blue-400"
            />
            {isLoading && (
              <div className="mt-2 w-full p-4 text-center bg-card border rounded-md">
                <p className="text-muted-foreground">Searching...</p>
              </div>
            )}
            {error && (
              <div className="mt-2 w-full p-4 text-center bg-destructive border border-destructive-foreground rounded-md">
                <p className="text-destructive-foreground">{error}</p>
              </div>
            )}
            {!isLoading &&
              !error &&
              searchResults.length > 0 &&
              selectedGames.length < 5 && (
                <div className="absolute top-full mt-2 w-full border border-gray rounded-md shadow-lg z-10 bg-gray-900">
                  <ul>
                    {searchResults.map((game) => (
                      <li
                        key={game.id}
                        onClick={() => handleSelectGame(game)}
                        className="px-4 py-3 hover:bg-accent hover:text-blue-400 cursor-pointer rounded-md bg-gray-900 text-white"
                      >
                        {game.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
        <div>
          <div>
            <div className="w-3/4 flex-row justify-between flex mx-auto align-center ">
              <div>
                <h2 className="text-white text-2xl font-inter font-bold mt-10 mb-4 text-left">
                  Selected Games ({selectedGames.length}/5)
                </h2>
              </div>
              <div>
                <h2
                  className="text-white text-md font-inter mt-12 mb-4 text-right hover:text-blue-400 cursor-pointer"
                  onClick={() => setSelectedGames([])}
                >
                  Clear all selections.
                </h2>
              </div>
            </div>
          </div>
          <div>
            <div className=" w-3/4 flex flex-wrap items-center justify-center mt-6 gap-6 mx-auto">
              {selectedGames.map((game) => (
                <Card
                  className="w-60 h-60 relative overflow-hidden bg-cover bg-center border-0 shadow-lg "
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

                    <CardFooter className="p-4">
                      <h3 className="text-white text-xl font-bold">
                        {game.name}
                      </h3>
                    </CardFooter>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <div className="w-3/4 flex justify-center mx-auto mt-10 mb-10">
              <Button className="bg-blue-500 text-white hover:bg-blue-600 px-6 py-3 text-lg font-inter font-bold rounded-md shadow-[0_0_5px_theme(colors.blue.500),0_0_10px_theme(colors.blue.500)] h-full">
                Get Recommendations
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
