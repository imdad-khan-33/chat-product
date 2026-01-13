import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import image from "../../assets/images/auth-left.png";
import successImage from "../../assets/images/success.png";
import { useVerifyEmailMutation } from "../../slices/auth/authApi";
import CustomLoader from "../../components/commonComponents/CustomLoader";
import ErrorComponent from "../../components/ErrorComponent";
const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [verifyEmail, { isLoading: verifyLoading, isError }] =
    useVerifyEmailMutation();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyEmail(token);
    }
  }, [searchParams]);

  return (
    <>
      {verifyLoading ? (
        <CustomLoader />
      ) : isError ? (
        <ErrorComponent />
      ) : (

        
        <div className="w-full h-screen flex justify-center items-center relative">
          <img
            src={image}
            className="fixed inset-y-0 inset-x-0 -z-10 h-screen md:w-2/3 w-full"
            alt="background"
          />
          <div className="z-10 bg-white py-[65.89px] px-[49.42px] rounded-[20px] md:w-[400px] gap-2 shadow-custom flex justify-center items-center flex-col m-auto">
            <img src={successImage} alt="Success" className="w-20" />
            <h1 className="font-body font-semibold text-[35px] text-[#153060]">
              Successfully
            </h1>
            <p className="font-normal font-body text-[14px] text-[#828282] text-center p-0 m-0">
              Your account has been created successfully.
            </p>
            <Link
              className="bg-customBg text-[#FFFFFF] text-[16px] w-full font-semibold p-1 rounded text-center"
              to="/login"
            >
              Continue to Login
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default VerifyEmail;
