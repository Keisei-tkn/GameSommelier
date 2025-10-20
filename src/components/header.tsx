import React from "react";

export default function Header() {
  return (
    <header className="bg-[#111121] shadow">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">Game Sommelier</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <a href="/" className="text-white hover:text-blue-400 font-inter">
                Home
              </a>
            </li>
            <li>
              <a
                href="/about"
                className="text-white hover:text-blue-400 font-inter"
              >
                About
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
