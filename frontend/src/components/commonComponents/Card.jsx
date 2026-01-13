import React from "react";

const Card = ({ children, className = "", onClick, ...props }) => {
  return (
    <div
      className={`bg-white rounded-3xl shadow-sm border border-[#E0F2F1] p-8 hover:shadow-md hover:border-[#90D6CA] transition-all duration-300 ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
