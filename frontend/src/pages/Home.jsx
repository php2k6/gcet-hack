import React from "react";
// import Glance from "../components/Glance";
// import Hero from "../components/Hero";
import ScrollHero from "../components/ScrollHero";
import ChatWidget from "../components/ChatWidget";

const Home = () => {
  return (
    <main>
      {/* <Hero /> */}
      <ScrollHero />
      {/* <Glance />
            <Glance />
            <Glance /> */}
      <ChatWidget />
    </main>
  );
};

export default Home;
