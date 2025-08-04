import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import useCurrentUser from "./customHooks/getCurrentUser";
import useOtherUsers from "./customHooks/getOtherUsers";
import { useDispatch, useSelector } from "react-redux";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import { serverUrl } from "./main";
import { setOnlineUsers, setSocket } from "./redux/userSlice";
import { io } from "socket.io-client";

const App = () => {
  const dispatch = useDispatch();
  const { userData, socket } = useSelector(state => state.user);
  //  const state = useSelector(state => state);
  // console.log("🔍 Redux State:", state.user);

  // Custom hooks (should start with 'use' and be called inside the component)
  useCurrentUser();
  useOtherUsers();

  useEffect(() => {
    if (userData) {
      const socketio = io(serverUrl, {
        query: { userId: userData._id },
      });

      dispatch(setSocket(socketio));
      socketio.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });

      return () => {
        socketio.disconnect();
        dispatch(setSocket(null));
      };
    } else if (socket) {
      socket.disconnect();
      dispatch(setSocket(null));
    }
  }, [userData]);

  return (
    <Routes>
      <Route
        path="/login"
        element={!userData ? <Login /> : <Navigate to="/" />}
      />
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to="/profile" />}
      />
      <Route
        path="/"
        element={userData ? <Home /> : <Navigate to="/login" />}
      />
      <Route
        path="/profile"
        element={userData ? <Profile /> : <Navigate to="/signup" />}
      />
    </Routes>
  );
};

export default App;
