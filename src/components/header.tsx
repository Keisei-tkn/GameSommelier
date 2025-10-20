import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

// Best practice: Define navigation links in an array for easy maintenance.
const navLinks = [
  { title: "Home", href: "/" },
  { title: "About", href: "/about" },
];

export default function Header() {
  return (
    <header className="top-0 z-50 w-full bg-[#111121]">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Site Title */}
        <h1 className="text-white text-xl md:text-2xl font-bold">
          Game Sommelier
        </h1>

        {/* Desktop Navigation (Visible on medium screens and up) */}
        <nav className="hidden md:flex">
          <ul className="flex items-center space-x-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-white hover:text-blue-400 font-inter transition-colors"
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Navigation (Visible on small screens) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="text-white bg-transparent border-gray-600"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open main menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-[#111121] text-white border-l-gray-800"
            >
              <div className="flex flex-col space-y-6 pt-8">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-2xl font-medium text-white hover:text-blue-400"
                  >
                    {link.title}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
