import { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams, useLocation, Navigate } from "react-router-dom";
import Documentheader from "./Header-document";


const SAVE_INTERVAL_MS = 2000;

//  set toolbar
const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ font: [] }, { size: ["small", false, "large", "huge"] }], // custom dropdown
  [{ color: [] }, { background: [] }], // dropdown with defaults from theme

  [{ align: [] }, { list: "ordered" }, { list: "bullet" }], //list
  [{ indent: "-1" }, { indent: "+1" }, { direction: "rtl" }], // outdent/indent

  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ["link", "image", "blockquote", "code-block"], //code,image

  ["clean"], // remove formatting button
];

export default function TextEditor() {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const [showTitle, setShowTittle] = useState();

  const location = useLocation();

  let userEmail;
  let userId;
  let userName;
  let creatorId;
  let editorArr;
  let userPic;
  let editorOnlyArr;
  let viewerArr;
  let creatorPic;

  if (location.state) {
    userEmail = location.state.user.email;
    userId = location.state.user._id;
    userName = location.state.user.username;
    creatorId = location.state.creatorId;
    editorArr = location.state.editorArr;
    userPic = location.state.user.profilePic;
    editorOnlyArr = location.state.editorOnlyArr;
    viewerArr = location.state.viewerArr;
    creatorPic = location.state.creatorPic;
  }

  const editPermission = (document, id) => {
    return document.view_edit_access.includes(id);
  };


  //connect socket
  useEffect(() => {
    const connectSocket = io();
    setSocket(connectSocket);
    return () => {
      connectSocket.disconnect();
    };
  }, []);

  //create event handler- text change
  useEffect(() => {
    if (socket == null || quill == null) return;
    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  //create event handler- receive text change
  useEffect(() => {
    if (socket == null || quill == null) return;
    const handler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive-changes", handler);

    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  //set document id
  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once("load-document", (document) => {
      setShowTittle(document.title);

      quill.setContents(document.data);
      if (editPermission(document, userId)) {
        quill.enable();
      }
    });
 
    socket.emit("get-document", documentId, userEmail);
  }, [socket, quill, documentId, userEmail, userId]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  //create editor + toolbar only once
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const createQuill = new Quill(editor, {
      theme: "snow",
      modules: {
        toolbar: toolbarOptions,
      },
    });
    createQuill.disable();
    createQuill.setText("Loading...");
    setQuill(createQuill);
  }, []);


  if(location.state) {
    return (
      <div className="flex flex-col items-center">
        <Documentheader
          url={documentId}
          userEmail={userEmail}
          userId={userId}
          userName={userName}
          userPic={userPic}
          creatorId={creatorId}
          creatorPic={creatorPic}
          editorArr={editorArr}
          documentTitle={showTitle}
          editorOnlyArr={editorOnlyArr}
          viewerArr={viewerArr}
        />
        <div className="container" ref={wrapperRef}></div>
      </div>
    );
  } else {
    return <Navigate to={"/login"} />
  }
}
