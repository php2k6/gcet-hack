import React from 'react'
// import Glance from './Glance';
// Import your custom icons from assets
import Drainage from "../assets/icons/drainage.png";
import trashBinIcon from "../assets/icons/trash-bin.png";
import electricity from "../assets/icons/electric.png";
import pothole from "../assets/icons/pothole.png";
import underline from "../assets/underline.svg";
import GlanceScroll from './GlanceScroll';

const Hero = () => {
    return (
        <div className="min-h-screen overflow-hidden dark:bg-slate-800">
            {/* Main Content */}
            <section className="relative">
                {/* Background Image with Icons */}
                <div className="absolute z-10 lg:-right-44 w-5/6 lg:top-0">
                    <div className="relative w-full h-full">
                        {/* Main background image */}
                        <img
                            src="./india bg upscale.jpg"
                            alt="Map background"
                            className="w-full h-full object-cover opacity-70"
                        />

                        {/* Floating Icons - only visible on large screens */}
                        <div className="hidden lg:block absolute inset-0">
                            {/* Street light icons */}
                            <div className="absolute w-12 h-12 left-64 top-50 floating-icon" style={{ animationDelay: '0s' }}>
                                <img
                                    src={Drainage}
                                    alt="Street light"
                                    className="w-full h-full object-contain drop-shadow-lg"
                                />
                            </div>
                            <div className="absolute w-12 h-12 left-72 top-96 floating-icon" style={{ animationDelay: '1s' }}>
                                <img
                                    src={Drainage}
                                    alt="Street light"
                                    className="w-full h-full object-contain drop-shadow-lg"
                                />
                            </div>
                            <div className="absolute w-12 h-12 right-32 top-64 floating-icon" style={{ animationDelay: '2s' }}>
                                <img
                                    src={Drainage}
                                    alt="Street light"
                                    className="w-full h-full object-contain drop-shadow-lg"
                                />
                            </div>

                            {/* Trash bin icons */}
                            <div className="absolute w-14 h-14 right-16 bottom-32 floating-icon" style={{ animationDelay: '0.5s' }}>
                                <img
                                    src={trashBinIcon}
                                    alt="Trash bin"
                                    className="w-full h-full object-contain drop-shadow-lg"
                                />
                            </div>
                            <div className="absolute w-14 h-14 left-80 bottom-16 floating-icon" style={{ animationDelay: '1.5s' }}>
                                <img
                                    src={trashBinIcon}
                                    alt="Trash bin"
                                    className="w-full h-full object-contain drop-shadow-lg"
                                />
                            </div>

                            {/* Electric icons */}
                            <div className="absolute w-16 h-16 left-48 bottom-8 floating-icon" style={{ animationDelay: '2.5s' }}>
                                <img
                                    src={electricity}
                                    alt="Electric issue"
                                    className="w-full h-full object-contain drop-shadow-lg"
                                />
                            </div>
                            <div className="absolute w-16 h-16 right-48 top-32 floating-icon" style={{ animationDelay: '3s' }}>
                                <img
                                    src={electricity}
                                    alt="Electric issue"
                                    className="w-full h-full object-contain drop-shadow-lg"
                                />
                            </div>

                            {/* Warning signs */}
                            <div className="absolute w-14 h-14 left-4 bottom-48 floating-icon" style={{ animationDelay: '0.8s' }}>
                                <img
                                    src={pothole}
                                    alt="Warning sign"
                                    className="w-full h-full object-contain drop-shadow-lg"
                                />
                            </div>
                            <div className="absolute w-14 h-14 right-64 top-96 floating-icon" style={{ animationDelay: '1.8s' }}>
                                <img
                                    src={pothole}
                                    alt="Warning sign"
                                    className="w-full h-full object-contain drop-shadow-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 px-4 sm:px-6 lg:px-16 xl:px-20 pt-12 sm:pt-16 lg:pt-24 pb-16">
                    <div className="max-w-2xl lg:max-w-3xl">
                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight mb-6 lg:mb-8 font-serif">
                            <span className="text-gray-900 dark:text-white">Your</span>{" "}
                            <span className="text-orange-500">Voice</span>
                            <span className="text-gray-900 dark:text-white">,</span>
                            <br />
                            <span className="text-gray-900 dark:text-white">Our</span>{" "}
                            <span className="text-orange-500">Action</span>
                        </h1>

                        {/* Decorative underline (desktop only) */}
                        <div className="hidden lg:block relative mb-6 lg:mb-8">
                            {/* import svg from assets */}
                            <img src={underline} alt="" className="absolute inset-0 w-full h-full object-contain" />
                        </div>

                        {/* Subtitle */}
                        <p className="text-gray-900 dark:text-white text-lg sm:text-xl lg:text-2xl xl:text-3xl mb-8 lg:mb-12 max-w-xl lg:max-w-2xl leading-relaxed font-sans">
                            Report civic issues in your community & track real solutions.
                        </p>

                        {/* CTA Button */}
                        <a
                            href="/report"
                            className="inline-flex items-center gap-3 lg:gap-4 bg-orange-500 hover:bg-orange-600 text-blue-900 font-bold text-lg sm:text-xl lg:text-2xl px-6 sm:px-8 lg:px-10 py-3 lg:py-4 rounded-full transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            Report a Problem
                            <svg
                                className="w-6 lg:w-8 h-3 lg:h-4 group-hover:translate-x-1 transition-transform duration-300"
                                viewBox="0 0 55 27"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M54.0544 14.4499C54.733 13.7597 54.7236 12.65 54.0334 11.9714L42.7856 0.913079C42.0954 0.234483 40.9858 0.243906 40.3072 0.934125C39.6286 1.62434 39.638 2.73399 40.3282 3.41259L50.3262 13.2422L40.4966 23.2403C39.818 23.9305 39.8274 25.0401 40.5176 25.7187C41.2078 26.3973 42.3175 26.3879 42.9961 25.6977L54.0544 14.4499ZM0.651367 13.6641L0.666249 15.4166L52.8196 14.9737L52.8047 13.2212L52.7898 11.4687L0.636485 11.9115L0.651367 13.6641Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </a>
                    </div>
                </div>
                <GlanceScroll />

            </section>
            {/* CSS for floating animation */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { 
                        transform: translateY(0px); 
                    }
                    50% { 
                        transform: translateY(-15px); 
                    }
                }
                
                .floating-icon {
                    animation: float 4s ease-in-out infinite;
                }
                
                /* Add hover effect to icons */
                .floating-icon:hover {
                    animation-play-state: paused;
                    transform: scale(1.1) !important;
                    transition: transform 0.3s ease;
                }
            `}</style>
        </div>
    )
}

export default Hero