import { BrowserRouter as Router, Routes, Route } from "react-router";
import Navigation from "./components/Navigation";
import { ThemeProvider,createTheme } from "flowbite-react";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Complaints from "./pages/Complaints";
import Contact from "./pages/Contact";
import Signup from "./pages/Signup";

export default function App() {

  const customTheme = createTheme({
    navbar: {
      root: {
        base: "bg-white border-gray-200 px-2 py-2.5 dark:bg-gray-800 dark:border-gray-700 shadow-lg",
        rounded: {
          on: "rounded-lg",
          off: ""
        },
        bordered: {
          on: "border",
          off: ""
        },
        inner: {
          base: "mx-auto flex flex-wrap items-center justify-between",
          fluid: {
            on: "",
            off: "container"
          }
        }
      },
      brand: {
        base: "flex items-center"
      },
      collapse: {
        base: "w-full md:block md:w-auto",
        list: "mt-4 flex flex-col p-4 md:mt-0 md:flex-row md:space-x-8 md:p-0 md:text-sm md:font-medium",
        hidden: {
          on: "hidden",
          off: ""
        }
      },
      link: {
        base: "block py-2 pr-4 pl-3 md:p-0",
        active: {
          on: "bg-blue-700 text-white dark:text-white md:bg-transparent md:text-blue-700 md:dark:text-blue-500",
          off: "border-b border-gray-100 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:border-0 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:bg-transparent md:dark:hover:text-blue-500"
        },
        disabled: {
          on: "text-gray-400 hover:cursor-not-allowed dark:text-gray-600",
          off: ""
        }
      },
      toggle: {
        base: "inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600",
        icon: "w-6 h-6"
      }
    },
    button: {
      color: {
        primary: "rounded-full text-white bg-[#fd6500]  enabled:hover:bg-[#c14d00]  dark:bg-[#fd6500] dark:hover:bg-[#fd6500] ",
        secondary: "text-gray-900 bg-white border border-gray-300 enabled:hover:bg-gray-100 focus:ring-4 focus:ring-blue-300 disabled:hover:bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:enabled:hover:bg-gray-700 dark:focus:ring-gray-700 dark:disabled:hover:bg-gray-800",
        success: "text-white bg-green-600 border border-transparent enabled:hover:bg-green-700 focus:ring-4 focus:ring-green-300 disabled:hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 dark:disabled:hover:bg-green-600",
        danger: "text-white bg-red-600 border border-transparent enabled:hover:bg-red-700 focus:ring-4 focus:ring-red-300 disabled:hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900 dark:disabled:hover:bg-red-600"
      }
    }
  });

  return (
    <>
      <ThemeProvider theme={customTheme} defaultTheme="system" enableSystem>
        <Router>
          {/* Navbar always visible */}
          <Navigation />

          {/* Declarative routing */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </>
  );
}

