const express = require("express");
const cors = require("cors");
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");
require("./database/connect");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/admin", adminRouter);
app.use("/users", userRouter);
app.use(express.static("public"));
app.use("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.listen(3000, () => console.log("Server running on port 3000"));
