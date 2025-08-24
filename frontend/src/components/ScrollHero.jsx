import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import indiaMap from "../assets/india bg upscale.jpg";
import Glance from "./Glance";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
    const sectionRef = useRef(null);
    const indiaRef = useRef(null);
    const gujaratRef = useRef(null);
    const titleRef = useRef(null);
    const secondTitleRef = useRef(null);
    const scrollHintRef = useRef(null);
    const fixedBgRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial title animation on page load (after 2sec delay)
            gsap.fromTo(
                titleRef.current,
                { 
                    opacity: 0, 
                    y: 50, 
                    scale: 0.9 
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    ease: "back.out(1.7)",
                    duration: 1,
                    delay: 2 // 2 second delay on page load
                }
            );

            // Scroll hint bounce animation
            gsap.fromTo(scrollHintRef.current, {
                opacity: 0,
                y: 20,
            }, {
                opacity: 1,
                y: 0,
                duration: 1,
                delay: 3, // Appear after title
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut"
            });

            // Master timeline for India zoom
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "bottom center",
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        // Show fixed background when animation completes
                        if (self.progress > 0.9) {
                            gsap.set(fixedBgRef.current, { opacity: 1 });
                        }
                    }
                },
            });

            // Phase 1: Zoom into Gujarat
            tl.to(indiaRef.current, {
                scale: 5,
                xPercent: 160,
                yPercent: 0,
                ease: "power2.inOut",
                duration: 1,
            });

            // Phase 2: Fade out first title at 70% of timeline
            tl.to(titleRef.current, {
                opacity: 0,
                y: -50,
                scale: 0.9,
                duration: 0.3,
                ease: "power2.in"
            }, 0.7); // At 70% of timeline

            // Phase 3: Fade in second title at 70% on left side
            tl.fromTo(secondTitleRef.current, {
                opacity: 0,
                x: -100,
                scale: 0.8
            }, {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 0.3,
                ease: "back.out(1.7)"
            }, 0.7); // At 70% of timeline

            // Fade out scroll hint when zoom starts
            tl.to(scrollHintRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                ease: "power2.out"
            }, 0.2);
            // at animation end from to india fixed bg opacity 0 to 1
            tl.to(fixedBgRef.current, {
                opacity: 1,
                duration: 0.3,
                ease: "power2.inOut"
            }, 0.9);

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <>
            {/* Hero Section with Animation */}
            <section 
                ref={sectionRef}
                className="relative h-[300vh] dark:bg-[#001219] overflow-hidden"
            >
                {/* Sticky map container */}
                <div className="sticky top-0 flex items-center justify-center h-screen overflow-hidden">
                    {/* India Map */}
                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                        <img
                            ref={indiaRef}
                            src={indiaMap}
                            alt="India Map"
                            className="w-[60%] h-auto object-contain will-change-transform"
                            style={{ transformOrigin: "center center" }}
                        />
                    </div>

                    {/* First Title - Center */}
                    <div
                        ref={titleRef}
                        className="absolute inset-0 flex flex-col items-center justify-center opacity-0 z-20"
                    >
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary dark:text-yellow-300 text-center drop-shadow-lg">
                            CitiSevak Gujarat
                        </h1>
                        <p className="mt-4 text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 text-center max-w-2xl drop-shadow-md">
                            Transparent · Accountable · People-Centric
                        </p>
                    </div>

                    {/* Second Title - Left Side (appears at 70%) */}
                    <div
                        ref={secondTitleRef}
                        className="absolute left-8 md:left-16 top-1/2 transform -translate-y-1/2 opacity-0 z-20"
                    >
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-orange-500 drop-shadow-lg mb-4">
                            Gujarat
                        </h2>
                        <h3 className="text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-200 drop-shadow-md mb-2">
                            Your State,
                        </h3>
                        <h3 className="text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-200 drop-shadow-md">
                            Your Voice
                        </h3>
                        <div className="mt-6 w-20 h-1 bg-orange-500 rounded"></div>
                    </div>

                    {/* Scroll Hint */}
                    <div
                        ref={scrollHintRef}
                        className="absolute bottom-10 w-full text-center text-gray-500 dark:text-gray-400 text-lg z-20"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <span>Scroll to Explore</span>
                            <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-500 rounded-full flex justify-center">
                                <div className="w-1 h-3 bg-orange-500 rounded-full animate-bounce mt-2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Fixed Background - Stays in place after animation */}
            <div 
            ref={fixedBgRef}
                className="fixed inset-0 -z-10 flex items-center justify-center dark:bg-[#001219] opacity-0"
                style={{ 
                        opacity: 0,
                        transform: 'scale(5) translateX(32%) ',
                        transformOrigin: "center center"
                    }}
                >
                <img
                    src={indiaMap}
                    alt="India Map Background"
                    className="w-[60%] h-auto object-contain"
                    
                />
            </div>
            
            <Glance/>
        </>
    );
}