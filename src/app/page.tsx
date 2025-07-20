"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

interface GithubUserDetails extends GithubUser {
  public_repos: number;
}

const AVATAR_COUNT = 10;

interface RateLimit {
  remaining: number;
  limit: number;
  reset: number; // unix timestamp
}

// Terms modal and PAT logic
const TERMS_KEY = 'github-galary-terms-accepted';
const TOKEN_KEY = 'github-galary-pat';

export default function Home() {
  const [users, setUsers] = useState<GithubUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalUser, setModalUser] = useState<GithubUserDetails | null>(null);
  const [error, setError] = useState("");
  const [rateLimit, setRateLimit] = useState<RateLimit | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [minRepos, setMinRepos] = useState(0);
  const [minFollowers, setMinFollowers] = useState(0);
  const [minStars, setMinStars] = useState(0);
  const [location, setLocation] = useState("");
  const [accountType, setAccountType] = useState<string>("");
  // Extend userDetails to include stars, location, and type
  const [userDetails, setUserDetails] = useState<Record<string, { public_repos: number; followers: number; stars: number; location: string; type: string }>>({});

  // Navbar hide on scroll logic
  const [showNavbar, setShowNavbar] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [pat, setPat] = useState('');
  const [patInput, setPatInput] = useState('');
  const [patSaved, setPatSaved] = useState(false);

  // Show terms modal on first load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem(TERMS_KEY)) setShowTerms(true);
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedToken) {
        setPat(savedToken);
        setPatInput(savedToken);
        setPatSaved(true);
      }
    }
  }, []);

  const acceptTerms = () => {
    localStorage.setItem(TERMS_KEY, 'yes');
    setShowTerms(false);
  };

  const savePat = () => {
    setPat(patInput.trim());
    localStorage.setItem(TOKEN_KEY, patInput.trim());
    setPatSaved(true);
  };
  const clearPat = () => {
    setPat('');
    setPatInput('');
    setPatSaved(false);
    localStorage.removeItem(TOKEN_KEY);
  };

  // Fetch random users
  const fetchUsers = async () => {
    setIsShuffling(true);
    setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        // Pick a random starting user id (up to 10M for variety)
        const since = Math.floor(Math.random() * 10000000);
        const res = await fetch(`https://api.github.com/users?since=${since}&per_page=${AVATAR_COUNT}`, pat ? { headers: { Authorization: `token ${pat}` } } : undefined);
        // Read rate limit headers
        const rl = {
          remaining: parseInt(res.headers.get("x-ratelimit-remaining") || "0", 10),
          limit: parseInt(res.headers.get("x-ratelimit-limit") || "0", 10),
          reset: parseInt(res.headers.get("x-ratelimit-reset") || "0", 10),
        };
        setRateLimit(rl);
        if (rl.remaining === 0) {
          setError("GitHub API rate limit reached. Please wait before trying again.");
          setUsers([]);
          setIsShuffling(false);
          return;
        }
        if (!res.ok) throw new Error("GitHub API error");
        const data: GithubUser[] = await res.json();
        setUsers(data);
        // Fetch details for each user for filtering
        const details: Record<string, { public_repos: number; followers: number; stars: number; location: string; type: string }> = {};
        await Promise.all(
          data.map(async (user) => {
            try {
              const res = await fetch(`https://api.github.com/users/${user.login}`, pat ? { headers: { Authorization: `token ${pat}` } } : undefined);
              if (!res.ok) return;
              const d = await res.json();
              // Fetch repos for stars
              let stars = 0;
              try {
                const repoRes = await fetch(`https://api.github.com/users/${user.login}/repos?per_page=100`, pat ? { headers: { Authorization: `token ${pat}` } } : undefined);
                if (repoRes.ok) {
                  const repos = await repoRes.json();
                  stars = Array.isArray(repos) ? repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0) : 0;
                }
              } catch { }
              details[user.login] = {
                public_repos: d.public_repos,
                followers: d.followers,
                stars,
                location: d.location || "",
                type: d.type || "User",
              };
            } catch { }
          })
        );
        setUserDetails(details);
      } catch (e) {
        setError("Failed to load avatars. Try again.");
      } finally {
        setLoading(false);
        setTimeout(() => setIsShuffling(false), 300); // fade in after data loads
      }
    }, 200); // fade out before fetching
  };

  // Search for a user by username
  const searchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    setError("");
    try {
      const res = await fetch(`https://api.github.com/users/${search.trim()}`, pat ? { headers: { Authorization: `token ${pat}` } } : undefined);
      if (!res.ok) throw new Error("User not found");
      const user = await res.json();
      // Fetch stars for searched user
      let stars = 0;
      try {
        const repoRes = await fetch(`https://api.github.com/users/${user.login}/repos?per_page=100`, pat ? { headers: { Authorization: `token ${pat}` } } : undefined);
        if (repoRes.ok) {
          const repos = await repoRes.json();
          stars = Array.isArray(repos) ? repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0) : 0;
        }
      } catch { }
      setUsers([
        {
          login: user.login,
          id: user.id,
          avatar_url: user.avatar_url,
          html_url: user.html_url,
        },
      ]);
      setUserDetails({
        [user.login]: {
          public_repos: user.public_repos,
          followers: user.followers,
          stars,
          location: user.location || "",
          type: user.type || "User",
        },
      });
    } catch (e) {
      setError("User not found");
      setUsers([]);
      setUserDetails({
        '': { public_repos: 0, followers: 0, stars: 0, location: '', type: 'User' }
      });
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch user details for modal
  const openModal = async (user: GithubUser) => {
    setModalUser(null);
    try {
      const res = await fetch(`https://api.github.com/users/${user.login}`);
      if (!res.ok) throw new Error();
      const details = await res.json();
      setModalUser({ ...user, public_repos: details.public_repos });
    } catch {
      setModalUser({ ...user, public_repos: -1 });
    }
  };

  // Download avatar
  const downloadAvatar = async (url: string, username: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${username}-avatar.png`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Helper: format reset time
  const formatReset = (reset: number) => {
    const d = new Date(reset * 1000);
    return d.toLocaleTimeString();
  };

  // Filter users based on all filters
  const filteredUsers = users.filter((user) => {
    const details = userDetails[user.login];
    if (!details) return true; // If details not loaded, show user
    if (details.public_repos < minRepos) return false;
    if (details.followers < minFollowers) return false;
    if (details.stars < minStars) return false;
    if (location && !details.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (accountType && details.type !== accountType) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col items-center pt-24 pb-16 px-4">
      {/* Navbar */}
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
          <div className="flex gap-4 items-center justify-center">
            <a
              href="https://github.com/HarshYadav152/git-galary" // <-- Replace with your actual repo URL
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
              href="https://github.com/HarshYadav152/git-galary/fork" // <-- Replace with your actual repo URL
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Fork this repo"
              className="hover:scale-125 transition-transform"
            >
              <svg aria-hidden="true" height="24" viewBox="0 0 16 16" width="24" fill="#A3A3A3" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
              </svg>
            </a>
            <a
              href="https://github.com/HarshYadav152/git-galary/issues" // <-- Replace with your actual repo URL
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Issue"
              className="hover:scale-125 transition-transform"
            >
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" className="octicon octicon-issue-opened UnderlineNav-octicon d-none d-sm-inline invert">
                <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
              </svg>
            </a>
          </div>
        </div>
      </nav>
      <div className="w-full max-w-5xl futuristic-glass p-8 mb-8">
        <h1 className="text-4xl font-extrabold mb-2 futuristic-accent tracking-tight drop-shadow">Random GitHub Galary</h1>
        <p className="mb-4 text-lg futuristic-accent2">Discover random GitHub users. Click an avatar for details. Shuffle for more!</p>
      </div>
      {/* Search Bar */}
      <form onSubmit={searchUser} className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 w-full max-w-5xl futuristic-glass p-4">
        <input
          type="text"
          placeholder="Search by username..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition disabled:opacity-50 w-full sm:w-auto"
            disabled={searching || !search.trim()}
          >
            {searching ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 w-full sm:w-auto"
            onClick={() => { setSearch(""); fetchUsers(); }}
            disabled={loading || searching}
          >
            Clear
          </button>
        </div>
      </form>
      {/* Filter UI */}
      <div className="flex flex-wrap gap-4 mb-4 w-full max-w-5xl items-end futuristic-glass p-4">
        <div className="flex flex-col">
          <label htmlFor="minRepos" className="text-sm text-gray-700 dark:text-gray-200 mb-1">Min public repos</label>
          <input
            id="minRepos"
            type="number"
            min={0}
            value={minRepos}
            onChange={e => setMinRepos(Number(e.target.value))}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 w-28"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="minFollowers" className="text-sm text-gray-700 dark:text-gray-200 mb-1">Min followers</label>
          <input
            id="minFollowers"
            type="number"
            min={0}
            value={minFollowers}
            onChange={e => setMinFollowers(Number(e.target.value))}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 w-28"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="minStars" className="text-sm text-gray-700 dark:text-gray-200 mb-1">Min total stars</label>
          <input
            id="minStars"
            type="number"
            min={0}
            value={minStars}
            onChange={e => setMinStars(Number(e.target.value))}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 w-28"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="location" className="text-sm text-gray-700 dark:text-gray-200 mb-1">Location contains</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 w-36"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="accountType" className="text-sm text-gray-700 dark:text-gray-200 mb-1">Account type</label>
          <select
            id="accountType"
            value={accountType}
            onChange={e => setAccountType(e.target.value)}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 w-32"
          >
            <option value="">Any</option>
            <option value="User">User</option>
            <option value="Organization">Organization</option>
          </select>
        </div>
        <div className="text-xs text-red-500 font-medium ml-2 mb-1">(Stars filter may be slow and use more API calls)</div>
      </div>
      {/* Rate limit status */}
      {rateLimit && (
        <div className="mb-4 text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <span>API Rate Limit:</span>
          <span className={rateLimit.remaining === 0 ? "text-red-500 font-bold" : "text-green-600 font-semibold"}>
            {rateLimit.remaining} / {rateLimit.limit}
          </span>
          {rateLimit.remaining === 0 && (
            <span>(Resets at {formatReset(rateLimit.reset)})</span>
          )}
        </div>
      )}
      <button
        onClick={fetchUsers}
        className="mb-8 px-6 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50"
        disabled={loading || (!!rateLimit && rateLimit.remaining === 0)}
      >
        {loading ? "Loading..." : "Shuffle"}
      </button>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 w-full max-w-5xl transition-opacity duration-300 ${isShuffling ? 'opacity-0' : 'opacity-100'}`}
      >
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="futuristic-glass cursor-pointer flex flex-col items-center p-4 group hover:scale-105 transition-transform duration-300"
            onClick={() => openModal(user)}
          >
            <Image
              src={user.avatar_url}
              alt={user.login}
              width={80}
              height={80}
              className="rounded-full border-4 border-accent group-hover:border-accent2 mb-2 shadow-lg"
            />
            <span className="font-semibold futuristic-accent2 text-sm truncate w-20 text-center drop-shadow">{user.login}</span>
            <button
              className="mt-2 text-xs futuristic-accent hover:underline" style={{ padding: "0px 5px" }}
              onClick={e => { e.stopPropagation(); downloadAvatar(user.avatar_url, user.login); }}
            >
              Download
            </button>
          </div>
        ))}
      </div>
      {/* Developer Section (moved below cards) */}
      <div className="w-full max-w-5xl futuristic-glass p-6 mb-8 mt-8">
        <h2 className="text-xl font-bold futuristic-accent mb-2">Developer</h2>
        <p className="mb-3 text-sm text-foreground/80">If you are a developer and want to increase your GitHub API rate limit (from 60 to 5,000 requests/hour), you can use your own GitHub Personal Access Token (PAT). <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline futuristic-accent2">Generate a token here</a> (no scopes needed). Your token is only stored in your browser and used for API requests.</p>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <input
            type="password"
            placeholder="Paste your GitHub PAT here..."
            value={patInput}
            onChange={e => { setPatInput(e.target.value); setPatSaved(false); }}
            className="flex-1 px-3 py-2 rounded border border-accent2 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-accent2"
            style={{ minWidth: 0 }}
          />
          <button
            className="px-4 py-2 rounded futuristic-accent2 font-semibold shadow hover:bg-accent2 hover:text-background transition w-full sm:w-auto"
            onClick={savePat}
            disabled={!patInput.trim()}
          >Save</button>
          <button
            className="px-4 py-2 rounded bg-gray-700 text-foreground font-semibold shadow hover:bg-gray-600 transition w-full sm:w-auto"
            onClick={clearPat}
            disabled={!patSaved}
          >Clear</button>
        </div>
        {patSaved && <div className="mt-2 text-xs text-green-400">Token saved! Your requests now use your PAT.</div>}
      </div>
      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="futuristic-glass p-8 max-w-md w-full relative text-center">
            <h2 className="text-2xl font-bold mb-4 futuristic-accent">Terms & Conditions</h2>
            <p className="mb-4 text-foreground/80 text-sm">
              By using this app, you agree to the following:
              <ul className="list-disc list-inside text-left mt-2 mb-2">
                <li>This app uses the public GitHub API and is not affiliated with GitHub.</li>
                <li>All data is fetched live from GitHub and subject to their <a href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service" target="_blank" rel="noopener noreferrer" className="underline futuristic-accent2">Terms of Service</a>.</li>
                <li>Do not abuse the API or use this app for automated scraping or commercial purposes.</li>
                <li>Your GitHub Personal Access Token (if provided) is only stored in your browser and never sent anywhere else.</li>
                <li>For more info, see the <a href="#docs" className="underline futuristic-accent2">Docs</a> page.</li>
              </ul>
            </p>
            <button
              className="mt-4 px-6 py-2 rounded futuristic-accent2 font-semibold shadow hover:bg-accent2 hover:text-background transition"
              onClick={acceptTerms}
            >I Accept</button>
          </div>
        </div>
      )}
      
      {/* Modal */}
      {modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModalUser(null)}>
          <div className="futuristic-glass shadow-2xl p-8 w-80 relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-accent2 hover:text-accent font-bold text-2xl" onClick={() => setModalUser(null)}>&times;</button>
            <Image
              src={modalUser.avatar_url}
              alt={modalUser.login}
              width={100}
              height={100}
              className="rounded-full mx-auto border-4 border-accent2 mb-4 shadow-xl"
            />
            <h2 className="text-2xl font-extrabold text-center mb-2 futuristic-accent2 drop-shadow">{modalUser.login}</h2>
            <a
              href={modalUser.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center futuristic-accent hover:underline mb-2"
            >
              View GitHub Profile
            </a>
            <div className="text-center text-foreground mb-2">
              Public Repos: {modalUser.public_repos === -1 ? "?" : modalUser.public_repos}
            </div>
            <button
              className="w-full mt-2 px-4 py-2 rounded futuristic-accent2 font-semibold shadow hover:bg-accent2 hover:text-background transition"
              onClick={() => downloadAvatar(modalUser.avatar_url, modalUser.login)}
            >
              Download Avatar
            </button>
          </div>
        </div>
      )}
      {/* Footer */}
      <footer className="w-full flex justify-center mt-12">
        <div className="w-full max-w-5xl futuristic-glass p-6 text-center text-sm text-foreground">
          <div className="mb-2">think by <span className="futuristic-accent font-bold"><a href="https://github.com/HarshYadav152" target="_blank" rel="noopener noreferrer" >Harsh Yadav</a></span> — designed & implemented with <span className="futuristic-accent2 font-bold"><a href="https://cursor.com/" target="_blank" rel="noopener noreferrer" >Cursor</a></span></div>
          <div className="mb-2">Tech used:
            <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer" className="futuristic-accent hover:text-accent2 mx-1">Next.js</a>,
            <a href="https://react.dev/" target="_blank" rel="noopener noreferrer" className="futuristic-accent hover:text-accent2 mx-1">React</a>,
            <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer" className="futuristic-accent hover:text-accent2 mx-1">Tailwind CSS</a>,
            <a href="https://docs.github.com/en/rest" target="_blank" rel="noopener noreferrer" className="futuristic-accent hover:text-accent2 mx-1">GitHub API</a>
          </div>
          <div className="opacity-60">© {new Date().getFullYear()} GitHub Galary. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
