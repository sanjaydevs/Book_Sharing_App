import { CiMail } from "react-icons/ci";
import { TbPasswordUser } from "react-icons/tb";
import { Link } from "react-router-dom";
import { CgProfile } from "react-icons/cg";

export default function Login() {
    return (
        <div>
            <div className="w-full h-screen flex items-center justify-center">
                <div className="w-[90%] max-w-sm md:max-w-md lg:max-w-mg p-5 bg-gray-900
                flex-col flex items-center gap-3 rounded-xl shadow-slate-500 shadow-lg">
                    <img src="" alt=""/>
                    <h1 className="text-lg md:text-xl font-semibold text-white">Register</h1>

                    
                    <div className="w-full flex flex-col gap-3">
                        <div className="w-full flex items-center bg-gray-800 p-2 rounded-xl gap-3">
                            <CgProfile color="white"/>
                            <input type="email" placeholder="Enter your Name" className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-white"></input>
                        </div>

                        <div className="w-full flex items-center bg-gray-800 p-2 rounded-xl gap-3">
                            <CiMail color="white"/>
                            <input type="email" placeholder="Enter your NITC email id" className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-white"></input>
                        </div>

                        <div className="w-full flex items-center bg-gray-800 p-2 rounded-xl gap-3 relative">
                            <TbPasswordUser color="white"/>
                            <input type="email" placeholder="Enter your password" className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-white"></input>
                        </div>

                        <button className="w-full p-2 bg-blue-500 rounded-xl hover:bg-blue-600 text-sm md:text-base text-white">Register</button>


                    </div>
                </div>
            </div>
        </div>


    );
}
