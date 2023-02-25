require("dotenv").config();
const PORT = process.env.PORT || 3001;
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const Document = require("./databaseSchema/Document");
const User = require("./databaseSchema/User");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const {
  findDocumentByEmail,
  findUserByEmail,
  findOrCreateDocument
} = require("./queries");


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
require("./passportConfig")(passport);


//create mongoose connection
const MongoDbId = process.env.MongoDB_URL;
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
      await Document.findOneAndUpdate({ URL: documentId }, { data: data });
    });
  });
});


// Routes
app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) throw err;
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

const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

app.get("/api/users/dashboard", checkAuthenticated, async (req, res) => {
  const findDocument = await findDocumentByEmail(req.user.email);
  const dataForDashboard = {
    userDocuments: findDocument,
    user: req.user
  };
  
  res.send(dataForDashboard);
});

app.post("/api/users/changeTitle", async (req, res) => {
  await Document.updateOne({URL: req.body.URL},{title: req.body.title});
  res.status(200);
});

//Delete document
app.post("/api/users/delete", async (req, res) => {
  await Document.deleteOne({ _id: req.body.id });
  res.status(200);
});


// gmail API
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
    .then(() => main(text, sendToEmail, senderName, receiverName))
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
