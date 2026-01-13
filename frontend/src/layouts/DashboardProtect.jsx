import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { useGetCurrentUserQuery } from "../slices/auth/authApi";
import { logout, setUserDetails } from "../slices/auth/authSlice";
import CustomLoader from "../components/commonComponents/CustomLoader";
import { useEffect } from "react";

const DashboardProtect = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const token = localStorage.getItem("Therapy-user-token");

  const { data, isLoading, isError, isSuccess } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (isSuccess && data?.data) {
      console.log("DashboardProtect: Fetched user data", data.data);
      if (data.data.username) {
        dispatch(setUserDetails(data.data));
      }
    }
  }, [isSuccess, data, dispatch]);

  // If token error, logout
  if (isError) {
    dispatch(logout());
    return <Navigate to="/login" replace />;
  }

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If no user in Redux, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // While loading, show loader
  if (isLoading) {
    return <CustomLoader />;
  }

  // All checks passed, render children
  return children;
};

export default DashboardProtect;
