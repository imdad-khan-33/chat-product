import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setCredentials, setUserDetails } from '../../slices/auth/authSlice';
import notifyToast from '../../utils/utilityFunctions';
import { useLazyGetCurrentUserQuery } from '../../slices/auth/authApi';
import CustomLoader from '../../components/commonComponents/CustomLoader';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const dispatch = useDispatch();

  const [getCurrentUser] = useLazyGetCurrentUserQuery();

  useEffect(() => {
    const queryParams = new URLSearchParams(search);
    const token = queryParams.get('accessToken');

    const handleOAuth = async () => {
      if (!token) {
        notifyToast('Login failed. No token found.', 'error');
        navigate('/login');
        return;
      }

      try {
        // 1. Save token
        localStorage.setItem('Therapy-user-token', token);
        dispatch(setCredentials(token));
        notifyToast('Login successful!', 'success');

        // 2. Fetch user details
        const userRes = await getCurrentUser().unwrap();
        dispatch(setUserDetails(userRes?.data));

        // 3. Navigate based on profile
        if (userRes?.data?.completed) {
          navigate('/user-dashboard');
        } else {
          navigate('/assessment');
        }
      } catch (error) {
        console.error("OAuth login failed:", error);
        notifyToast('Something went wrong. Please login again.', 'error');
        navigate('/login');
      }
    };
    handleOAuth();
  }, [search, navigate]);

  return <CustomLoader />;
};


export default OAuthSuccess;
