import { useEffect, useRef, useState } from "react";
import back from "../assets/back.png";

const Report = () => {
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
          height: "100vh",
          width: "100%",
          filter: "blue(500px)",
        }}
      >
        <div>
          <div>
            <div>
              <div>Report of Pothole</div>
              <div>Img</div>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Report;
