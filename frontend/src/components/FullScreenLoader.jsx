const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative w-12 h-12 animate-spin988">
            <div className="absolute top-0 left-0 w-5 h-5 bg-customBg rounded-full"></div>
            <div className="absolute top-0 right-0 w-5 h-5 bg-customBg rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-5 h-5 bg-customBg rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-customBg rounded-full"></div>
          </div>
    </div>
  );
};

export default FullScreenLoader;
