export const mapPlatformNameToSlug = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("playstation") || n.startsWith("ps")) return "playstation";
  if (n.includes("xbox")) return "xbox";
  if (
    n.includes("nintendo") ||
    n.includes("switch") ||
    n.includes("wii") ||
    n.includes("ds") ||
    n.includes("3ds")
  )
    return "nintendo";
  if (n.includes("pc") || n.includes("windows")) return "pc";
  if (n.includes("mac")) return "mac";
  if (n.includes("linux")) return "linux";
  if (n.includes("android")) return "android";
  if (n.includes("ios") || n.includes("iphone") || n.includes("ipad"))
    return "ios";
  if (n.includes("web") || n.includes("browser")) return "web";
  return n.replace(/\s+/g, "-");
};
