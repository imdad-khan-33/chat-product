import React from "react";

const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) => {
  const baseStyles = "font-black rounded-2xl transition-all duration-300 ease-in-out active:scale-95 shadow-lg hover:shadow-xl disabled:shadow-none disabled:active:scale-100";

  const variants = {
    primary: "bg-[#0B6A5A] text-white hover:bg-[#085a4d] disabled:bg-gray-200 disabled:text-gray-400",
    secondary: "bg-white text-[#0B6A5A] border-2 border-[#CCFBF1] hover:border-[#0B6A5A] hover:bg-[#F0FDFA] disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-200",
    outline: "bg-transparent border-2 border-[#1AC6A9] text-[#1AC6A9] hover:bg-[#1AC6A9] hover:text-white disabled:border-gray-200 disabled:text-gray-300",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-xs uppercase tracking-widest",
    md: "px-8 py-4 text-base",
    lg: "px-10 py-5 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
