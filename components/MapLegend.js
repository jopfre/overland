import React, { useState } from "react";

export default function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleLegend = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className="absolute bottom-5 right-5 bg-white border-black/20 border-2 rounded-md z-[1000] cursor-pointer hover:bg-[#f4f4f4] transition-colors"
      onClick={toggleLegend}
    >
      <div className="flex justify-between items-center py-1 px-2">
        <h3 className="text-sm">Legend</h3>
        <span
          className="ml-2 text-gray-500"
          aria-label={isExpanded ? "Collapse legend" : "Expand legend"}
        >
          {isExpanded ? "➖" : "➕"}
        </span>
      </div>

      {isExpanded && (
        <div className="px-2.5 pb-2.5 text-sm">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="text-left font-normal pb-2 pr-4">
                  Travel Advice
                </th>
                <th className="text-left font-normal pb-2">Border Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pr-4 ">
                  <div className="flex items-center">
                    <span className="inline-block w-6 h-6 bg-[#00FF00] mr-1.5"></span>
                    <span>No specific warnings</span>
                  </div>
                </td>
                <td className="">
                  <div className="flex items-center">
                    <span className="text-lg mr-1.5">✅</span>
                    <span>Open border</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="pr-4 ">
                  <div className="flex items-center">
                    <span className="inline-block w-6 h-6 bg-[#FFD700] mr-1.5"></span>
                    <span>Avoid travel to parts</span>
                  </div>
                </td>
                <td className="">
                  <div className="flex items-center">
                    <span className="text-lg mr-1.5">🎌</span>
                    <span>Bilateral border crossing</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="pr-4 ">
                  <div className="flex items-center">
                    <span className="inline-block w-6 h-6 bg-[#FFA500] mr-1.5"></span>
                    <span>Avoid all but essential travel</span>
                  </div>
                </td>
                <td className="">
                  <div className="flex items-center">
                    <span className="text-lg mr-1.5">🚧</span>
                    <span>Possible problems</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="pr-4 ">
                  <div className="flex items-center">
                    <span className="inline-block w-6 h-6 bg-[#FF0000] mr-1.5"></span>
                    <span>Avoid all travel</span>
                  </div>
                </td>
                <td className="">
                  <div className="flex items-center">
                    <span className="text-lg mr-1.5">❌</span>
                    <span>Closed border</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="pr-4 ">
                  <div className="flex items-center">
                    <span className="inline-block w-6 h-6 bg-[#CCCCCC] mr-1.5"></span>
                    <span>No data available</span>
                  </div>
                </td>
                <td className="">
                  <div className="flex items-center">
                    <span className="text-lg mr-1.5">❓</span>
                    <span>Unknown</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="text-xs text-gray-500 pt-1 pr-4">
                  <a
                    href="https://www.gov.uk/foreign-travel-advice"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Source: UK Foreign Travel Advice
                  </a>
                </td>
                <td className="text-xs text-gray-500 pt-1">
                  <a
                    href="https://caravanistan.com/border-crossings/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Source: Caravanistan
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
