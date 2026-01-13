import React from "react";

const Slider = ({ label, min = 0, max = 10, value, onChange, showValue = true }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-customText"
        />
        {showValue && (
          <span className="text-lg font-bold text-customText min-w-12 text-center">
            {value}
          </span>
        )}
      </div>
    </div>
  );
};

export default Slider;
