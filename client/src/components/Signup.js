import React, { useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import loginImg from "../assets/login2.png";
import { FcGoogle } from "react-icons/fc";
import { GrFacebook } from "react-icons/gr";
import { Checkbox } from "@material-tailwind/react";

export default function Signup() {
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const navigate = useNavigate();

  const signUp = () => {
    Axios({
      method: "POST",
      data: {
        username: newUsername,
        email: newEmail,
        password: newPassword,
      },
      withCredentials: true,
      url: "/api/signup",
    }).then(() => {
      // console.log("aaa:", res);
      navigate("/users/dashboard");
    }).catch((err) => {
      alert(err.response.data);
    });
  };

  return (

    <div className="relative w-full h-screen">
      <img
        src={loginImg}
        className="absolute w-full h-full object-cover mix-blend-darken"
        alt="/"
      />
      <div
        className="flex justify-center items-center h-full"
        onSubmit={(event) => event.preventDefault()}
        autoComplete="off"
      >
        <form className="z-10 max-w-[400px] mx-auto bg-white/10 p-8">
          <h2 className="text-4xl font-bold py-4 text-center">Shared Doc Editor</h2>
          <h3 className="text-3xl pt-4 text-left">Create account</h3>
          <div className="flex justify-between py-8">
            <p className="border shadow-lg hover:shadow-xl px-6 py-2 relative flex items-center">
              <GrFacebook className="mr-2" /> Facebook
            </p>
            <p className="border shadow-lg hover:shadow-xl px-6 py-2 relative flex items-center">
              <FcGoogle className="mr-2" /> Google
            </p>
          </div>
          <div className="flex flex-col mb-4">
            <label>Username</label>
            <input
              name="signup"
              type="text"
              placeholder="Username"
              value={newUsername}
              onChange={(event) => setNewUsername(event.target.value)}
              className="border relative bg-gray-100 p-2"
            />
          </div>
          <div className="flex flex-col mb-4">
            <label>Email</label>
            <input
              name="signup"
              type="text"
              placeholder="Email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              className="border relative bg-gray-100 p-2"
            />
          </div>
          <div className="flex flex-col mb-4">
            <label>Password</label>
            <input
              name="signup"
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="border relative bg-gray-100 p-2"
            />
          </div>
          <button
            onClick={signUp}
            className="w-full py-3 mt-8 bg-indigo-600 hover:bg-indigo-500 relative text-white"
          >
            Sign Up
          </button>
          <div className="flex items-center">
            <Checkbox />
            Remember me
          </div>
          <p className="text-center mt-8">
            Already have an account?{" "}
            <a href="/login" className="text-blue underline">
              Sign in now
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
