import React from "react";
import { IoCheckmark } from "react-icons/io5";

const Alert = ({ type = "info", message, title, onClose, action }) => {
  const typeStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    crisis: "bg-red-100 border-red-400 text-red-900",
  };

  const iconStyles = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
    crisis: "text-red-600",
  };

  return (
    <div className={`border-l-4 p-4 rounded ${typeStyles[type]} mb-4`}>
      <div className="flex items-start gap-3">
        <div className={`text-2xl ${iconStyles[type]}`}>
          {type === "success" && <IoCheckmark />}
        </div>
        <div className="flex-1">
          {title && <h3 className="font-bold text-sm mb-1">{title}</h3>}
          <p className="text-sm">{message}</p>
          {action && <button className="text-sm font-semibold mt-2 underline">{action}</button>}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-xl">
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
