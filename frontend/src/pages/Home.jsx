import React from "react";
import { useEffect, useState } from "react";
import Glance from "../components/Glance";
import Hero from "../components/Hero";
import ScrollHero from "../components/ScrollHero"
import ChatWidget from "../components/ChatWidget";
import ComplaintCard from "../components/ComplaintCard";
import { Search, Filter, AlertCircle } from 'lucide-react';

const Home = () => {

    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    useEffect(() => {
        const mockComplaints = [

            {
                id: 'CMP002',
                title: 'Water Supply Disruption in Sector 15',
                description: 'No water supply for the past 3 days affecting over 200 households.',
                category: 'Water Supply',
                status: 'Open',
                priority: 'Critical',
                upvotes: 67,
                location: 'Sector 15, Vadodara',
                submittedDate: '2025-08-19',
                lastUpdated: '2025-08-21',
                department: 'Water Works',
                images: 3,
                assignedTo: 'Pending'
            },
            {
                id: 'CMP003',
                title: 'Garbage Not Collected for 5 Days',
                description: 'Regular garbage collection has stopped, creating unhygienic conditions.',
                category: 'Sanitation',
                status: 'Resolved',
                priority: 'Medium',
                upvotes: 12,
                location: 'Alkapuri, Vadodara',
                submittedDate: '2025-08-15',
                lastUpdated: '2025-08-18',
                department: 'VMC',
                images: 1,
                assignedTo: 'Team Leader Patel'
            },

            {
                id: 'CMP005',
                title: 'Stray Dog Menace in Residential Area',
                description: 'Aggressive stray dogs creating safety issues for children and elderly.',
                category: 'Public Safety',
                status: 'Open',
                priority: 'Medium',
                upvotes: 31,
                location: 'Fatehgunj, Vadodara',
                submittedDate: '2025-08-21',
                lastUpdated: '2025-08-21',
                department: 'VMC',
                images: 0,
                assignedTo: 'Pending'
            },
            {
                id: 'CMP006',
                title: 'Illegal Construction Blocking Road',
                description: 'Unauthorized construction activity blocking 50% of road width.',
                category: 'Encroachment',
                status: 'Under Review',
                priority: 'High',
                upvotes: 18,
                location: 'Sayajigunj, Vadodara',
                submittedDate: '2025-08-22',
                lastUpdated: '2025-08-24',
                department: 'Town Planning',
                images: 2,
                assignedTo: 'Inspector Kumar'
            }
        ];

        setComplaints(mockComplaints);
        setFilteredComplaints(mockComplaints);
    }, []);

    return (


        <main>
            {/* <Hero /> */}
            <ScrollHero />

            <ChatWidget />
            {/* demo complaints fetch actual complaints */}

            {/* get details of recent complaints and use the ComplaintCard to list the complaints */}
            <section>
                <h2 className="text-center text-3xl font-bold">Recent Complaints</h2>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="space-y-6">
                        {filteredComplaints.length === 0 ? (
                            <div className="text-center py-12">
                                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No complaints found</h3>
                                <p className="text-gray-600 dark:text-gray-300">Try adjusting your search criteria or filters.</p>
                            </div>
                        ) : (
                            filteredComplaints.map((complaint) => (
                                <ComplaintCard key={complaint.id} complaint={complaint} />
                            ))
                        )}
                    </div>

                    
                </div>
            </section>

            
                    {/* <li>Recent Complaints</li>
                    <li>Top Upvoted Complaints</li>
                    <li>Categories Overview</li>
                    <li>Submit a Complaint</li>
                 */}

                 


        </main>


    );
};

export default Home;