import { Link, useNavigate } from "react-router-dom";
import {useState, useEffect, useRef} from "react";
import { FaUserCircle,FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {

    return (
    <nav className="flex items-center justify-between px-6 py-4 shadow-md bg-sky-100">
        <h2>Created by Sanjay</h2>
        
        <div className="flex gap-4 text-gray-700 font-medium ">
        <Link to="https://github.com/sanjaydevs" className="hover:text-blue-600">
        <FaGithub className="size-8"/>
        </Link>
        <Link to="https://www.linkedin.com/in/sanjay-s-74551a2ba/" className="hover:text-blue-600">
        <FaLinkedin className="size-8" />
        </Link>
        </div>
    </nav>
    );
};

export default Footer;