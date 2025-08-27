import { useEffect, useRef, useState } from "react";
import back from "../assets/back.png";

const Report = () => {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
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
  let image = "../assets/pothole1.png";
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
            <div className="text-4xl font-bold">Report of Pothole</div>
            <div className="flex gap-6">
              <div className="w-1/2">Img</div>
              <div className="flex w-1/2 flex-col justify-start gap-5 space-y-4">
                <div>Details</div>
                <div>Reported By</div>
                <div>Date/Time</div>
                <div>Location</div>
                <div>Department</div>
                <div>
                  <div>Description</div>
                  <div>Detail</div>
                </div>
              </div>
            </div>
            <div>
              <div>Timeline</div>
              <div>
                <div>Reported</div>
                <div>Assigned</div>
                <div>In Progress</div>
                <div>Resolved</div>
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
