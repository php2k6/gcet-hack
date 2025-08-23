import React from 'react'
import { DarkThemeToggle,Button, Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle, useThemeMode } from "flowbite-react";
import logo from "../assets/logo.svg";
import  logodark from "../assets/logo-dark.svg"



const Navigation = () => {
    // Import useTheme from flowbite-react

    const { mode } = useThemeMode();

    console.log(mode);
    

    return (
        <Navbar fluid className='w-10/12 mx-auto bg-white dark:bg-[#003049] rounded-full mt-3'>
            <NavbarBrand href="/">
                <img
                    src={mode === "dark" ? logodark : logo}
                    className="mr-3 h-5 sm:h-7"
                    alt="Citi Sevak"
                />
            </NavbarBrand>
            <div className="flex md:order-2 items-center space-x-2">
                <Button className='primary-btn text-xl' color="primary">Signup</Button>
                <DarkThemeToggle />
                <NavbarToggle />
            </div>
            <NavbarCollapse >
                <NavbarLink href="#" active className='text-xl'>
                    Home
                </NavbarLink>
                <NavbarLink href="#" className='text-xl'>
                    About
                </NavbarLink>
                <NavbarLink href="#" className='text-xl'>
                    Complaints
                </NavbarLink>
                <NavbarLink href="#" className='text-xl'>
                    Contact
                </NavbarLink>
            </NavbarCollapse>
        </Navbar>
    )
}

export default Navigation