require("dotenv").config();
const PORT = process.env.PORT || 3001;
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const Document = require("./databaseSchema/Document");
const User = require("./databaseSchema/User");
const {
  findDocumentByUserID,
  findUserByID,
  findDocumentByEmail,
  findUserByEmail,
  findByTitle,
} = require("./queries");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoDbId = process.env.MongoDB_URL;

const { resolve } = require("path");
const nodemailer = require("nodemailer");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
//const cors = require("cors");
// const bodyParser = require("body-parser")
// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json());

// Middleware
// app.use(
//   cors({
//     origin: "http://localhost:3000", // <-- location of the react app were connecting to
//     methods: ["GET", "POST"],
//   })
// );
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
require("./passportConfig")(passport);
//app.use(cors());

//create mongoose connection
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
    // console.log("AA", userEmail);
    socket.join(documentId);
    socket.emit("load-document", document);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });
    socket.on("save-document", async (data) => {
      await Document.findOneAndUpdate({ URL: documentId }, { data: data });
    });
  });
});

const defaultValue = "";

async function findOrCreateDocument(URL, email) {
  const findUserarry = await findUserByEmail(email);
  // console.log("!!!email", email);

  if (URL == null) return;
  const document = await Document.findOne({ URL: URL });
  if (document) {
    if (
      document.view_access.includes(findUserarry[0]._id) ||
      document.view_edit_access.includes(findUserarry[0]._id)
    ) {
      return document;
    }
  }
  return await Document.create({
    URL: URL,
    data: defaultValue,
    creator: findUserarry[0]._id,
    view_edit_access: [findUserarry[0]._id],
  });
}

//select data

// Document.find({ veiw_edit_access: "638c18ed82726ced756881ab" }).then((data) => {
//   console.log("ffff", data);
// });

//findDocumentByUserID("63866ba3d03a71f9898745b8");
//async function aaa() {
//  const aa = findUserByID("63866ba3d03a71f9898745b8");
//  console.log("aa", aa);
//}
//console.log("11111", findDocumentByEmail("lining04111223@gmail.com"));

// Routes
app.post("/api/login", (req, res, next) => {
  // console.log(req.body);
  passport.authenticate("local", (err, user) => {
    if (err) throw err;
    if (!user) res.send("No User Exists");
    else {
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.send(req.user);
        // console.log("lalala: ", req.user);
        // res.redirect('/users/dashboard');
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

checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

app.post("/api/signup", (req, res, next) => {
  User.findOne({ email: req.body.email }, async (err, doc) => {
    if (err) {
      return next(err);
    }
    if (doc) res.send("User Already Exists");
    if (!doc) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      });
      await newUser.save();
      passport.authenticate("local", (err, user) => {
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
            // res.redirect('/users/dashboard');
            // console.log(req.user);
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

app.get("/api/users/dashboard", checkAuthenticated, async (req, res) => {
  // console.log("333req.user:", req.user);
  const findDocument = await findDocumentByEmail(req.user.email);
  //console.log(findDocument);
  //Search tittle contain "AA"
  const search = await findByTitle("AA");
  //console.log("search", search);
  const dataForDashboard = {
    userDocuments: findDocument,
    user: req.user,
    searchedDocuments: search,
  };
  //console.log("aaaaa", dataForDashboard); // The req.user stores the entire user that has been authenticated inside of it.
  res.send(dataForDashboard);
});

//change title
const changeTitleByURL = async (title, URL) => {
  let changeTitle = await Document.updateOne({ URL: URL }, { title: title });
  return changeTitle;
};

app.post("/api/users/changeTitle", async (req, res) => {
  // console.log("title", req.body.title);
  await changeTitleByURL(req.body.title, req.body.URL);
});

//Delete document
app.post("/api/users/delete", async (req, res) => {
  // console.log("delete", req.body.id);
  await Document.deleteOne({ _id: req.body.id });
});

// nodemailer
// app.post("/api/send_mail", async (req, res) => {
//   let { text } = req.body;
//   const transport = nodemailer.createTransport({
//     host: process.env.MAIL_HOST,
//     port: process.env.MAIL_PORT,
//     secure: false, // TLS requires secureConnection to be false
//     auth: {
//       user: process.env.MAIL_USER,
//       pass: process.env.MAIL_PASS
//     },
//     tls: {
//       ciphers:'SSLv3'
//     }
//   });
//   console.log("text:", text);
//   console.log("host:", process.env.MAIL_HOST);

//   await transport.sendMail({
//     from: process.env.MAIL_FROM,
//     to: "tank@test.com",
//     subject: "test email",
//     html: `<div className="email" style="
//         border: 1px solid black;
//         padding: 20px;
//         font-family: sans-serif;
//         line-height: 2;
//         font-size: 20px;
//         ">
//         <h2>Here is your email!</h2>
//         <p>${text}</p>

//         <p>All the best, Darwin</p>
//       </div>
//     `
//   });
// });

// gmail API
const fs = require("fs");
const path = require("path");
const sendMail = require("./gmailAPI/gmail");

const main = async (text, email, senderName, receiverName) => {
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
const addEditorByURL = async (email, URL, viewOnly) => {
  const editor = await findUserByEmail(email);
  const document = await Document.findOne({ URL: URL });
  // console.log("document!!!: ", document);
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
  let receiverName = receiver.username;
  // console.log("text: ", text);
  // console.log("sendToEmail: ", sendToEmail);
  addEditorByURL(sendToEmail, url, viewOnly)
    .then(() => main(text, sendToEmail, senderName, receiverName))
    .then((messageId) => console.log("Message sent successfully:", messageId))
    .catch((err) => console.error(err));
});

// const updatePic = async (e, p) => {
//   let changePic = await User.updateOne({ email: e }, { profilePic: p });
//   return changePic;
// };

// updatePic("thomastank0926@gmail.com", "https://i.pinimg.com/originals/87/31/91/873191b4606bfec20e44f4ad2bbcee30.jpg")

server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
