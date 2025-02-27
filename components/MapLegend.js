import React, { useState } from "react";

export default function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="absolute bottom-5 right-5 bg-white rounded-md shadow-md z-[1000] ">
      <div className="flex justify-between items-center p-2.5">
        <h3 className="font-medium">Legend</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-gray-500 hover:text-gray-700"
          aria-label={isExpanded ? "Collapse legend" : "Expand legend"}
        >
          {isExpanded ? "➖" : "➕"}
        </button>
      </div>

      {isExpanded && (
        <div className="px-2.5 pb-2.5 text-sm">
          <div className="flex gap-6">
            {/* Travel Advice Column */}
            <div>
              <h4 className="font-bold mb-2">Travel Advice</h4>
              <div className="flex items-center mb-1">
                <span className="inline-block w-5 h-5 bg-[#FF0000] mr-1.5"></span>
                <span>Avoid all travel</span>
              </div>
              <div className="flex items-center mb-1">
                <span className="inline-block w-5 h-5 bg-[#FFA500] mr-1.5"></span>
                <span>Avoid all but essential travel</span>
              </div>
              <div className="flex items-center mb-1">
                <span className="inline-block w-5 h-5 bg-[#FFD700] mr-1.5"></span>
                <span>Avoid travel to parts</span>
              </div>
              <div className="flex items-center mb-1">
                <span className="inline-block w-5 h-5 bg-[#00FF00] mr-1.5"></span>
                <span>No specific warnings</span>
              </div>
              <div className="flex items-center mb-1">
                <span className="inline-block w-5 h-5 bg-[#CCCCCC] mr-1.5"></span>
                <span>No data available</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <a
                  href="https://www.gov.uk/foreign-travel-advice"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Source: UK Foreign Travel Advice
                </a>
              </div>
            </div>

            {/* Border Status Column */}
            <div>
              <h4 className="font-bold mb-2">Border Status</h4>
              <div className="flex items-center ">
                <span className="text-lg mr-1.5">✅</span>
                <span>Open border</span>
              </div>
              <div className="flex items-center ">
                <span className="text-lg mr-1.5">🚧</span>
                <span>Possible problems</span>
              </div>
              <div className="flex items-center ">
                <span className="text-lg mr-1.5">❌</span>
                <span>Closed border</span>
              </div>
              <div className="flex items-center ">
                <span className="text-lg mr-1.5">❓</span>
                <span>Unknown</span>
              </div>
              <div className="flex items-center ">
                <span className="text-lg mr-1.5">🎌</span>
                <span>Bilateral border crossing</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <a
                  href="https://caravanistan.com/border-crossings/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Source: Caravanistan
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
