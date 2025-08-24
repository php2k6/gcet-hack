import React from 'react';

const Glance = () => {
    const cards = [
        {
            id: 1,
            icon: "🕳️",
            number: "700+",
            title: "Potholes fixed",
            description: "Roads made safer for everyone",
            bgColor: "bg-blue-50",
            img:"./pothole.jpg",
            borderColor: "border-blue-200"
        },
        {
            id: 2,
            icon: "♻️",
            number: "50+",
            title: "Tonnes waste Cleaned",
            description: "Communities made cleaner",
            bgColor: "bg-green-50",
            img:"./garbage.jpg",
            borderColor: "border-green-200"
        },
        {
            id: 3,
            icon: "🌊",
            number: "1200+",
            title: "Drainages fixed",
            description: "Flood prevention improved",
            bgColor: "bg-cyan-50",
            img:"./drainage.jpg",
            borderColor: "border-cyan-200"
        },
        {
            id: 4,
            icon: "⚡",
            number: "2000+",
            title: "Power Outage Resolved",
            description: "Electricity restored faster",
            bgColor: "bg-yellow-50",
            img:"./electricity.jpg",
            borderColor: "border-yellow-200"
        }
    ];

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 ">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        CitiSevak at a Glance
                    </h2>
                    <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {cards.map((card) => (
                        <div key={card.id}>
                            <div className="max-w-sm">
                                <div
                                    className={`flex flex-col ${card.bgColor} ${card.borderColor} border rounded-xl shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-2xl`}
                                >
                                    <img
                                        className="rounded-t-xl h-48 w-full object-cover"
                                        src={card.img}
                                        alt={card.title}
                                    />
                                    <div className="flex flex-col items-center p-6">
                                        <span className="text-4xl font-bold text-gray-900 mb-2">{card.number}</span>
                                        <h5 className="mb-2 text-lg font-bold tracking-tight text-gray-900">{card.title}</h5>
                                        <p className="mb-3 font-normal text-gray-600">{card.description}</p>
                                        <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-4"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-12">
                    <p className="text-lg text-gray-600 mb-6">
                        Making our communities better, one report at a time
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        Learn More
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Glance;