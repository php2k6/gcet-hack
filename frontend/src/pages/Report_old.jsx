import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
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
  const { data: issue, isLoading, error } = useGetIssueById(id);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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
    switch (priority?.toLowerCase()) {
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
  const currentStage = issue.status;
  
  // Dynamic data from API
  const reportData = {
    title: issue.title,
    category: issue.category,
    description: issue.description,
    reportedBy: issue.user?.name || 'Anonymous',
    date: new Date(issue.created_at).toLocaleDateString(),
    time: new Date(issue.created_at).toLocaleTimeString(),
    location: issue.location || 'Location not specified',
    district: issue.user?.district || issue.authority?.district || 'N/A',
    department: issue.authority?.name || 'Department not assigned',
    priority: issue.priority || 'Medium',
    votes: issue.vote_count || 0,
    status: getStatusText(issue.status),
    images: issue.media || []
  };

  return (
    <>
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
          zIndex: -1,
        }}
      ></div>
      <div
        className="mt-23 ml-33 blur-none"
        style={{ position: "relative", zIndex: 1 }}
      >
        <div>
          <div>
            <div className="text-4xl font-bold">Report of {reportData.category}</div>
            <div className="flex">
              <div className="mt-5 w-1/3 rounded-xs">
                {reportData.images.length > 0 ? (
                  <img 
                    className="h-100 w-full object-cover rounded-lg" 
                    src={reportData.images[0].file_url || image} 
                    alt="Issue Image" 
                  />
                ) : (
                  <img className="h-100 w-full object-cover rounded-lg" src={image} alt="Default Image" />
                )}
              </div>
              <div className="flex w-2/3 flex-col justify-start gap-4 space-y-3">
                <div className="mt-5 text-3xl font-bold">Details</div>
                <div className="text-xl font-bold">
                  Title: <span className="font-medium">{reportData.title}</span>
                </div>
                <div className="text-xl font-bold">Reported By: {reportData.reportedBy}</div>
                <div className="text-xl font-bold">
                  Date/Time:{" "}
                  <div className="inline font-medium">
                    {reportData.date} | {reportData.time}
                  </div>
                </div>
                <div className="text-xl font-bold">
                  Location
                  <div className="inline font-medium">
                    :{" "}
                    <a href="#" className="text-blue-700 underline">
                      {reportData.location}
                    </a>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="inline h-6 w-6 text-blue-500"
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
                    <span className="text-sm">Click to open in map</span>
                  </div>
                </div>
                <div className="text-xl font-bold">
                  Department
                  <div className="inline font-medium">: {reportData.department}</div>
                </div>
                <div className="text-xl font-bold">
                  Priority
                  <div className={`inline font-medium ${getPriorityColor(reportData.priority)}`}>
                    : {reportData.priority}
                  </div>
                </div>
                <div className="text-xl font-bold">
                  Status
                  <div className="inline font-medium">: {reportData.status}</div>
                </div>
                <div>
                  <div className="text-xl font-bold">
                    Description
                    <div className="mr-10 text-justify font-medium">{reportData.description}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 flex w-full">
              <div className="w-1/2">
                <div className="text-2xl font-bold">Timeline:</div>
                <center>
                  <div className="mt-5 ml-30 h-screen w-full max-w-4xl">
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
                          ></TimelinePoint>
                          <TimelineContent>
                            <TimelineTime>{stage.date}</TimelineTime>
                            <TimelineTitle
                              className={
                                currentStage >= stage.id
                                  ? "text-pink-600"
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
                </center>
              </div>
              <div className="ml-40 w-1/2">
                <div className="text-2xl font-bold">Votes</div>
                <div className="ml-5">
                  <button className="bg-green-100/0 text-blue-600 hover:text-pink-600 dark:text-green-400 dark:hover:text-green-400">
                    <FaArrowUp />
                  </button>
                  <p className="my-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {reportData.votes}
                  </p>
                  <button className="bg-green-100/0 text-blue-600 hover:text-pink-600 dark:text-green-400 dark:hover:text-green-400">
                    <FaArrowDown />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div></div>
        </div>
      </div>
    </>
  );
};

export default Report;
