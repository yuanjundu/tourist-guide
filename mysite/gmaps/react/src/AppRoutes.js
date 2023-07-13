import * as React from "react";
import App from './App'; 
import Signup from './pages/Signup'; 
import Login from './pages/Login'; 

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
  
];

export default AppRoutes;
