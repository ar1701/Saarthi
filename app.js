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
const QuizResult = require("./model/quiz.js");

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

app.use((req, res) => {
  res.redirect(301, "https://vercel-saarthi.vercel.app/" + req.originalUrl);
});


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
  res.locals.currentPage = req.path.split("/")[1] || "home";
  next();
});

let port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("listening to the port " + port);
});

// Routes
app.get("/", (req, res) => {
  res.redirect("/main");
});

app.get("/index", isLoggedIn, (req, res) => {
  res.render("index.ejs", { currentPage: "home" });
});

app.get("/about", isLoggedIn, (req, res) => {
  res.render("about.ejs", { currentPage: "about" });
});

app.get("/contact", isLoggedIn, (req, res) => {
  res.render("contact.ejs", { currentPage: "contact" });
});

app.get("/team", isLoggedIn, (req, res) => {
  res.render("team.ejs", { currentPage: "team" });
});

app.get("/testimonial", isLoggedIn, (req, res) => {
  res.render("testimonial.ejs", { currentPage: "testimonial" });
});

app.get("/courses", isLoggedIn, (req, res) => {
  res.render("courses.ejs", { currentPage: "courses" });
});

app.get("/form", isLoggedIn, (req, res) => {
  res.render("form.ejs", { currentPage: "form" });
});

app.get("/search", isLoggedIn, (req, res) => {
  res.render("search.ejs", { currentPage: "search" });
});

app.get("/syllabus", isLoggedIn, (req, res) => {
  res.render("syllabus.ejs", { currentPage: "syllabus" });
});

app.get("/ask", isLoggedIn, (req, res) => {
  res.render("ask.ejs", { currentPage: "ask" });
});

app.get("/chat", isLoggedIn, (req, res) => {
  res.render("chat.ejs", { currentPage: "chat" });
});

app.get("/main", (req, res) => {
  res.render("main.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.get("/grading", isLoggedIn, (req, res) => {
  res.render("grading.ejs", { currentPage: "grading" });
});

app.get("/essay-writer", isLoggedIn, (req, res) => {
  res.render("essay-writer.ejs", { currentPage: "essay-writer" });
});

app.get("/code-explainer", isLoggedIn, (req, res) => {
  res.render("code-explainer.ejs", { currentPage: "code-explainer" });
});

app.get("/study-planner", isLoggedIn, (req, res) => {
  res.render("study-planner.ejs", { currentPage: "study-planner" });
});

app.get("/flashcard-generator", isLoggedIn, (req, res) => {
  res.render("flashcard-generator.ejs", { currentPage: "flashcard-generator" });
});

app.get("/quiz-generator", isLoggedIn, (req, res) => {
  res.render("quiz-generator.ejs", { currentPage: "quiz-generator" });
});

// Policy Pages
app.get("/privacy-policy", (req, res) => {
  res.render("privacy-policy.ejs", { currentPage: "privacy-policy" });
});

app.get("/terms-of-service", (req, res) => {
  res.render("terms-of-service.ejs", { currentPage: "terms-of-service" });
});

app.get("/cookie-policy", (req, res) => {
  res.render("cookie-policy.ejs", { currentPage: "cookie-policy" });
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login?error=Invalid username or password",
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
    res.json({ result: result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error:
        "I apologize, but I'm having trouble generating the syllabus right now. Please try again in a moment.",
    });
  }
});

// New AI-powered features
app.post("/essay-writer", isLoggedIn, async (req, res) => {
  try {
    const { topic, type, length } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Write a ${type} essay on "${topic}" with approximately ${length} words.

Guidelines:
- Use clear, engaging language
- Include an introduction, body paragraphs, and conclusion
- Provide relevant examples and evidence
- Use proper essay structure and formatting
- Make it educational and informative
- Use markdown formatting for better readability

Please write a well-structured essay:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ result: text });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error:
        "I apologize, but I'm having trouble generating the essay right now. Please try again in a moment.",
    });
  }
});

app.post("/code-explainer", isLoggedIn, async (req, res) => {
  try {
    const { code, language } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Explain this ${language} code in detail:

\`\`\`${language}
${code}
\`\`\`

Please provide:
1. A clear explanation of what the code does
2. Line-by-line breakdown of important parts
3. Key concepts and programming principles used
4. Potential improvements or optimizations
5. Common use cases for this type of code

Use markdown formatting for better readability.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ result: text });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error:
        "I apologize, but I'm having trouble explaining the code right now. Please try again in a moment.",
    });
  }
});

app.post("/study-planner", isLoggedIn, async (req, res) => {
  try {
    const { subjects, hours, days, goals } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Create a personalized study plan for a student with the following requirements:

Subjects: ${subjects}
Available study hours per day: ${hours}
Study days per week: ${days}
Learning goals: ${goals}

Please provide:
1. A weekly study schedule
2. Time allocation for each subject
3. Study techniques and strategies
4. Break and rest periods
5. Progress tracking methods
6. Tips for maintaining motivation

Use markdown formatting and make it practical and achievable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ result: text });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error:
        "I apologize, but I'm having trouble creating the study plan right now. Please try again in a moment.",
    });
  }
});

app.post("/flashcard-generator", isLoggedIn, async (req, res) => {
  try {
    const { topic, subject, count } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate ${count} flashcards for ${subject} on the topic: "${topic}"

Format each flashcard as:
**Question:** [Clear, concise question]
**Answer:** [Detailed, educational answer]

Guidelines:
- Questions should test understanding, not just memorization
- Answers should be comprehensive but concise
- Include a mix of difficulty levels
- Cover key concepts and important details
- Make them engaging and educational

Use markdown formatting for better readability.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ result: text });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error:
        "I apologize, but I'm having trouble generating flashcards right now. Please try again in a moment.",
    });
  }
});

// Quiz Generator - Generate Quiz Questions
app.post("/quiz-generator", isLoggedIn, async (req, res) => {
  try {
    const { topic, difficulty, type, count } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const enhancedPrompt = `Generate a ${difficulty} level quiz on the topic: "${topic}" with exactly ${count} ${type} questions.

IMPORTANT: You must respond with ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "questionNumber": 1,
      "question": "What is the capital of France?",
      "options": ["A. London", "B. Paris", "C. Berlin", "D. Madrid"],
      "correctAnswer": "B",
      "explanation": "Paris is the capital and largest city of France."
    }
  ]
}

Requirements:
- For MCQ questions: Always provide exactly 4 options labeled A, B, C, D
- For Subjective questions: Use the options field for key points and explanation for detailed answer
- Make questions appropriate for ${difficulty} difficulty level
- Include clear, educational explanations
- Ensure questions test understanding, not just memorization
- Do not include any text before or after the JSON object
- The response must be valid JSON that can be parsed directly

Generate exactly ${count} questions for the topic: ${topic}`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON, if it fails, try to extract JSON from the response
    try {
      const quizData = JSON.parse(text);
      res.json({ quiz: quizData, topic, difficulty, type, count });
    } catch (parseError) {
      // Try to extract JSON from the response if it contains extra text
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extractedJson = JSON.parse(jsonMatch[0]);
          res.json({ quiz: extractedJson, topic, difficulty, type, count });
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (extractError) {
        res.status(500).json({
          error:
            "Failed to generate structured quiz. Please try again with a different topic.",
        });
      }
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Failed to generate quiz. Please try again.",
    });
  }
});

// Submit Quiz Answers
app.post("/submit-quiz", isLoggedIn, async (req, res) => {
  try {
    const { topic, difficulty, type, count, answers, timeTaken } = req.body;
    const userId = req.user._id;

    // Calculate score
    let correctAnswers = 0;
    const userAnswers = [];

    for (let i = 0; i < answers.length; i++) {
      const userAnswer = answers[i].userAnswer;
      const correctAnswer = answers[i].correctAnswer;
      const isCorrect = userAnswer === correctAnswer;

      if (isCorrect) correctAnswers++;

      userAnswers.push({
        questionNumber: i + 1,
        userAnswer,
        correctAnswer,
        isCorrect,
      });
    }

    const score = Math.round((correctAnswers / answers.length) * 100);

    // Save to database
    const quizResult = new QuizResult({
      user: userId,
      topic,
      difficulty,
      questionType: type,
      totalQuestions: parseInt(count),
      correctAnswers,
      score,
      userAnswers,
      timeTaken: parseInt(timeTaken),
    });

    await quizResult.save();

    res.json({
      success: true,
      score,
      correctAnswers,
      totalQuestions: answers.length,
      userAnswers,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Failed to submit quiz. Please try again.",
    });
  }
});

// Get Quiz History
app.get("/quiz-history", isLoggedIn, async (req, res) => {
  try {
    const quizResults = await QuizResult.find({ user: req.user._id })
      .sort({ completedAt: -1 })
      .limit(10);

    res.json({ quizResults });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Failed to fetch quiz history.",
    });
  }
});

app.post("/ask", isLoggedIn, async (req, res) => {
  try {
    let { question } = req.body;
    let result = await textQuery(question);
    res.json({ result: result });
  } catch (error) {
    console.error("Error in /ask:", error);

    // Check if it's a Gemini API overload error
    if (error.status === 503 || error.message?.includes("overloaded")) {
      return res.status(503).json({
        error:
          "The AI service is currently experiencing high traffic. Please try again in a few minutes.",
      });
    }

    res.status(500).json({
      error:
        "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
    });
  }
});

app.post("/chat", isLoggedIn, async (req, res) => {
  try {
    const userInput = req.body.message;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Enhanced prompt for better structured responses
    const enhancedPrompt = `You are an AI educational assistant for Saarthi, an innovative learning platform. 

Please provide clear, structured, and educational responses to the user's question. Follow these guidelines:

1. **Structure your response** with clear headings using markdown (## for main sections, ### for subsections)
2. **Use bullet points** for lists and key concepts
3. **Include examples** where helpful
4. **Keep explanations** concise but comprehensive
5. **Use bold text** for important terms and concepts
6. **Format code** using \`code blocks\` when applicable
7. **Be encouraging** and supportive in your tone
8. **Adapt to the user's level** - assume they are a student seeking to learn

User Question: ${userInput}

Please provide a well-structured educational response:`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ message: text });
  } catch (error) {
    console.error("Error in /chat:", error);

    // Check if it's a Gemini API overload error
    if (error.status === 503 || error.message?.includes("overloaded")) {
      return res.status(503).json({
        message:
          "The AI service is currently experiencing high traffic. Please try again in a few minutes.",
      });
    }

    res.status(500).json({
      message:
        "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
    });
  }
});

app.post("/form", isLoggedIn, upload.single("image"), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Enhanced prompt for image analysis
    const enhancedPrompt = `You are an AI educational assistant analyzing an image that contains a problem or question. 

Please provide a comprehensive, well-structured solution following these guidelines:

1. **Start with a clear overview** of what you see in the image
2. **Break down the problem** into understandable steps
3. **Provide the solution** with detailed explanations
4. **Use markdown formatting** for better structure:
   - Use ## for main sections
   - Use ### for subsections
   - Use bullet points for lists
   - Use **bold** for important terms
   - Use \`code\` for mathematical expressions or code
5. **Include relevant concepts** and explanations
6. **Be encouraging** and educational in your tone
7. **If it's a math problem**, show step-by-step calculations
8. **If it's a conceptual question**, provide clear explanations with examples

Please analyze the image and provide a structured educational response:`;

    const imageParts = [
      {
        inlineData: {
          data: fs.readFileSync(req.file.path).toString("base64"),
          mimeType: "image/jpeg",
        },
      },
    ];

    const result = await model.generateContent([enhancedPrompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ result: text });
  } catch (error) {
    console.error("Error in /form:", error);
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Check if it's a Gemini API overload error
    if (error.status === 503 || error.message?.includes("overloaded")) {
      return res.status(503).json({
        error:
          "The AI service is currently experiencing high traffic. Please try again in a few minutes.",
      });
    }

    res.status(500).json({
      error:
        "I apologize, but I'm having trouble analyzing your image right now. Please try again with a clearer image.",
    });
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
  res.redirect("/main");
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
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
      console.error(`Error in problemSolving (attempt ${attempt}):`, error);
      lastError = error;

      // If it's an overload error, wait before retrying
      if (error.status === 503 || error.message?.includes("overloaded")) {
        if (attempt < maxRetries) {
          console.log(
            `Gemini API overloaded, retrying in ${attempt * 2} seconds...`
          );
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
          continue;
        }
      }

      // For other errors or after max retries, throw the error
      throw error;
    }
  }

  throw lastError;
}

async function textQuery(query) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const enhancedPrompt = `You are an AI educational assistant for Saarthi. Please provide a clear, structured response to: "${query}"

Guidelines:
- Use markdown formatting for structure
- Include bullet points for key concepts
- Use **bold** for important terms
- Be educational and encouraging
- Keep it concise but comprehensive`;

      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();
      return text;
    } catch (error) {
      console.error(`Error in textQuery (attempt ${attempt}):`, error);
      lastError = error;

      // If it's an overload error, wait before retrying
      if (error.status === 503 || error.message?.includes("overloaded")) {
        if (attempt < maxRetries) {
          console.log(
            `Gemini API overloaded, retrying in ${attempt * 2} seconds...`
          );
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
          continue;
        }
      }

      // For other errors or after max retries, throw the error
      throw error;
    }
  }

  throw lastError;
}

async function syllabusGen(std, sub) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const enhancedPrompt = `Generate a comprehensive syllabus for ${std} grade ${sub} subject based on current National Educational Policy (NEP 2020).

Please structure the response with:
- Clear section headings using markdown (## for main sections, ### for subsections)
- Organized topics and subtopics
- Learning objectives for each unit
- Suggested activities and assessments
- Duration for each unit
- Key skills to be developed

Guidelines:
- Adapt content to the age and cognitive level of ${std} students
- Include modern pedagogical approaches
- Focus on skill development and practical application
- Use bullet points for better readability
- Make it engaging and student-friendly

Please provide a well-structured syllabus:`;

      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();
      return text;
    } catch (error) {
      console.error(`Error in syllabusGen (attempt ${attempt}):`, error);
      lastError = error;

      // If it's an overload error, wait before retrying
      if (error.status === 503 || error.message?.includes("overloaded")) {
        if (attempt < maxRetries) {
          console.log(
            `Gemini API overloaded, retrying in ${attempt * 2} seconds...`
          );
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
          continue;
        }
      }

      // For other errors or after max retries, throw the error
      throw error;
    }
  }

  throw lastError;
}
