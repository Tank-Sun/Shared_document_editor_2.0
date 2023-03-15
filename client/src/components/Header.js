import React from 'react';
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, IconButton } from "@material-tailwind/react";


export default function Header(props) {
  const navigate = useNavigate();

  const logOut = () => {
    Axios({
      method: "POST",
      withCredentials: true,
      url: "/api/logout",
    }).then(() => {
      navigate("/");
    }).catch((err) => {
      console.log(err);
    });
  };

  const picUrl = props.user.profilePic;

  return (
    <div className="flex justify-between sticky z-50 top-0 px-4 py-2 shadow-md bg-white">
      <div className="flex items-center">
        <button className="button button-icon px-5" >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
            />
          </svg>
        </button>
        <IconButton className="h-20 w-20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
            />
          </svg>
        </IconButton>
        <h1 className="ml-2 text-gray-700 text-2xl">Docs</h1>
      </div>
      <div className="flex items-center">
        <button className="button button-icon px-0" data-ripple-light="true">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 pr-1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        </button>
        <img loading="lazy" className="cursor-pointer h-12 w-12 rounded-full ml-2" alt="" src={picUrl} />
        <div className="ml-2"><Button onClick={logOut}>Log Out</Button></div>
      </div>
    </div>
  )
}
