import { Link } from "react-router-dom";

const Navbar = () => {
    return (
    <nav className="flex items-center justify-between px-6 py-4 shadow-md bg-sky-100">
        <Link to="/" className="text-2xl font-bold text-blue-600">
        NITC BookShare 📚
        </Link>
        <div className="flex gap-4 text-gray-700 font-medium ">
        <Link to="/add-book" className="hover:text-blue-600 transition">
            Add Book
        </Link>
        <Link to="/browse" className="hover:text-blue-600 transition">
            Browse
        </Link>
        <Link to="/login" className="hover:text-blue-600 transition">
            Login
        </Link>
        <Link to="/register" className="hover:text-blue-600 transition">
            Register
        </Link>
        </div>
    </nav>
    );
};

export default Navbar;