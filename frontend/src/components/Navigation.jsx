import React, { useEffect, useRef } from "react";
import {
  DarkThemeToggle,
  Button,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarToggle,
  useThemeMode,
} from "flowbite-react";
import { NavLink, useLocation } from "react-router-dom";
import { gsap } from "gsap";

import logo from "../assets/logo.svg";
import logodark from "../assets/logo-dark.svg";

const Navigation = () => {
  const { mode } = useThemeMode();
  const underlineRef = useRef(null);
  const linksRef = useRef([]);
  const navbarRef = useRef([]);
  const location = useLocation();

  var hasnoti = true;

  // Move underline when route changes
  useEffect(() => {
    const activeLink = document.querySelector(".nav-link.active");
    if (activeLink && underlineRef.current) {
      const { offsetLeft, offsetWidth } = activeLink;
      gsap.to(underlineRef.current, {
        left: offsetLeft,
        width: offsetWidth,
        duration: 0.4,
        ease: "power3.inout",
      });
    }
  }, [location]);
  // transition border radius of navbar on scroll from 0 to 500px
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight * 1;
      const progress = Math.min(scrollY / maxScroll, 1);
      const borderRadius = progress * 9999;
      if (navbarRef.current) {
        navbarRef.current.style.borderRadius = `${borderRadius}px`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Animate navbar links
  useEffect(() => {
    gsap.fromTo(
      navbarRef.current,
      { y: -100 },
      { y: 0, duration: 1.1, ease: "power3.out" },
    );
    gsap.fromTo(
      linksRef.current,
      { y: -30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.2,
      },
    );
  }, []);

  return (
    <Navbar
      ref={navbarRef}
      fluid
      className="fixed top-3 left-1/2 z-50 w-10/12 -translate-x-1/2 transform overflow-visible rounded-[4px] bg-white md:rounded-full dark:bg-[#003049]"
    >
      <NavbarBrand as={NavLink} to="/">
        <img
          src={mode === "dark" ? logodark : logo}
          className="mr-3 h-5 sm:h-7"
          alt="Citi Sevak"
        />
      </NavbarBrand>

      {/* Right side */}
      <div className="flex items-center space-x-2 md:order-2">
        <div className="group relative inline-block">
          <a href="/notification">
            <svg
              className="h-6 w-6 cursor-pointer text-gray-800 hover:text-orange-500 dark:text-white dark:hover:text-orange-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 21"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 3.464V1.1m0 2.365a5.338 5.338 0 0 1 5.133 5.368v1.8c0 2.386 1.867 2.982 1.867 4.175C15 15.4 15 16 14.462 16H1.538C1 16 1 15.4 1 14.807c0-1.193 1.867-1.789 1.867-4.175v-1.8A5.338 5.338 0 0 1 8 3.464ZM4.54 16a3.48 3.48 0 0 0 6.92 0H4.54Z"
              />
            </svg>
            {hasnoti && (
              <span className="absolute right-0 bottom-0 h-2 w-2 rounded-full border-2 border-white bg-red-500"></span>
            )}

            {hasnoti && (
              <span className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block dark:bg-white dark:text-black">
                Click to see the notifications
              </span>
            )}

            {!hasnoti && (
              <span className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block dark:bg-white dark:text-black">
                No new notification
              </span>
            )}
          </a>
        </div>
        <Button
          as={NavLink}
          to="/signup"
          className="primary-btn text-xl"
          color="primary"
        >
          Signup
        </Button>
        <DarkThemeToggle />
        <NavbarToggle />
      </div>

      {/* Collapsible Menu */}
      <NavbarCollapse className="relative">
        {[
          { to: "/", label: "Home" },
          { to: "/complaints", label: "Complaints" },
          { to: "/heatmap", label: "Heatmap" },
          { to: "/contact", label: "Contact" },
        ].map((item, i) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `nav-link relative block py-2 pr-4 pl-3 text-xl transition-all duration-300 hover:text-orange-500 dark:text-white ${
                isActive
                  ? "active font-semibold text-blue-600 dark:text-yellow-300"
                  : ""
              }`
            }
            ref={(el) => (linksRef.current[i] = el)}
          >
            {item.label}
          </NavLink>
        ))}

        {/* GSAP Underline */}
        <span
          ref={underlineRef}
          className="absolute bottom-0 h-[3px] rounded-full bg-blue-500 transition-all dark:bg-yellow-300"
          style={{ left: 0, width: 0 }}
        />
      </NavbarCollapse>
    </Navbar>
  );
};

export default Navigation;
