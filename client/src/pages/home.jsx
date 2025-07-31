import {useNavigate, Link} from "react-router-dom";


export default function Home(){
    const navigate=useNavigate();

    const handleClick=()=>{
        navigate("/register");
    };

    return (
        <div className="relative bg-[#FAECB6] flex items-center justify-center">
            <div className="text-center text-neutral-content w-full overflow-hidden">
                <div className="w-[66%] h-screen flex flex-col justify-center h-full pl-48 pb-40">
                    <h1 className="text-5xl md:text-6xl font-title text-[#2BBAA5] drop-shadow-[2px_4px_0_#000000]">Welcome To</h1>
                    <h2 className="text-6xl md:text-7xl font-brand text-[#F96635] drop-shadow-[2px_4px_0_#000000]">BOOKSHARE</h2>
                    <p className="font-title px-2 py-2 text-gray-700">A place where books find new readers</p>
                    
                    <button 
                    onClick={handleClick}
                    className="w-fit mx-auto px-6 py-3 font-title bg-[#F9A822] rounded-[10px] text-black border-2 border-black shadow-[4px_4px_0_#000] hover:bg-[#F96635] transition-all duration-200">START SHARING</button>

                </div>
                <div className="w-[34%]"></div>
            </div>
        </div>
    );
}