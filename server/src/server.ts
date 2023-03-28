import * as dotenv from 'dotenv';
dotenv.config();
const PORT: string | number = process.env.PORT || 3001;
import http from "http";
import express, { Request, Response, NextFunction } from "express";
// import socketio from "socket.io";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Documents from "./dbSchema/Document.js";
import User from "./dbSchema/User.js";
import passport from "passport";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import session from "express-session";
const app = express();
const server = http.createServer(app);
// const io = socketio(server);
const io = new Server(server);
import { DBUser } from "./Interfaces/Interface.js";

import {findDocumentByEmail, findUserByEmail, findOrCreateDocument} from "./queries.js";


// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());
import {passportConfig} from "./passportConfig.js";
passportConfig(passport);


//create mongoose connection
const MongoDbId = process.env.MongoDB_URL || "";
mongoose
  .connect(MongoDbId)
  .then(() => {
    console.log("Connected to MongoDB atlas.");
  })
  .catch((err) => {
    console.log("Connected Failed.");
    console.log(err);
  });


// socket connect in server
io.on("connection", (socket) => {
  socket.on("get-document", async (documentId, userEmail) => {
    const document = await findOrCreateDocument(documentId, userEmail);
    socket.join(documentId);
    socket.emit("load-document", document);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Documents.findOneAndUpdate({ URL: documentId }, { data: data });
    });
  });
});


// Routes
app.post("/api/login", (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Please include email AND password");
  };
  passport.authenticate("local", (err: unknown, user: Express.User) => {
    if (err) throw err;
    if (!user) res.status(400).send("No User Exists");
    else {
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.send(req.user);
      });
    }
  })(req, res, next);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000/users/dashboard",
    failureRedirect: "http://localhost:3000/login",
  })
);

app.post("/api/signup", (req, res, next) => {
  if (!req.body.email || !req.body.password || !req.body.username) {
    return res.status(400).send("Please include username, email, AND password");
  };

  User.findOne({ email: req.body.email }, async (err: unknown, doc: DBUser) => {
    if (err) {
      return next(err);
    };

    if (doc) {res.status(400).send("User Already Exists")};

    if (!doc) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);     
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      });
      await newUser.save();
      passport.authenticate("local", (err: unknown, user: Express.User) => {
        if (err) {
          return next(err);
        }
        if (!user) res.send("No User Exists");
        else {
          req.logIn(user, (err) => {
            if (err) {
              return next(err);
            }
            res.send(req.user);
          });
        }
      })(req, res, next);
    }
  });
});

app.post("/api/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

const checkAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

app.get("/api/users/dashboard", checkAuthenticated, async (req, res) => {
  if(!req.user) return res.status(401).send("Unauthorized");
  const findDocument = await findDocumentByEmail(req.user.email);
  const dataForDashboard = {
    userDocuments: findDocument,
    user: req.user
  };
  
  res.send(dataForDashboard);
});

app.post("/api/users/changeTitle", async (req, res) => {
  await Documents.updateOne({URL: req.body.URL},{title: req.body.title});
  res.status(200);
});

//Delete document
app.post("/api/users/delete", async (req, res) => {
  await Documents.deleteOne({ _id: req.body.id });
  res.status(200);
});


// gmail API
import sendMail from "./gmailAPI/gmail.js";

const gmailAPI = async (text: string, email: string, senderName: string, receiverName: string) => {
  const options = {
    to: email,
    subject: `Hello ${receiverName} 🚀`,
    html: `<p>🙋🏻‍♀️  &mdash; ${senderName} shared a document with you: \n ${text}</p>`,
    textEncoding: "base64",
    headers: [
      { key: "X-Application-Developer", value: "Luke Li" },
      { key: "X-Application-Version", value: "v1.0.0.2" },
    ],
  };

  const messageId = await sendMail(options);
  return messageId;
};

//add editor
const addEditorByURL = async (email: string, URL: string, viewOnly: boolean) => {
  const editor = await findUserByEmail(email);
  const document = await Documents.findOne({ URL: URL });
  if(!document) throw new Error("Document not found");

  if (viewOnly) {
    document.view_access.push(editor[0]._id);
    const addEditor = await document.save();
    return addEditor;
  } else {
    document.view_edit_access.push(editor[0]._id);
    const addEditor = await document.save();
    return addEditor;
  }
};

app.post("/api/send_mail", async (req, res) => {
  let { text, sendToEmail, url, viewOnly, senderName } = req.body;
  const receiver = await User.findOne({ email: sendToEmail });
  if (!receiver) {
    return res.send("Oops! Can't find the user.");
  }
  const receiverName = receiver.username;
  addEditorByURL(sendToEmail, url, viewOnly)
    .then(() => gmailAPI(text, sendToEmail, senderName, receiverName))
    .then((messageId) => console.log("Message sent successfully:", messageId))
    .catch((err) => console.error(err));
});

// add user's picture
// const updatePic = async (e, p) => {
//   let changePic = await User.updateOne({ email: e }, { profilePic: p });
//   return changePic;
// };
// updatePic("thomastank0926@gmail.com", "https://i.pinimg.com/originals/87/31/91/873191b4606bfec20e44f4ad2bbcee30.jpg")

server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));