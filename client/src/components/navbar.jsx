import { Link, useNavigate } from "react-router-dom";
import {useState, useEffect, useRef} from "react";
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
    const [isLoggedin,setIsLoggedin]=useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef();

    useEffect(() => {
    const checkAuth = () => {
    setIsLoggedin(!!localStorage.getItem("token"));
    };

    checkAuth();
    window.addEventListener("authChange", checkAuth);
    return () => window.removeEventListener("authChange", checkAuth);
    }, []);

    useEffect(() => {
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    return (
    <nav className="flex items-center justify-between px-6 py-4 shadow-md bg-sky-100">
        <Link to="/" className="text-2xl font-bold text-blue-600">
        NITC BookShare 📚
        </Link>
        
        <div className="flex gap-4 text-gray-700 font-medium ">
        <Link to="/browse" className="hover:text-blue-600 transition">
            Browse
        </Link>
        
        {isLoggedin ? (
  <div className="relative" ref={dropdownRef}>
    <button
      onClick={() => setDropdownOpen(!dropdownOpen)}
      className="flex items-center gap-1 hover:text-blue-400"
    >
      <FaUserCircle size={22} />
      <span className="hidden sm:inline">Profile</span>
    </button>

    {dropdownOpen && (
      <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg z-10 py-2">
        <Link
          to="/dashboard"
          className="block px-4 py-2 hover:bg-gray-100"
          onClick={() => setDropdownOpen(false)}
        >
          My Dashboard
        </Link>
        <Link
          to="/add-book"
          className="block px-4 py-2 hover:bg-gray-100"
          onClick={() => setDropdownOpen(false)}
        >
          Add Book
        </Link>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.dispatchEvent(new Event("authChange"));
            alert("Logged out successfully");
            navigate("/");
          }}
          className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
        >
          Logout
        </button>
      </div>
    )}
  </div>
) : (
  <>
    <Link to="/register" className="hover:text-blue-600">Register</Link>
    <Link to="/login" className="hover:text-blue-600">Login</Link>
  </>
)}
        </div>
    </nav>
    );
};

export default Navbar;