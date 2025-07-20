"use client";
import React, { useEffect, useState } from "react";

interface NavbarProps {
  repoUrl: string;
}

export default function Navbar({ repoUrl }: NavbarProps) {
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    let lastScroll = window.scrollY;
    const onScroll = () => {
      const current = window.scrollY;
      if (current <= 10) setShowNavbar(true);
      else if (current > lastScroll) setShowNavbar(false);
      else setShowNavbar(true);
      lastScroll = current;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 flex justify-center bg-transparent transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}
      style={{ willChange: 'transform' }}
    >
      <div className="w-full max-w-5xl flex justify-between items-center futuristic-glass mt-4 mx-2 px-4 py-2 shadow-lg backdrop-blur-md">
        {/* Left: Glowing dot */}
        <div className="flex items-center">
          <span className="w-4 h-4 rounded-full mr-2" style={{ boxShadow: '0 0 16px 4px #22ff88', background: 'linear-gradient(135deg, #22ff88 0%, #0ae360 100%)' }}></span>
          <span className="text-xs font-mono opacity-70 tracking-widest">LIVE</span>
        </div>
        {/* Right: Star and Fork icons */}
        <div className="flex gap-4">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Star this repo"
            className="hover:scale-125 transition-transform"
          >
            <svg aria-hidden="true" height="24" viewBox="0 0 16 16" width="24" fill="#FFD700" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"></path>
            </svg>
          </a>
          <a
            href={repoUrl + "/fork"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Fork this repo"
            className="hover:scale-125 transition-transform"
          >
            <svg aria-hidden="true" height="24" viewBox="0 0 16 16" width="24" fill="#A3A3A3" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
} 