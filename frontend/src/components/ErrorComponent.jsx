import image from "../assets/images/auth-left.png";

const ErrorComponent = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center relative">
          <img
            src={image}
            className="fixed inset-y-0 inset-x-0 -z-10 h-screen md:w-2/3 w-full"
            alt="background"
          />
          {/* <img
            src={horizontalDots}
            className="lg:block absolute hidden left-40 bottom-32 h-24 -z-10"
            alt="horizontal dots"
          />
          <img
            src={verticalDots}
            className="lg:block absolute hidden right-[22%] top-[25%] w-24 -z-10"
            alt="vertical dots"
          /> */}
          <div className="z-10 bg-white py-[65.89px] px-[49.42px] rounded-[20px] md:w-[400px] gap-2 shadow-custom flex justify-center items-center flex-col m-auto">
            <h1 className="font-body font-semibold md:text-[30px] text-heading text-center leading-8">
              Something went wrong
            </h1>
            <p className="font-normal font-body text-[14px] text-[#828282] text-center p-0 m-0">
              Please try again later.
            </p>
          </div>
        </div>
  )
}

export default ErrorComponent
