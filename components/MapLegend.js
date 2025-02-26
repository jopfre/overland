import React from "react";

export default function MapLegend() {
  return (
    <div className="absolute bottom-5 right-5 bg-white p-2.5 rounded-md shadow-md z-[1000]">
      <h4 className="font-medium mb-2">Travel Advice</h4>
      <div className="flex items-center mb-1">
        <span className="inline-block w-5 h-5 bg-[#FF0000] mr-1.5"></span>
        <span>Avoid all travel</span>
      </div>
      <div className="flex items-center mb-1">
        <span className="inline-block w-5 h-5 bg-[#FFA500] mr-1.5"></span>
        <span>Avoid all but essential travel</span>
      </div>
      <div className="flex items-center mb-1">
        <span className="inline-block w-5 h-5 bg-[#FF6347] mr-1.5"></span>
        <span>Avoid all travel to parts</span>
      </div>
      <div className="flex items-center mb-1">
        <span className="inline-block w-5 h-5 bg-[#FFD700] mr-1.5"></span>
        <span>Avoid all but essential travel to parts</span>
      </div>
      <div className="flex items-center mb-1">
        <span className="inline-block w-5 h-5 bg-[#00FF00] mr-1.5"></span>
        <span>No specific warnings</span>
      </div>
      <div className="flex items-center">
        <span className="inline-block w-5 h-5 bg-[#CCCCCC] mr-1.5"></span>
        <span>No data available</span>
      </div>
    </div>
  );
}
