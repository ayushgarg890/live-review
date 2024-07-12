const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

const JWT_SECRET = "your_jwt_secret_key";

mongoose.connect("mongodb://localhost:27017/reviews", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

const reviewSchema = new mongoose.Schema({
  userId: String,
  title: String,
  content: String,
  dateTime: String,
});

const User = mongoose.model("User", userSchema);
const Review = mongoose.model("Review", reviewSchema);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).send("User registered");
  } catch (error) {
    res.status(400).send("User registration failed");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).send("Invalid credentials");
  }
  const token = jwt.sign({ userId: user._id }, JWT_SECRET);
  res.json({ token });
});


wss.on('connection', async (ws, req) => {
  const token = req.url.split('token=')[1];
  if (!token) {
    ws.close();
    return;
  }
  let user;
  try {
    user = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    ws.close();
    return;
  }
  const userId = user.userId;

  try {
    const reviews = await Review.find({ userId });
    ws.send(JSON.stringify({ type: 'INITIAL', reviews }));
  } catch (error) {
    console.error('Error fetching initial reviews:', error);
  }

  ws.on('message', async (message) => {
    const { type, review, id } = JSON.parse(message);
    if (type === 'ADD') {
      const newReview = new Review({
        title: review.title,
        content: review.content,
        dateTime: new Date().toISOString(),
        userId: userId,
      });
      try {
        const savedReview = await newReview.save();
        broadcast({ type: 'ADD', review: savedReview });
      } catch (error) {
        console.error('Error saving new review:', error);
      }
    } else if (type === 'EDIT') {
      try {
        
        const updatedReview = await Review.findByIdAndUpdate({_id:id}, { ...review }, { new: true });
        broadcast({ type: 'EDIT', review: updatedReview });
      } catch (error) {
        console.error('Error updating review:', error);
      }
    } else if (type === 'DELETE') {
      try {
        await Review.findByIdAndDelete(id);
        broadcast({ type: 'DELETE', id });
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    } else if (type === 'FETCH') {
      try {
        console.log(id);
        const fetchedReview = await Review.findOne({ _id: id });
        ws.send(JSON.stringify({ type: 'FETCH', review: fetchedReview }));
      } catch (error) {
        console.error('Error fetching review:', error);
      }
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
});

const broadcast = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on Port:${PORT}`);
});
