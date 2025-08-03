import { CiMail } from "react-icons/ci";
import { TbPasswordUser } from "react-icons/tb";
import { Link } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
            name:"",
            email:"",
            password:""
        });
    
    const handleChange = (e) =>{
        setForm({...form, [e.target.name]:e.target.value});
    };

    const handleSubmit = async (e)=>{
        e.preventDefault();

        if (!form.name || !form.email || !form.password){
            toast.error("Please enter all fields", { duration: 3000 });
            return;
        }

        if (!form.email.endsWith("@nitc.ac.in")) {
            toast.success("Only NITC mails are expected", { duration: 3000 });
            return res.status(403).json({ message: "Only NITC emails are allowed" }); 
        }


        try {
            const res = await axios.post(`${baseURL}/api/auth/register`, form);
            localStorage.setItem("token", res.data.token);
            window.dispatchEvent(new Event("authChange"));
            console.log(res.data)
            toast.success("Registered successfully", { duration: 3000 });
            navigate("/browse");
        } catch (err) {
            toast.error("Registration failed", { duration: 3000 });
            console.error("Register error:", err);
        }
    };

    return (
        <div>
            <div className="bg-[#FAECB6] min-h-screen flex items-center justify-center">
                <div className="w-full max-w-sm md:max-w-md lg:max-w-mg bg-[#F96635] border-black border-4 items-center rounded-xl shadow-[6px_6px_0_#000000]">
                    <div>
                        <div className="flex items-center justify-between px-4 py-2">
                            <div className="flex space-x-2">
                            <span className="w-3 h-3 bg-red-500 rounded-full border-2 border-black shadow-[1px_1px_0_#000000]" />
                            <span className="w-3 h-3 bg-yellow-400 rounded-full border-2 border-black shadow-[1px_1px_0_#000000]" />
                            <span className="w-3 h-3 bg-green-500 rounded-full border-2 border-black shadow-[1px_1px_0_#000000]" />
                            </div>
                            <h2 className="text-xl font-heading font-extrabold text-gray-800">REGISTER</h2>
                        </div>

                        {/* FULL-WIDTH LINE */}
                        <div className="h-[3px] w-full bg-black mb-2" />
                    </div>
                    
                    <p className=" font-heading text-xs md:text-sm text-gray-800 text-center">Already have an account ? <span className="text-white" ><Link to="/login" className="hover:text-black transition">Login</Link></span>
                                        </p>
                    <div className="w-full flex flex-col gap-3 px-4 py-2">
                        <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="border-black border-2 shadow-[2px_2px_0_#000000] w-full flex items-center bg-gray-800 p-2 rounded-xl gap-3">
                            <CgProfile color="white"/>
                            <input 
                            name="name"
                            type="name"
                            onChange={handleChange}
                            placeholder="Enter your Name" 
                            className="font-heading bg-transparent border-0 w-full outline-none text-sm md:text-base text-white"></input>
                        </div>

                        <div className="border-black border-2 shadow-[2px_2px_0_#000000] w-full flex items-center bg-gray-800 p-2 rounded-xl gap-3">
                            <CiMail color="white"/>
                            <input
                            name="email"
                            type="email"
                            onChange={handleChange}
                            placeholder="Enter your NITC email id" 
                            className="font-heading bg-transparent border-0 w-full outline-none text-sm md:text-base text-white"></input>
                        </div>

                        <div className="border-black border-2 shadow-[2px_2px_0_#000000] w-full flex items-center bg-gray-800 p-2 rounded-xl gap-3 relative">
                            <TbPasswordUser color="white"/>
                            <input 
                            name="password"
                            type="password" 
                            onChange={handleChange}
                            placeholder="Enter your password" 
                            className="font-heading bg-transparent border-0 w-full outline-none text-sm md:text-base text-white"></input>
                        </div>

                        <button 
                        name="submit"
                        type="submit"
                        className="font-heading w-full p-2 bg-[#F9A822] border-black border-2 shadow-[2px_2px_0_#000000] rounded-xl hover:bg-blue-600 text-sm md:text-base text-black font-bold">Register</button>

                        </form>
                    </div>
                    
                </div>
            </div>
        </div>


    );
}
