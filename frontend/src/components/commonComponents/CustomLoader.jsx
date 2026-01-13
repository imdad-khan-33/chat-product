const CustomLoader = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center">
          <div className="relative w-12 h-12 animate-spin988">
            <div className="absolute top-0 left-0 w-5 h-5 bg-customBg rounded-full"></div>
            <div className="absolute top-0 right-0 w-5 h-5 bg-customBg rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-5 h-5 bg-customBg rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-customBg rounded-full"></div>
          </div>
        </div>
  )
}

export default CustomLoader
