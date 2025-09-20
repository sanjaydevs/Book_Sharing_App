import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import './App.css';
import Home from "./pages/home";
import Browse from "./pages/browse";
import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import AddBook from "./pages/addBook";
import MyBooks from "./pages/myBooks";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import OauthSuccess from "./pages/oauthSuccess";
import UserProfile from "./pages/userProfile";

import { Toaster } from "react-hot-toast";

function App() {
  return (
    
    <Router>
      <div className="flex flex-col min-h-screen overflow-hidden">
    <Navbar />
    <Toaster
      position="top-right"
      toastOptions={{
        className:
          "border-2 border-black drop-shadow-[3px_3px_0_#000000] font-heading",
        style: {
          background: "#fff",
          color: "#000",
        },
      }}
    />
    <div className="flex-grow">
      <Routes>
        <Route path="/oauth-success" element={<OauthSuccess />} />
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-book" element={<AddBook />} />
        <Route path="/my-books" element={<MyBooks />} />
        <Route path="/:userId/profile" element={<UserProfile />} />
      </Routes>
    </div>
    <Footer />
    </div>
    </Router>
  );
}

export default App;

