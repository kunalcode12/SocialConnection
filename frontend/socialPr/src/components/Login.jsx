import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "./UI/Button";
import { Input } from "./UI/Input";
import { Label } from "./UI/Label";
import { X, Apple, Facebook } from "lucide-react";
import { Form } from "react-router-dom";
import { login, clearError, initializeAuthAsync } from "../store/authSlice";

function LoginPopup({ isOpen, setIsOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(initializeAuthAsync());
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsOpen(false);
      navigate("/");
    }
  }, [isAuthenticated, setIsOpen, navigate, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    dispatch(login({ email: username, password: password }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-2">Log in</h2>
        <p className="text-sm text-gray-500 mb-6">
          By continuing, you agree to our User Agreement and Privacy Policy.
        </p>
        <Form onSubmit={handleSubmit} className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
          >
            Continue with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
          >
            <Apple className="mr-2 h-4 w-4" />
            Continue with Apple
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="Username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>
          <p className="text-center text-sm text-gray-500">
            Forgot your{" "}
            <a href="#" className="underline">
              username
            </a>{" "}
            or{" "}
            <a href="#" className="underline">
              password
            </a>
            ?
          </p>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
          >
            <Facebook className="mr-2 h-4 w-4" />
            Continue with Facebook
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default LoginPopup;
