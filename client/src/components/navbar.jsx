import { Link, useNavigate } from "react-router-dom";
import {useState, useEffect, useRef} from "react";
import { FaUserCircle } from "react-icons/fa";
import toast from "react-hot-toast";

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
      <div className="w-full flex justify-center bg-[#FAECB6] py-4">
        <nav className="w-[90%] max-w-6xl flex items-center justify-between px-6 py-3 border-2 border-black rounded-xl shadow-[4px_4px_0_#000000] bg-[#2BBAA5]">
            <Link to="/" className="text-2xl font-bold text-black font-brand">
            BOOKSHARE
            </Link>
            
            <div className="flex gap-4 text-black font-medium ">
            <Link to="/browse" className=" font-heading font-extrabold text-lg hover:text-[#FAECB6] transition">
                Browse
            </Link>
            
            {isLoggedin ? (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1 font-heading font-extrabold text-lg hover:text-[#FAECB6] transition"
        >
          <FaUserCircle size={22} />
          <span className="hidden sm:inline">Profile</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg z-10 py-2">
            <Link
              to="/dashboard"
              className="font-heading font-extrabold text-sm block px-4 py-2 hover:bg-gray-100"
              onClick={() => setDropdownOpen(false)}
            >
              My Dashboard
            </Link>
            <Link
              to="/add-book"
              className="font-heading font-extrabold text-sm block px-4 py-2 hover:bg-gray-100"
              onClick={() => setDropdownOpen(false)}
            >
              Add Book
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.dispatchEvent(new Event("authChange"));
                toast.success("Logged out successfully", { duration: 1000});
                navigate("/");
              }}
              className="font-heading font-extrabold text-sm w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    ) : (
      <>
        <Link to="/register" className="font-heading font-extrabold text-lg hover:text-[#FAECB6] transition0">Register</Link>
        <Link to="/login" className="font-heading font-extrabold text-lg hover:text-[#FAECB6] transition">Login</Link>
      </>
    )}
            </div>
        </nav>
    </div>
    );
};

export default Navbar;