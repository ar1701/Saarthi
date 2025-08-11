if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const cloudinary = require("cloudinary").v2;
const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const axios = require("axios");
const fs = require("fs");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const User = require("./model/user.js");
const Profile = require("./model/profile.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const LocalStrategy = require("passport-local");
const passport = require("passport");
const flash = require("connect-flash");
const { isLoggedIn } = require("./middleware.js");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const dbUrl = process.env.ATLASDB_URL;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const { storage } = require("./cloudConfig.js");

async function extractImage(url) {
  try {
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "arraybuffer",
    });
    return response.data;
  } catch (error) {
    console.error("Error extracting image:", error);
    throw error;
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 60 * 60,
});

store.on("error", (error) => {
  console.log("Error in MONGO SESSION STORE: ", error);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// Body parsing middleware - use only one set
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("public/images/", express.static("./public/images"));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => {
    console.log("Connection Succeeded");
  })
  .catch((err) => console.log(err));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

let port = 8080;
app.listen(port, () => {
  console.log("listening to the port " + port);
});

// Routes
app.get("/index", isLoggedIn, (req, res) => {
  res.render("index.ejs");
});

app.get("/about", isLoggedIn, (req, res) => {
  res.render("about.ejs");
});

app.get("/contact", isLoggedIn, (req, res) => {
  res.render("contact.ejs");
});

app.get("/team", isLoggedIn, (req, res) => {
  res.render("team.ejs");
});

app.get("/testimonial", isLoggedIn, (req, res) => {
  res.render("testimonial.ejs");
});

app.get("/courses", isLoggedIn, (req, res) => {
  res.render("courses.ejs");
});

app.get("/form", isLoggedIn, (req, res) => {
  res.render("form.ejs");
});

app.get("/search", isLoggedIn, (req, res) => {
  res.render("search.ejs");
});

app.get("/syllabus", isLoggedIn, (req, res) => {
  res.render("syllabus.ejs");
});

app.get("/ask", isLoggedIn, (req, res) => {
  res.render("ask.ejs");
});

app.get("/chat", isLoggedIn, (req, res) => {
  res.render("chat.ejs");
});

app.get("/main", (req, res) => {
  res.render("main.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.get("/grading", isLoggedIn, (req, res) => {
  res.render("grading.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    let { username } = req.body;
    req.session.user = { username };
    req.flash("success", "Welcome to Saarthi!");
    res.redirect("/index");
  }
);

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.post("/signup", async (req, res) => {
  try {
    let { username, email, phone, password } = req.body;
    req.session.user = { username, email, phone };
    const newUser = new User({ username, email, phone });

    await User.register(newUser, password);

    const newProfile = new Profile({
      user: newUser._id,
      gender: "",
      bio: "",
    });
    await newProfile.save();
    res.redirect("/login");
  } catch (e) {
    res.redirect("/signup");
  }
});

app.post("/syllabus", isLoggedIn, async (req, res) => {
  try {
    let { std, subject } = req.body;
    let result = await syllabusGen(std, subject);
    res.render("syl.ejs", { result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/ask", isLoggedIn, async (req, res) => {
  try {
    let { question } = req.body;
    let result = await textQuery(question);
    res.render("ask2.ejs", { result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/chat", isLoggedIn, async (req, res) => {
  try {
    const userInput = req.body.message;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(userInput);
    const response = await result.response;
    const text = response.text();

    res.json({ message: text }); // Response sent here
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" }); // Fallback response
  }
});

app.post("/form", isLoggedIn, upload.single("image"), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "";
    const imageParts = [
      {
        inlineData: {
          data: fs.readFileSync(req.file.path).toString("base64"),
          mimeType: "image/jpeg",
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ result: text }); // Sends JSON response
  } catch (error) {
    console.error("Error:", error);
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Internal server error" }); // Error response
  }
});

// Set up a route for logging out
app.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      console.error("Error logging out:", err);
      return next(err); // Forward the error to the error handler
    }
    res.redirect("/main"); // Only one response
  });
});

app.all("*", (req, res) => {
  res.redirect("/index");
});

function fileToGenerativePart(path, mimeType) {
  try {
    if (!fs.existsSync(path)) {
      throw new Error(`File not found: ${path}`);
    }
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType,
      },
    };
  } catch (error) {
    console.error(`Error reading file ${path}:`, error);
    throw error;
  }
}

async function problemSolving() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "";
    const imageParts = [fileToGenerativePart("prob.jpg", "image/jpeg")];
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    return text;
  } catch (error) {
    console.error("Error in problemSolving:", error);
    throw error;
  }
}

async function textQuery(query) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(query);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error in textQuery:", error);
    throw error;
  }
}

async function syllabusGen(std, sub) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate the Syllabus of ${std} for the subject ${sub} based on current National Educational Policy and always keep in mind the class of a student.Only generate the syllabus according the class age.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error in syllabusGen:", error);
    throw error;
  }
}
