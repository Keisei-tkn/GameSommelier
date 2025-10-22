import { Apple, Globe } from "lucide-react";
import {
  FaPlaystation,
  FaXbox,
  FaLinux,
  FaAndroid,
  FaWindows,
} from "react-icons/fa";
import { SiNintendoswitch } from "react-icons/si";

// You might need to install react-icons: npm install react-icons
interface PlatformIconsProps {
  platforms: { platform: { slug: string; name: string } }[];
}

const iconMap: { [key: string]: React.ElementType } = {
  pc: FaWindows,
  playstation: FaPlaystation,
  xbox: FaXbox,
  nintendo: SiNintendoswitch,
  mac: Apple,
  linux: FaLinux,
  android: FaAndroid,
  web: Globe,
  ios: Apple,
};

export const PlatformIcons: React.FC<PlatformIconsProps> = ({ platforms }) => {
  // Get unique parent platform slugs to avoid duplicate icons (e.g. PS4 and PS5 -> Playstation icon)
  const parentSlugs = new Set(
    platforms.map((p) => p.platform.slug.split("-")[0])
  );

  return (
    <div className="flex items-center gap-2">
      {Array.from(parentSlugs).map((slug) => {
        const Icon = iconMap[slug];
        if (Icon) {
          return <Icon key={slug} className="h-4 w-4 text-gray-400" />;
        }
        return null;
      })}
    </div>
  );
};
