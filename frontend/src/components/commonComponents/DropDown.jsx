import { useState, useRef, useEffect } from "react";

const DropdownMenu = ({ label, items = [], onItemClick, children, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="cursor-pointer" onClick={handleToggle}>
        {label}
      </div>

      {isOpen && (
        <div className={`absolute ${name === "Notifications" ? "-left-20 w-[330px]" : "right-0 w-[200px]"} mt-4 z-50 bg-customBg shadow-md rounded-xl overflow-hidden hide-scrollbar overflow-y-scroll max-h-[400px]`}>
          {/* Render custom children ( for notifications) */}
          {children ? (
            <div className="max-h-80 overflow-y-auto">{children}</div>
          ) : (
            <ul className="py-2">
              {items.map((item) => (
                <li
                  key={item}
                  className="px-4 py-2 hover:bg-customText text-white hover:text-black cursor-pointer"
                  onClick={() => {
                    setIsOpen(false);
                    onItemClick?.(item);
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
