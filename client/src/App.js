import React from "react";
import TextEditor from "./TextEditor";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


//create App component
function App() {

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={"/login"} />}
        ></Route>
        {/* <Route
          path="/users"
          element={<Navigate to={"users/dashboard"} />}
        ></Route> */}
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="users/dashboard" element={<Dashboard />}></Route>
        <Route path="/documents/:id" element={<TextEditor />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
