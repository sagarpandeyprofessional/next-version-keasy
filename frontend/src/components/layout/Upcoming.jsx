import React from "react";

const ComingSoonOverlay = () => {
  return (
    <div className="absolute left-1/2 top-[100px] -translate-x-1/2 z-10 pointer-events-none">
      <h1 className="text-black text-5xl sm:text-6xl font-bold text-center">
        Upcoming
      </h1>
    </div>

  );
};

export default ComingSoonOverlay;
