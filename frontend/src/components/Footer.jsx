import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.svg";       // swap if you have a dark logo too
import { useLocation } from "react-router-dom";
const links = [
    { to: "/", txt: "Home" },
    { to: "/heatmap", txt: "Heatmapp" },
    { to: "/complaints", txt: "Complaints" },
    { to: "/about", txt: "About" },
    { to: "/contact", txt: "Contact" },
];

const cats = [
    { to: "/complaints?type=roads", txt: "Roads & Potholes" },
    { to: "/complaints?type=power", txt: "Power" },
    { to: "/complaints?type=water", txt: "Water" },
    { to: "/complaints?type=clean", txt: "Cleanliness" },
];

export default function Footer() {
    const yr = new Date().getFullYear();

    // use location if heatmap then dont render
    const location = useLocation();
    const isHeatmap = location.pathname === "/heatmap";

    return (
        
            <footer className="mt-16 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#031a2b] text-gray-700 dark:text-gray-200">
                {/* top */}
                <div className="mx-auto w-11/12 max-w-7xl py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
                    {/* brand */}
                    <div className="lg:col-span-2">
                    <NavLink to="/" className="inline-flex items-center gap-2">
                        <img src={logo} alt="CitiSevak" className="h-7" />
                        
                    </NavLink>
                    <p className="mt-4 text-sm leading-6">
                        AI-powered grievance platform for Gujarat—transparent, accountable,
                        people-centric. Report issues with media & live location, track
                        progress, and upvote community needs.
                    </p>

                    {/* newsletter (simple) */}
                    <form
                        className="mt-5 flex items-center gap-2"
                        onSubmit={(e) => e.preventDefault()}
                    >
                        <input
                            type="email"
                            placeholder="Email for updates"
                            className="w-full max-w-xs rounded-full border border-gray-300 dark:border-white/20 bg-white/90 dark:bg-white/5 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            className="rounded-full px-4 py-2 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition"
                            type="submit"
                        >
                            Join
                        </button>
                    </form>

                    {/* social */}
                    <div className="mt-4 flex items-center gap-4">
                        <a href="https://twitter.com" aria-label="X/Twitter" className="hover:opacity-80">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.7 7.3c.01.18.01.36.01.54 0 5.5-4.2 11.8-11.8 11.8-2.35 0-4.54-.69-6.38-1.87.33.04.66.06 1 .06 1.95 0 3.75-.66 5.18-1.77a4.16 4.16 0 0 1-3.88-2.88c.26.05.53.08.81.08.39 0 .77-.05 1.13-.15A4.15 4.15 0 0 1 3.6 9.8v-.05c.56.31 1.2.5 1.88.52A4.15 4.15 0 0 1 3.9 6.3c0-.77.21-1.49.58-2.1a11.8 11.8 0 0 0 8.55 4.33 4.69 4.69 0 0 1-.1-.95 4.15 4.15 0 0 1 7.18-2.84 8.2 8.2 0 0 0 2.64-1 4.17 4.17 0 0 1-1.82 2.29 8.21 8.21 0 0 0 2.38-.65 8.9 8.9 0 0 1-2.3 2.07z" /></svg>
                        </a>
                        <a href="https://github.com" aria-label="GitHub" className="hover:opacity-80">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.41-1.34-1.79-1.34-1.79-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.78.42-1.3.76-1.61-2.67-.31-5.48-1.34-5.48-5.96 0-1.32.47-2.39 1.23-3.24-.12-.31-.53-1.57.12-3.27 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.7.24 2.96.12 3.27.77.85 1.23 1.92 1.23 3.24 0 4.63-2.82 5.64-5.5 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.83.58A12 12 0 0 0 12 .5z" /></svg>
                        </a>
                        <a href="mailto:support@citisevak.in" className="text-sm underline hover:opacity-80">
                            support@citisevak.in
                        </a>
                    </div>
                </div>

                {/* quick links */}
                <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide mb-3">Quick Links</h4>
                    <ul className="space-y-2">
                        {links.map((l) => (
                            <li key={l.to}>
                                <NavLink
                                    to={l.to}
                                    className="hover:text-blue-600 dark:hover:text-yellow-300 transition"
                                >
                                    {l.txt}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* categories */}
                <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide mb-3">Categories</h4>
                    <ul className="space-y-2">
                        {cats.map((c) => (
                            <li key={c.to}>
                                <NavLink
                                    to={c.to}
                                    className="hover:text-blue-600 dark:hover:text-yellow-300 transition"
                                >
                                    {c.txt}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* legal */}
                <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide mb-3">Legal</h4>
                    <ul className="space-y-2">
                        <li><NavLink to="/terms" className="hover:text-blue-600 dark:hover:text-yellow-300 transition">Terms</NavLink></li>
                        <li><NavLink to="/privacy" className="hover:text-blue-600 dark:hover:text-yellow-300 transition">Privacy</NavLink></li>
                        <li><NavLink to="/disclaimer" className="hover:text-blue-600 dark:hover:text-yellow-300 transition">Disclaimer</NavLink></li>
                    </ul>
                </div>
            </div>

            {/* bottom */}
            <div className="border-t border-gray-200 dark:border-white/10">
                <div className="mx-auto w-11/12 max-w-7xl py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-sm">
                        © {yr} CitiSevak • Gujarat • Built for transparency & action
                    </p>

                    {/* mini badges (optional placeholder) */}
                    <div className="flex items-center gap-3 text-xs">
                        <span className="rounded-full px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                            FastAPI
                        </span>
                        <span className="rounded-full px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                            React
                        </span>
                        <span className="rounded-full px-3 py-1 bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-200">
                            PostgreSQL
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
