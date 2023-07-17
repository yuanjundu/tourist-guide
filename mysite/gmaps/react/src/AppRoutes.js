import * as React from "react";
import App from './App'; 
import Signup from './pages/Signup'; 
import Login from './pages/Login'; 
import EditProfile from "./pages/EditProfile";
import Itinerary from "./pages/Itinerary";
import History from "./pages/History";
import Community from "./pages/Community"

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
  
];

export default AppRoutes;
