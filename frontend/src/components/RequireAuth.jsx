import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const RequireAuth = ({ children }) => {
  const { user, setShowUserLogin } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // open login modal and go home
      setShowUserLogin(true);
      navigate('/');
    }
  }, [user]);

  if (!user) return null;
  return children;
}

export default RequireAuth;