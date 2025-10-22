import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type GameDetail } from "@/services/api";
import { PlatformIcons } from "./PlatformIcons";
import { mapPlatformNameToSlug } from "@/utils/functions";

interface GameDetailModalProps {
  game: GameDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  isOpen,
  onClose,
}) => {
  if (!game) return null;

  const trailer = game.videos?.find((video) => video.video_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] md:max-w-[700px] lg:max-w-[800px] bg-gray-900 text-white border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl">
            {game.name}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {game.involved_companies
              .slice(0, 3)
              .map((company) => company.company.name)
              .join(", ") || "Unknown"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 md:gap-6 py-4">
          {trailer && (
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${trailer.video_id}?autoplay=1`}
                title={trailer.name || "Game Trailer"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture autoplay"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="w-full md:w-[200px] flex-shrink-0">
              <div
                className="aspect-[3/4] w-full rounded-md bg-cover bg-center bg-gray-700"
                style={{ backgroundImage: `url(${game.cover_url})` }}
                role="img"
                aria-label={game.name + " cover art"}
              ></div>
            </div>
            <div className="flex-grow space-y-4">
              {game.summary && (
                <div>
                  <h4 className="font-semibold text-lg mb-1">Summary</h4>
                  <p className="text-sm text-gray-300 line-clamp-3 md:line-clamp-none">
                    {game.summary}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                <div>
                  <p className="font-semibold text-gray-300">Genre</p>
                  <p className="text-gray-400">
                    {game.genres?.[0]?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-300">Theme</p>
                  <p className="text-gray-400">
                    {game.themes?.[0]?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-300">Platforms</p>
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
                <div>
                  <p className="font-semibold text-gray-300">Rating</p>
                  <p className="text-yellow-400">
                    {game.aggregated_rating
                      ? `${game.aggregated_rating}%`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
