import axios from "axios";
import DocumentPic from "./DocumentPic";
import React, { useState } from "react";
import { IconButton, Button, Input, Checkbox } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";


export default function Documentheader(props) {

  const [shareWithEmail, setShareWithEmail] = useState("");
  const [title, setTitle] = useState("");
  const [changeTittle, setChangeTittle] = useState(false);
  const [checked, setChecked] = useState(false);
  
  const navigate = useNavigate();

  const clickCheckbox = () => {
    setChecked(!checked);
  };

  const canShare = () => {
    return props.creatorId ? props.userId === props.creatorId : true;
  };

  const canChangeTitle = () => {
    let editor = [];
    if (props.editorArr) {
      props.editorArr.forEach((element) => {
        editor.push(element._id);
      });
    }
    const result = props.creatorId ? editor.includes(props.userId) : true;
    return result;
  };

  const handleSend = async () => {

    setShareWithEmail("");
    setChecked(false);
    const sendFromEmail = props.userEmail;
    const sendToEmail = shareWithEmail;
    const url = props.url;
    const documentUrl = `http://localhost:3000/documents/${props.url}`;
    axios
      .post("/api/send_mail", {
        sendFromEmail: sendFromEmail,
        sendToEmail: sendToEmail,
        text: documentUrl,
        url: url,
        viewOnly: checked,
        senderName: props.userName,
      })
      .then((res) => {
        console.log("alert message:", res.data);
        alert(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleChangeTitle = () => {
    setChangeTittle(true);
    axios({
      method: "POST",
      data: {
        title: title,
        URL: props.url,
      },
      url: "/api/users/changeTitle",
    }).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
    });
  };

  let picUrl = [];

  const creatorUrl = props.creatorPic? props.creatorPic: props.userPic;
  picUrl.push(creatorUrl);
  if(props.editorOnlyArr) {props.editorOnlyArr.forEach(editor => picUrl.push(editor.profilePic))};
  if(props.viewerArr) {props.viewerArr.forEach(editor => picUrl.push(editor.profilePic))};

  const picList = picUrl.map((url,index) => {return (
    <DocumentPic
      key={index}
      url={url}
    />
    );
  });


  return (
    <div className="flex items-center justify-between sticky z-50 top-0 px-4 py-2 shadow-md bg-white">
      <div className="flex space-x-5">
        <IconButton
          className="h-20 w-20 mt-1"
          onClick={() => navigate("/users/dashboard")}
        >
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

        {!changeTittle ? (
          <>
            <h1 className="ml-2 mt-3 text-gray-700 text-2xl">Title</h1>
            <form onSubmit={handleChangeTitle}>
              <fieldset
                className="mx-5 md:mx-10 flex items-center px-5 py-2 bg-gray-100 text-gray-600 rounded-lg focus-within:text-gray-600 focus-within:shadow-md"
                disabled={!canChangeTitle()}
              >
                <Input
                  label={props.documentTitle}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </fieldset>
            </form>
          </>
        ) : (
          <h1 className="ml-2 mt-3 text-gray-700 text-2xl">{title}</h1>
        )}
      </div>

      <div className="flex flex-end space-x-2">
        <form onSubmit={(event) => event.preventDefault()} autoComplete="off">
          <fieldset
            className="mx-5 md:mx-10 flex items-center px-5 py-2 bg-gray-100 text-gray-600 rounded-lg focus-within:text-gray-600 focus-within:shadow-md"
            disabled={!canShare()}
          >
            <div className="w-50">
              <Input
                label="Share with"
                name="share"
                type="text"
                value={shareWithEmail}
                onChange={(event) => setShareWithEmail(event.target.value)}
              />
            </div>
            <div className="flex items-center">
              <Checkbox
                checked={checked}
                value={checked}
                onChange={clickCheckbox}
                label={<FontAwesomeIcon icon={faEye} />}
              />
            </div>
            <Button className="mx-3" onClick={handleSend}>
              Share
            </Button>
          </fieldset>
        </form>
        <div className="flex">
          {picList}
        </div>

      </div>
    </div>
  );
}
