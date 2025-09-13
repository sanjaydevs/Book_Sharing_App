import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OauthSuccess() {
  const navigate = useNavigate();

useEffect(() => {
  if (window.location.pathname !== "/oauth-success") return; // prevent re-run

  console.log("=== OAuth Debug Info ===");
  console.log("Full URL:", window.location.href);

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    localStorage.setItem("token", token);
    window.dispatchEvent(new Event("authChange"));
    navigate("/browse", { replace: true }); // <-- replace avoids stacking
  } else {
    console.error("No token found in URL");
    navigate("/register", { replace: true });
  }
}, [navigate]);


  return <p>Logging you in...</p>;
}
