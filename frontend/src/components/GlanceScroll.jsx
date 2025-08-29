import React, { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AboutUs from './AboutUs';
const GlanceScroll = () => {
    const component = useRef();
    const slider = useRef();
    const numbersRef = useRef([]);
    const [currentCard, setCurrentCard] = useState(0);

    gsap.registerPlugin(ScrollTrigger);

    const cards = [
        {
            id: 1,
            icon: "🕳️",
            number: 700,
            suffix: "+",
            title: "Potholes Fixed",
            description: "Roads made safer for everyone",
            bgGradient: "from-blue-600 to-blue-800",
            accentColor: "blue",
            img: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=600&fit=crop",
            stats: [
                { label: "Average Response Time", value: "24 hours", icon: "⏱️" },
                { label: "Citizens Helped", value: "15,000+", icon: "👥" },
                { label: "Areas Covered", value: "50+ zones", icon: "📍" }
            ],
            impact: "Reducing vehicle damage and improving road safety across the city"
        },
        {
            id: 2,
            icon: "♻️",
            number: 50,
            suffix: "+",
            title: "Tonnes Waste Cleaned",
            description: "Communities made cleaner and healthier",
            bgGradient: "from-green-600 to-green-800",
            accentColor: "green",
            img: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop",
            stats: [
                { label: "Collection Points", value: "200+", icon: "🗂️" },
                { label: "Recycling Rate", value: "85%", icon: "♻️" },
                { label: "Communities Served", value: "30+", icon: "🏘️" }
            ],
            impact: "Creating cleaner neighborhoods and promoting sustainable waste management"
        },
        {
            id: 3,
            icon: "🌊",
            number: 1200,
            suffix: "+",
            title: "Drainages Fixed",
            description: "Flood prevention and water management improved",
            bgGradient: "from-cyan-600 to-cyan-800",
            accentColor: "cyan",
            img: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop",
            stats: [
                { label: "Flood Incidents Reduced", value: "70%", icon: "📉" },
                { label: "Water Flow Improved", value: "90%", icon: "💧" },
                { label: "Monsoon Ready Areas", value: "40+", icon: "🌧️" }
            ],
            impact: "Protecting homes and businesses from flood damage during heavy rains"
        },
        {
            id: 4,
            icon: "⚡",
            number: 2000,
            suffix: "+",
            title: "Power Outages Resolved",
            description: "Reliable electricity restored faster",
            bgGradient: "from-yellow-500 to-orange-600",
            accentColor: "yellow",
            img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop",
            stats: [
                { label: "Response Time", value: "2 hrs avg", icon: "⚡" },
                { label: "Uptime Improved", value: "95%", icon: "📊" },
                { label: "Households Connected", value: "25,000+", icon: "🏠" }
            ],
            impact: "Ensuring consistent power supply for homes, schools, and businesses"
        }
    ];

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            let panels = gsap.utils.toArray(".panel");

            if (panels.length === 0) return;

            // Create the horizontal scroll animation
            gsap.to(panels, {
                xPercent: -100 * (panels.length - 1),
                ease: "none",
                scrollTrigger: {
                    trigger: slider.current,
                    pin: true,
                    scrub: 1,
                    start: "top top",
                    end: () => "+=" + (slider.current.offsetWidth * 2), // Increased duration
                    anticipatePin: 1, // Helps with smoother pinning
                    refreshPriority: -1, // Ensures proper refresh order
                    onUpdate: (self) => {
                        const progress = self.progress;
                        // const newCurrentCard = Math.round(progress * (panels.length - 1));

                        // if (newCurrentCard !== currentCard) {
                        //     setCurrentCard(newCurrentCard);

                        //     // Animate the number for the current card
                        //     if (numbersRef.current[newCurrentCard]) {
                        //         gsap.fromTo(numbersRef.current[newCurrentCard], {
                        //             textContent: 0
                        //         }, {
                        //             textContent: cards[newCurrentCard].number,
                        //             duration: 1.5,
                        //             ease: "power2.out",
                        //             snap: { textContent: 1 }
                        //         });
                        //     }
                        // }
                    }
                }
            });
        }, component);

        return () => ctx.revert();
    }, [currentCard]);

    return (
        <div className="w-full" ref={component}>
            <AboutUs/>

            {/* Horizontal scroll container */}
            <section ref={slider} className="flex overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800" style={{ willChange: 'transform' }}>
                {/* Header */}
                <div className="absolute top- left-0 right-0 z-20 bg-black/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between p-6">
                        <div>
                            <h2 className="text-3xl font-bold text-white">CitiSevak at a Glance</h2>
                            <p className="text-gray-300">Making communities better, one report at a time</p>
                        </div>

                        {/* Progress indicators */}
                        <div className="flex space-x-2">
                            {cards.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${currentCard === idx
                                            ? 'bg-white shadow-lg scale-125'
                                            : 'bg-white/40'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                {cards.map((card, index) => (
                    <div key={card.id} className="panel min-w-full h-screen flex items-center relative" style={{ willChange: 'transform' }}>


                        {/* Content */}
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 h-full items-center px-8 pt-24 pb-8">
                            {/* Left side - Image */}
                            <div className="relative h-full max-h-[500px] min-h-[400px]">
                                <div className="relative h-full rounded-3xl overflow-hidden shadow-2xl">
                                    <img
                                        src={card.img}
                                        alt={card.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${card.bgGradient} opacity-30`} />

                                    {/* Floating icon */}
                                    <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-full p-4">
                                        <span className="text-4xl">{card.icon}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Stats */}
                            <div className="text-white space-y-8">
                                {/* Main number */}
                                <div className="text-center lg:text-left">
                                    <div className="flex items-baseline justify-center lg:justify-start gap-2">
                                        <span
                                            ref={el => numbersRef.current[index] = el}
                                            className="text-8xl lg:text-9xl font-black text-white"
                                        >
                                            {card.number}
                                        </span>
                                        <span className="text-5xl font-bold text-white/80">{card.suffix}</span>
                                    </div>
                                    <h3 className="text-3xl lg:text-4xl font-bold mb-2">{card.title}</h3>
                                    <p className="text-xl text-gray-300 mb-6">{card.description}</p>
                                </div>

                                {/* Stats grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {card.stats.map((stat, statIndex) => (
                                        <div key={statIndex} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                                            <div className="text-2xl mb-2">{stat.icon}</div>
                                            <div className="text-2xl font-bold mb-1">{stat.value}</div>
                                            <div className="text-sm text-gray-300">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Impact statement */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                    <h4 className="font-semibold mb-2 text-lg">Community Impact</h4>
                                    <p className="text-gray-300 italic">"{card.impact}"</p>
                                </div>

                                {/* CTA */}
                                <div className="text-center lg:text-left">
                                    <button className="bg-white text-gray-900 font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Scroll hint - only show on first panel */}
                        {index === 0 && (
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center text-white/60">
                                <p className="text-sm">Keep scrolling to explore each initiative</p>
                                <div className="w-12 h-6 border-2 border-white/40 rounded-full mt-2 mx-auto">
                                    <div className="w-2 h-2 bg-white/60 rounded-full mx-auto mt-1 animate-bounce"></div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </section>

            {/* After section */}
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to make a difference?</h2>
                    <p className="text-xl text-gray-600 mb-8">Join thousands of citizens making their communities better</p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GlanceScroll;