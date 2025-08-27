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
            { y: 0, duration: 1.1, ease: "power3.out" }
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
                
            }

        );
    }, []);

    return (
        <Navbar
            ref={navbarRef}
            fluid
            className="rounded-full fixed left-1/2 top-3 transform -translate-x-1/2 w-10/12 bg-white dark:bg-[#003049] md:rounded-full z-50  overflow-visible"
        >
            <NavbarBrand as={NavLink} to="/">
                <img
                    src={mode === "dark" ? logodark : logo}
                    className="mr-3 h-5 sm:h-7"
                    alt="Citi Sevak"
                />
            </NavbarBrand>

            {/* Right side */}
            <div className="flex md:order-2 items-center space-x-2">
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
                            `nav-link relative text-xl dark:text-white block py-2 pr-4 pl-3 transition-all duration-300 ${
                                isActive
                                    ? "active text-blue-600 dark:text-yellow-300 font-semibold"
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
                    className="absolute bottom-0 h-[3px] bg-blue-500 dark:bg-yellow-300 rounded-full transition-all"
                    style={{ left: 0, width: 0 }}
                />
            </NavbarCollapse>
        </Navbar>
    );
};

export default Navigation;
