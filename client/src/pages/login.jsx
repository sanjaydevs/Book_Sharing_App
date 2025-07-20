import { CiMail } from "react-icons/ci";
import { TbPasswordUser } from "react-icons/tb";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
            const res = await axios.post("http://localhost:5000/api/auth/login", form);
            localStorage.setItem("token", res.data.token);
            window.dispatchEvent(new Event("authChange"));
            console.log(res.data)
            alert("Login successful");
            navigate("/browse");
        } catch (err) {
            alert("Login failed");
            console.error("Login error:", err);
        }
    };

    return (
        <div>
            <div className="w-full h-screen flex items-center justify-center">
                <div className="w-[90%] max-w-sm md:max-w-md lg:max-w-mg p-5 bg-gray-900
                flex-col flex items-center gap-3 rounded-xl shadow-slate-500 shadow-lg">
                    <img src="" alt=""/>
                    <h1 className="text-lg md:text-xl font-semibold text-white">Welcome Back</h1>
                    <p className="text-xs md:text-sm text-gray-500 text-center">Don't have an account ? <span className="text-white" ><Link to="/register" className="hover:text-blue-600 transition">Register</Link></span>
                    </p>

                    <div className="w-full flex flex-col gap-3">
                        <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="w-full flex items-center bg-gray-800 p-2 rounded-xl gap-3">

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

                        <div className="w-full flex items-center bg-gray-800 p-2 rounded-xl gap-3 relative">
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
                        className="w-full p-2 bg-blue-500 rounded-xl hover:bg-blue-600 text-sm md:text-base text-white">Login</button>

                        </form>

                    </div>
                </div>
            </div>
        </div>


    );
}
