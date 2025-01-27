import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/Home";
import CommunityPage from "./pages/Community";
import Submit from "./pages/Submit";
import RootLayout from "./pages/Root";
import { loader as postLoader } from "./pages/Home";
import { loader as popularPostLoader } from "./pages/PopularPage";
import { loader as NewestPostLoader } from "./pages/NewestPage";
import ErrorPage from "./pages/ErrorPage";
import UserPage from "./pages/UserPage";
import EditPage from "./pages/EditPage";
import UserProfile from "./pages/UserProfilePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: postLoader,
        errorElement: <ErrorPage />,
      },
      {
        path: "/popular",
        element: <HomePage />,
        loader: popularPostLoader,
      },
      {
        path: "/newest",
        element: <HomePage />,
        loader: NewestPostLoader,
      },
      { path: "/community", element: <CommunityPage /> },
      { path: "/create", element: <Submit /> },
      {
        path: "/user/:userId",

        children: [
          {
            index: true,
            element: <UserPage />,
          },
          {
            path: "edit",
            element: <EditPage />,
          },
          {
            path: "profile",
            element: <UserProfile />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
