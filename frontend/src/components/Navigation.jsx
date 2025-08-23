import React from "react";
import {
    DarkThemeToggle,
    Button,
    Navbar,
    NavbarBrand,
    NavbarCollapse,
    NavbarLink,
    NavbarToggle,
    useThemeMode,
} from "flowbite-react";
import { NavLink } from "react-router";

import logo from "../assets/logo.svg";
import logodark from "../assets/logo-dark.svg";

const Navigation = () => {
    const { mode } = useThemeMode();

    return (
        <Navbar
            fluid
            className="fixed left-1/2 top-3 transform -translate-x-1/2 w-10/12 bg-white dark:bg-[#003049] rounded-full z-50"
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
            <NavbarCollapse>
                <NavbarLink
                    as={NavLink}
                    to="/"
                    end
                    className={({ isActive }) =>
                        `text-xl ${isActive ? "text-blue-600 dark:text-yellow-300 font-semibold" : ""}`
                    }
                >
                    Home
                </NavbarLink>
                <NavbarLink
                    as={NavLink}
                    to="/about"
                    className={({ isActive }) =>
                        `text-xl ${isActive ? "text-blue-600 dark:text-yellow-300 font-semibold" : ""}`
                    }
                >
                    About
                </NavbarLink>
                <NavbarLink
                    as={NavLink}
                    to="/complaints"
                    className={({ isActive }) =>
                        `text-xl ${isActive ? "text-blue-600 dark:text-yellow-300 font-semibold" : ""}`
                    }
                >
                    Complaints
                </NavbarLink>
                <NavbarLink
                    as={NavLink}
                    to="/contact"
                    className={({ isActive }) =>
                        `text-xl ${isActive ? "text-blue-600 dark:text-yellow-300 font-semibold" : ""}`
                    }
                >
                    Contact
                </NavbarLink>
            </NavbarCollapse>
        </Navbar>
    );
};

export default Navigation;
