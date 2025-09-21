import { Link, useNavigate } from "react-router-dom";
import {useState, useEffect, useRef} from "react";
import { FaUserCircle,FaBars } from "react-icons/fa";
import toast from "react-hot-toast";
import BgLine from "../components/bgline";  
import {jwtDecode} from "jwt-decode";


const Navbar = () => {
    const [isLoggedin,setIsLoggedin]=useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [userId,setUserId]=useState("")
    const navigate = useNavigate();
    const dropdownRef = useRef();
    const menuRef=useRef();


    useEffect(() => {
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedin(true);

      try {
        const decoded = jwtDecode(token); // { id, email, ... }
        setUserId(decoded.userId);  // store it in state
      } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem("token");
      }
    } else {
      setIsLoggedin(false);
      setUserId(null);
    }
  };

  checkAuth();
  window.addEventListener("authChange", checkAuth);
  return () => window.removeEventListener("authChange", checkAuth);
}, []);

    useEffect(() => {
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        } if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
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

        {/* Desktop Navigation */}
        <div className="hidden sm:flex gap-4 text-black font-heading font-extrabold text-lg">
          <Link to="/browse" className="hover:text-[#FAECB6] transition">
            Browse
          </Link>

          {isLoggedin ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 hover:text-[#FAECB6] transition"
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
                    Requests
                  </Link>
                  <Link
                    to="/my-books"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Books
                  </Link>
                  <Link
                    to="/add-book"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Add Book
                  </Link>
                  
                  {userId && (
                    <Link
                      to={`/${userId}/profile`}
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.dispatchEvent(new Event("authChange"));
                      toast.success("Logged out successfully", { duration: 1000 });
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
              <Link to="/register" className="hover:text-[#FAECB6] transition">
                Register
              </Link>
              <Link to="/login" className="hover:text-[#FAECB6] transition">
                Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="sm:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <FaBars size={24} />
          </button>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div
            ref={menuRef}
            className="bg-red-300 font-extrabold font-heading absolute top-16 right-6 w-44 bg-white text-black rounded-lg shadow-lg z-50 flex flex-col py-2"
          >
            <Link
              to="/browse"
              className="px-4 py-2 hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              Browse
            </Link>
            {isLoggedin ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Requests
                </Link>
                <Link
                  to="/add-book"
                  className="px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Add Book
                </Link>
                {userId && (
                    <Link
                      to={`/${userId}/profile`}
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                  )}
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.dispatchEvent(new Event("authChange"));
                    toast.success("Logged out successfully", { duration: 1000 });
                    navigate("/");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;