import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./UI/Avatar";
import { Button } from "./UI/Button";
import {
  Link,
  useLocation,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { Bell, Plus, MessageCircle } from "lucide-react";
import { Input } from "./UI/Input";
import { logout, fetchUserData } from "../store/authSlice";
import LoginPopup from "./Login";
import SignupPopup from "./SignUp";

function Header() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  // useEffect(() => {
  //   dispatch(initializeAuth(user));
  // }, [dispatch, user]);

  // useEffect(() => {
  //   if (token && !user) {
  //     dispatch(fetchUserData());
  //   }
  // }, [dispatch, token, user]);

  useEffect(() => {
    const mode = searchParams.get("mode");
    setIsLoginOpen(mode === "logIn");
    setIsSignupOpen(mode === "signUp");
  }, [location, searchParams]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 py-2 flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            {/* ... (Reddit logo SVG) ... */}
            <span className="text-xl font-bold">reddit</span>
          </Link>
          <div className="ml-4 flex-grow">
            <Input
              type="text"
              placeholder="Search Reddit"
              className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="ml-4 flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon">
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <Link to="/create">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center hover:bg-gray-300"
                  >
                    <Plus className="h-5 w-5 mr-1" />
                    Create
                  </Button>
                </Link>
                <Link to={`/user/${user?._id}`}>
                  <Avatar>
                    <AvatarImage
                      src={user?.avatar || "/placeholder-user.jpg"}
                      alt={user?.username || "@user"}
                    />
                    <AvatarFallback>
                      {user?.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Link to="/">
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    Log Out
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="?mode=logIn">
                  <Button variant="outline" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="?mode=signUp">
                  <Button variant="solid" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
          <LoginPopup
            isOpen={isLoginOpen}
            setIsOpen={useCallback(
              (open) => {
                setIsLoginOpen(open);
                if (!open) navigate("/");
              },
              [navigate]
            )}
          />
          <SignupPopup
            isOpen={isSignupOpen}
            setIsOpen={useCallback(
              (open) => {
                setIsSignupOpen(open);
                if (!open) navigate("/");
              },
              [navigate]
            )}
          />
        </div>
      </header>
    </>
  );
}

export default Header;
