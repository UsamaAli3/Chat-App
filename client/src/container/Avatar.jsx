import React from "react";

function Avatar({ userId, username, online }) {
  const colors = [
    "bg-red-200",
    "bg-purple-200",
    "bg-green-200",
    "bg-blue-200",
    "bg-teal-200",
    "bg-yellow-200",
  ];
  const userIdBAse = parseInt(userId, 16);
  const colorIndex = userIdBAse % colors.length;
  const color = colors[colorIndex];
  return (
    <div className={`w-8 h-8 relative rounded-full flex items-center ${color}`}>
      <div className="text-center w-full opacity-70">{username?.charAt(2)}</div>
      {online && (
        <div className="absolute w-3 h-3 bg-green-400 bottom-0 right-0 rounded-full border border-white"></div>
      )}
      {!online && (
        <div className="absolute w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-white"></div>
      )}
    </div>
  );
}

export default Avatar;
