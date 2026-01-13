import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useGetCurrentUserQuery } from "../slices/auth/authApi";
import { setUserDetails, logout } from "../slices/auth/authSlice";
import CustomLoader from "./commonComponents/CustomLoader";

const UserInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("Therapy-user-token");
  const [isInitialized, setIsInitialized] = useState(false);

  const { data, isSuccess, isError, isLoading } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (isSuccess && data?.data) {
      dispatch(setUserDetails(data.data));
      setIsInitialized(true);
    } else if (isError) {
      dispatch(logout());
      setIsInitialized(true);
    } else if (!token) {
      // No token, no user
      setIsInitialized(true);
    }
  }, [isSuccess, isError, data, dispatch, token]);

  if (!isInitialized) return <CustomLoader />;

  return children;
};

export default UserInitializer;
