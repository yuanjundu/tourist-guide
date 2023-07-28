import * as React from "react";
import App from './App'; 
import Signup from './pages/Signup'; 
import Login from './pages/Login'; 
import EditProfile from "./pages/EditProfile";
import Itinerary from "./pages/Itinerary";
import History from "./pages/History";
import Community from "./pages/Community"
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";

const AppRoutes = [
  {
    path: "/",
    element: <App />,
  },
  {
    path: "signup",
    element: <Signup />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "editprofile",
    element: <EditProfile />,
  },
  {
    path: "itinerary",
    element: <Itinerary />,
  },
  {
    path: "history",
    element: <History />,
  },
  {
    path: "community",
    element: <Community />,
  },
  {
    path: "resetPassword",
    element: <ResetPassword />
  },
  {
    path: "password/reset/:uid/:token",
    element: <ResetPasswordConfirm />
  },
  
];

export default AppRoutes;
