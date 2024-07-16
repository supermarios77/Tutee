"use client"
import React from "react";
import { InlineWidget } from "react-calendly";

const App = () => {
  return (
    <div className="App">
      <InlineWidget url="https://calendly.com/tutee-english/" />
    </div>
  );
};

export default App;