import { CiMail } from "react-icons/ci";
import { TbPasswordUser } from "react-icons/tb";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const baseURL = import.meta.env.VITE_API_BASE_URL;

export default function Login() {

    const navigate = useNavigate();


    const [form, setForm] = useState({
        email:"",
        password:""
    });

    const handleChange = (e) =>{
        setForm({...form, [e.target.name]:e.target.value});
    };

    const handleSubmit = async (e)=>{
        e.preventDefault();

        if (!form.email || !form.password){
            alert("Please full all the fields");
            return;
        }


        try {
            console.log("Making login request to:", `${baseURL}/api/auth/login`);
            const res = await axios.post(`${baseURL}/api/auth/login`, form);
            localStorage.setItem("token", res.data.token);
            window.dispatchEvent(new Event("authChange"));
            console.log("Login successful:", res.data)
            alert("Login successful");
            navigate("/browse");
        } catch (err) {
            console.error("Login error:", err);
            if (err.response) {
                // Server responded with error status
                console.error("Error response:", err.response.data);
                alert(`Login failed: ${err.response.data.error || 'Unknown error'}`);
            } else if (err.request) {
                // Network error
                console.error("Network error:", err.request);
                alert("Login failed: Cannot connect to server. Please check your internet connection.");
            } else {
                // Other error
                console.error("Error:", err.message);
                alert(`Login failed: ${err.message}`);
            }
        }
    };

    return (
        <div>
            <div className="bg-[#FAECB6] min-h-screen flex items-center justify-center">
                <div className="w-full max-w-sm md:max-w-md lg:max-w-mg bg-[#F9A822] border-black border-4 items-center rounded-xl shadow-[6px_6px_0_#000000]">
                    
                    <div>
                        <div className="flex items-center justify-between px-4 py-2">
                            <div className="flex space-x-2">
                            <span className="w-3 h-3 bg-red-500 rounded-full border-2 border-black shadow-[1px_1px_0_#000000]" />
                            <span className="w-3 h-3 bg-yellow-400 rounded-full border-2 border-black shadow-[1px_1px_0_#000000]" />
                            <span className="w-3 h-3 bg-green-500 rounded-full border-2 border-black shadow-[1px_1px_0_#000000]" />
                            </div>
                            <h2 className="text-xl font-heading font-extrabold text-gray-800">LOGIN</h2>
                        </div>

                        {/* FULL-WIDTH LINE */}
                        <div className="h-[3px] w-full bg-black mb-2" />
                    </div >

                    <p className=" font-heading text-xs md:text-sm text-gray-800 text-center">Don't have an account ? <span className="text-white" ><Link to="/register" className="hover:text-black transition">Register</Link></span>
                    </p>

                    <div className="w-full flex flex-col gap-3 px-4 py-2">
                        <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="border-black border-2 shadow-[2px_2px_0_#000000] w-full flex items-center bg-gray-800 p-2 rounded-xl gap-3">

                            <CiMail color="white"/>
                            <input 
                            name="email"
                            value ={form.email}
                            onChange={handleChange}
                            type="email" 
                            placeholder="Enter your NITC email id" 
                            className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-white">
                            </input>
                        </div>

                        <div className="border-black border-2 shadow-[2px_2px_0_#000000] w-full flex items-center bg-gray-800 p-2 rounded-xl gap-3 relative">
                            <TbPasswordUser color="white"/>
                            <input 
                            name="password"
                            value ={form.password}
                            onChange={handleChange}
                            type="password" 
                            placeholder="Enter your password" 
                            className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-white">
                            </input>
                        </div>

                        <button
                        name="submit"
                        type="submit"
                        className="font-heading w-full p-2 bg-[#F96635] border-black border-2 shadow-[2px_2px_0_#000000] rounded-xl hover:bg-blue-600 text-sm md:text-base text-black font-bold">Login</button>

                        </form>

                    </div>
                </div>
            </div>
        </div>


    );
}
