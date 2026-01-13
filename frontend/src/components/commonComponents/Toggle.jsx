import React from "react";

const Toggle = ({ checked, onChange, label }) => {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-6 h-6 accent-customText cursor-pointer"
      />
      {label && <label className="text-gray-700 font-semibold">{label}</label>}
    </div>
  );
};

export default Toggle;
