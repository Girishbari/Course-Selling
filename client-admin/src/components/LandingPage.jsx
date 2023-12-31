"@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { Main, openState } from "./AppNavBar";
import { adminIsLoggedInState } from "../store/selectors/adminIsLoggedIn";
import { Typography } from "@mui/material";

import "./style.css";

function LandingPage() {
  const [isLoggedIn] = useRecoilState(adminIsLoggedInState);
  const [open] = useRecoilState(openState);
  const navigate = useNavigate();
  console.log(isLoggedIn);
  return (
    <Main open={open}>
      <div className="landing-page-container">
        <div className="text-content">
          <Typography variant="h1" component="h2">
            Admin DashBoard
          </Typography>

          <button
            className="button-style"
            onClick={() => navigate(isLoggedIn ? "/courses" : "/login")}
          >
            {isLoggedIn ? "View Courses" : "Login Here"}
          </button>
        </div>
        <div>
          <img
            className="img-content"
            src="https://opensource.com/sites/default/files/lead-images/browser_web_internet_website.png"
            alt=""
          />
        </div>
      </div>
    </Main>
  );
}

export default LandingPage;
