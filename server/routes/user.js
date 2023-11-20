const express = require("express");
const jwt = require("jsonwebtoken");
const { SECRET, authenticateJwt } = require("../middleware/auth");
const { User, Course } = require("../database/models");
const z = require("zod");
const Razorpay = require("razorpay");

const router = express.Router();

var instance = new Razorpay({
  key_id: "rzp_test_De1qw413NLBPEG",
  key_secret: "NqjCPjpDjbc5cqiS3TLiIjse",
});

let signupProps = z.object({
  username: z.string().min(1).max(50).email(),
  password: z
    .string()
    .min(8, "Password must be atleast 8 characters")
    .max(50, "Password must be less than 50 characters"),
});

router.post("/signup", async (req, res) => {
  const parsedInput = signupProps.safeParse(req.body);
  if (!parsedInput.success) {
    res.status(411).json({ message: parsedInput.error.issues[0].message });
    return;
  }
  const username = parsedInput.data.username;
  const password = parsedInput.data.password;

  const user = await User.findOne({ username });
  if (user) {
    res.status(403).json({ message: "User already exists" });
  } else {
    const newUser = new User({ username, password });
    await newUser.save();
    const token = jwt.sign({ username, role: "user" }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "User created successfully", token });
  }
});

router.get("/me", authenticateJwt, (req, res) => {
  res.json(req.user.username);
});

router.post("/login", async (req, res) => {
  const parsedInput = signupProps.safeParse(req.body);
  if (!parsedInput.success) {
    res.status(411).json({ message: parsedInput.error.issues[0].message });
    return;
  }
  const username = parsedInput.data.username;
  const password = parsedInput.data.password;
  const user = await User.findOne({ username, password });
  if (user) {
    const token = jwt.sign({ username, role: "user" }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Logged in successfully", token });
  } else {
    res.status(403).json({ message: "Invalid username or password" });
  }
});

router.get("/courses", authenticateJwt, async (req, res) => {
  const courses = await Course.find({ published: true });
  if (courses) {
    res.json({ courses });
  } else {
    res.json({ message: "Empty" });
  }
});

router.post("/razorpay/:courseId", authenticateJwt, async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  var options = {
    amount: course.price, // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11",
  };
  try {
    const order = await instance.orders.create(options);
    console.log(order);
    res.json({
      orderID: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error) {
    console.log(err);
  }
});

router.post("/courses/:courseId", authenticateJwt, async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (course) {
    const user = await User.findOne({ username: req.user.username });
    if (user) {
      user.purchasedCourses.push(course);
      await user.save();
      res.json({
        message: "Course purchased successfully",
        purchasedCourse: course,
      });
    } else {
      res.status(403).json({ message: "User not found" });
    }
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

router.post("/verification", (req, res) => {
  const secret = "razorpaysecret";

  console.log(req.body);

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  console.log(digest, req.headers["x-razorpay-signature"]);

  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("request is legit");
    res.status(200).json({
      message: "OK",
    });
  } else {
    res.status(403).json({ message: "Invalid" });
  }
});

router.get("/courses/:courseId", authenticateJwt, async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (course) {
    res.json({ course });
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

router.get("/purchasedCourses", authenticateJwt, async (req, res) => {
  const user = await User.findOne({ username: req.user.username }).populate(
    "purchasedCourses"
  );
  if (user) {
    res.json({ purchasedCourses: user.purchasedCourses || [] });
  } else {
    res.status(403).json({ message: "User not found" });
  }
});

module.exports = router;
