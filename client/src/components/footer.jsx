import { Link, useNavigate } from "react-router-dom";
import {useState, useEffect, useRef} from "react";
import { FaUserCircle,FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {

    return (
    <div className="bg-[#2BBAA5]">
        <nav className="flex items-center justify-between px-6 py-4 font-title">
            <h2 className="text-sm">Created by Sanjay</h2>
            
            <div className="flex gap-4 text-black font-medium ">
            <Link to="https://github.com/sanjaydevs" className="hover:text-[#FAECB6] transition">
            <FaGithub className="size-8"/>
            </Link>
            <Link to="https://www.linkedin.com/in/sanjay-s-74551a2ba/" className="hover:text-[#FAECB6] transition">
            <FaLinkedin className="size-8 " />
            </Link>
            </div>
        </nav>
    </div>
    );
};

export default Footer;