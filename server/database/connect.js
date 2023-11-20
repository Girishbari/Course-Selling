const mongoose = require("mongoose");
require("dotenv").config();

const DB_CONNECT =
  "mongodb+srv://nelege1198:VvhO75diGN6YZ3Xj@cluster0.a9ajmib.mongodb.net/courses";

mongoose
  .connect(DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "courses",
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
