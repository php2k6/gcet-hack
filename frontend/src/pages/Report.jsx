import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import back from "../assets/back.png";
import image from "../assets/pothole1.png";
import { Check } from "lucide-react";
import { FaCheck } from "react-icons/fa";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useGetIssueById } from "../api/issues";

import {
  Timeline,
  TimelineBody,
  TimelineContent,
  TimelineItem,
  TimelinePoint,
  TimelineTime,
  TimelineTitle,
} from "flowbite-react";

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: issue, isLoading, error } = useGetIssueById(id);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Parse location string to coordinates (similar to Heatmap component)
  const parseLocation = (locationString) => {
    try {
      // Try to extract lat/lng from various formats
      // Format: "Lat: 23.0225, Lng: 72.5714" or "23.0225, 72.5714"
      const coordPattern = /(?:lat[:\s]*)?(-?\d+\.?\d*)[,\s]+(?:lng[:\s]*)?(-?\d+\.?\d*)/i;
      const match = locationString.match(coordPattern);
      
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        
        // Validate coordinates
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return [lat, lng];
        }
      }
      
      // Default to Anand if parsing fails
      return [22.56, 72.95];
    } catch (error) {
      console.error('Error parsing location:', error);
      return [22.56, 72.95];
    }
  };

  // Handle opening heatmap with coordinates
  const handleOpenInMap = () => {
    const coordinates = parseLocation(reportData.location);
    const [lat, lng] = coordinates;
    
    // Navigate to heatmap with coordinates as URL parameters
    navigate(`/heatmap?lat=${lat}&lng=${lng}&zoom=16&highlight=${id}`);
  };

  // Helper functions
  const getStatusStages = (currentStatus) => {
    const allStages = [
      { id: 0, name: "Pending", date: issue?.created_at ? new Date(issue.created_at).toLocaleDateString() : "N/A" },
      { id: 1, name: "In Progress", date: issue?.updated_at && issue?.status >= 1 ? new Date(issue.updated_at).toLocaleDateString() : "TBA" },
      { id: 2, name: "Resolved", date: issue?.updated_at && issue?.status >= 2 ? new Date(issue.updated_at).toLocaleDateString() : "TBA" },
      { id: 3, name: "Verified", date: "TBA" }
    ];
    return allStages;
  };

  const getPriorityColor = (priority) => {
    if (!priority || typeof priority !== 'string') return 'text-gray-600';
    
    switch (priority.toLowerCase()) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      0: 'Pending',
      1: 'In Progress', 
      2: 'Resolved',
      3: 'Rejected'
    };
    return statusMap[status] || 'Pending';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading report...</div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Error loading report: {error?.message || 'Issue not found'}</div>
      </div>
    );
  }

  const stages = getStatusStages(issue.status);
  const currentStage = issue.status || 0;
  
  // Dynamic data from API with safe fallbacks
  const reportData = {
    title: issue.title || 'Untitled Issue',
    category: issue.category || 'General',
    description: issue.description || 'No description available',
    reportedBy: issue.user?.name || 'Anonymous',
    date: issue.created_at ? new Date(issue.created_at).toLocaleDateString() : 'N/A',
    time: issue.created_at ? new Date(issue.created_at).toLocaleTimeString() : 'N/A',
    location: issue.location || 'Location not specified',
    district: issue.user?.district || issue.authority?.district || 'N/A',
    department: issue.authority?.name || 'Department not assigned',
    priority: issue.priority || 'Medium',
    votes: issue.vote_count || 0,
    status: getStatusText(issue.status),
    images: issue.media || []
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 absolute inset-0 h-screen">
      {/* Background */}
      <div
        style={{
          backgroundImage: `url(${back})`,
          backgroundSize: "70%",
          backgroundPosition: "right",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          position: "absolute",
          height: "100vh",
          width: "100%",
          filter: "blur(30px)",
          zIndex: 0,
        }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 pt-20">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            {reportData.title}
          </div>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Image Section */}
            <div className="lg:w-1/3">
              {reportData.images.length > 0 ? (
                <img 
                  className="w-full h-64 object-cover rounded-lg shadow-md" 
                  src={reportData.images[0].file_url || image} 
                  alt="Issue Image" 
                  onError={(e) => {
                    e.target.src = image; // Fallback to default image
                  }}
                />
              ) : (
                <img className="w-full h-64 object-cover rounded-lg shadow-md" src={image} alt="Default Image" />
              )}
            </div>

            {/* Details Section */}
            <div className="lg:w-2/3 space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="text-lg">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Title:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{reportData.title}</span>
                  </div>
                  
                  <div className="text-lg">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Reported By:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{reportData.reportedBy}</span>
                  </div>
                  
                  <div className="text-lg">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Date/Time:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{reportData.date} | {reportData.time}</span>
                  </div>
                  
                  <div className="text-lg">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Category:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{reportData.category}</span>
                  </div>

                  <div className="text-lg">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Department:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{reportData.department}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-lg">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Location:</span>
                    <button 
                      onClick={handleOpenInMap}
                      className="ml-2 text-blue-600 hover:text-blue-800 underline transition-colors cursor-pointer bg-transparent border-none p-0"
                    >
                      {reportData.location}
                    </button>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="inline h-5 w-5 text-blue-500 ml-1 cursor-pointer"
                      onClick={handleOpenInMap}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                  </div>

                  <div className="text-lg">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Priority:</span>
                    <span className={`ml-2 font-medium ${getPriorityColor(reportData.priority)}`}>
                      {reportData.priority}
                    </span>
                  </div>

                  <div className="text-lg">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Status:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{reportData.status}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                <p className="text-gray-900 dark:text-white text-justify leading-relaxed">
                  {reportData.description}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline and Votes Section */}
          <div className="mt-8 flex flex-col lg:flex-row gap-8">
            {/* Timeline */}
            <div className="lg:w-2/3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Timeline</h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <Timeline horizontal className="w-full">
                  {stages.map((stage) => (
                    <TimelineItem key={stage.id}>
                      <TimelinePoint
                        className={
                          currentStage >= stage.id
                            ? "bg-pink-500"
                            : "bg-gray-300"
                        }
                        icon={currentStage >= stage.id ? FaCheck : null}
                      />
                      <TimelineContent>
                        <TimelineTime className="text-sm text-gray-600 dark:text-gray-400">
                          {stage.date}
                        </TimelineTime>
                        <TimelineTitle
                          className={
                            currentStage >= stage.id
                              ? "text-pink-600 font-semibold"
                              : "text-gray-500"
                          }
                        >
                          {stage.name}
                        </TimelineTitle>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </div>
            </div>

            {/* Votes */}
            <div className="lg:w-1/3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Community Votes</h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <button className="text-blue-600 hover:text-pink-600 dark:text-blue-400 transition-colors">
                    <FaArrowUp size={24} />
                  </button>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {reportData.vote_count}
                  </p>
                  <button className="text-blue-600 hover:text-pink-600 dark:text-blue-400 transition-colors">
                    <FaArrowDown size={24} />
                  </button>
                  <p className="text-sm text-gray-600 dark:text-gray-400">votes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
