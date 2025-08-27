import { useEffect, useRef, useState } from "react";
import back from "../assets/back.png";
import image from "../assets/pothole1.png";
import { Check } from "lucide-react";
import { FaCheck } from "react-icons/fa";

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
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  var by = "Arjun Patel";
  var da = "5th Sept 2025";
  var ti = "2:00 pm";
  var loc = "Anand,Gujarat";
  var dep = "Anand Municipal Corporation";
  var des =
    "There is a large and deep pothole on the main road in Bakrol, near. It is located right in the middle of the road and is a significant hazard for two-wheelers and other vehicles. The recent rains have made it difficult to spot, increasing the risk of accidents. ";
  let problems = [
    "Pothole",
    "Dumping",
    "Waterlogging",
    "Street Light Issue",
    "Garbage",
    "Road Crack",
    "Tree Fallen",
    "Traffic Signal Issue",
    "Others",
  ];
  var curstage = 4;
  const stages = [
    { id: 1, name: "Posted", date: "Feb 2025" },
    { id: 2, name: "Under Review", date: "Feb 2025" },
    { id: 3, name: "In progress", date: "Feb 2025" },
    { id: 4, name: "Resolved", date: "April 2025" },
    { id: 5, name: "Verified", date: "TBA" },
  ];

  const com = (sid) => sid <= curstage;
  const cur = (sid) => sid == curstage;
  //   let image = "../assets/pothole1.png";
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
            <div className="text-4xl font-bold">Report of {problems[0]}</div>
            <div className="flex">
              <div className="mt-5 w-1/3 rounded-xs">
                <img className="h-100" src={image} alt="IMG" />
              </div>
              <div className="flex w-2/3 flex-col justify-start gap-4 space-y-3">
                <div className="mt-5 text-3xl font-bold">Details</div>
                <div className="text-xl font-bold">Reported By : {by}</div>
                <div className="text-xl font-bold">
                  Date/Time :{" "}
                  <div className="inline font-medium">
                    {da} | {ti}
                  </div>
                </div>
                <div className="text-xl font-bold">
                  Location
                  <div className="inline font-medium">
                    :{" "}
                    <a href="#" className="text-blue-700 underline">
                      {loc}
                    </a>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="inline h-6 w-6 text-blue-500"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                    <span className="text-sm">Click to open in map</span>
                  </div>
                </div>
                <div className="text-xl font-bold">
                  Department
                  <div className="inline font-medium">: {dep}</div>
                </div>
                <div>
                  <div className="text-xl font-bold">
                    Description
                    <div className="mr-10 text-justify font-medium">{des}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 w-full">
              <div className="text-2xl font-bold">Timeline:</div>
              <center>
                <div className="mt-5 ml-30 h-screen w-full max-w-4xl">
                  <style jsx>{`
                    .timeline-container .flowbite-timeline-horizontal::after {
                      display: none !important;
                    }
                    .timeline-container
                      .flowbite-timeline-item:last-child::after {
                      display: none !important;
                    }
                  `}</style>
                  <Timeline horizontal className="w-full">
                    {stages.map((stage) => (
                      <TimelineItem key={stage.id}>
                        <TimelinePoint
                          className={
                            curstage >= stage.id ? "bg-pink-500" : "bg-gray-300"
                          }
                          icon={curstage >= stage.id ? FaCheck : null}
                        ></TimelinePoint>
                        <TimelineContent>
                          <TimelineTime>{stage.date}</TimelineTime>
                          <TimelineTitle
                            className={
                              curstage >= stage.id
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
          </div>
          <div></div>
        </div>
      </div>
    </>
  );
};

export default Report;
