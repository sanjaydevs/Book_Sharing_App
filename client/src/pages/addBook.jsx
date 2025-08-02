import React, {useState} from "react";
import axios from "axios";

export default function AddBook() {

        const [form,setForm]=useState({
            title:"",
            author:"",
            image:""
        });

    const handleChange=(e)=>{
        setForm({...form,[e.target.name]:e.target.value});
    }

    const handleSubmit= async (e)=>{
        e.preventDefault();
        const token=localStorage.getItem("token");
        try{
            const res = await axios.post("http://localhost:5000/api/books/add",form,{
                headers:{
                    Authorization: `Bearer ${token}`
                },
            });
            alert("Book added successfully");
        } catch(err){
            alert("Error adding book");
            console.error("Error adding book:", err);
        }
    }

    

    return (
        <div className="min-h-screen bg-[#FAECB6] flex items-center justify-center">
        <div className="w-full max-w-sm md:max-w-md lg:max-w-mg border rounded-xl bg-[#B6E6FA] border-2 border-black drop-shadow-[4px_4px_0_#000000]">
            <div>
                <div className="flex items-center justify-between px-4 py-2">
                <div className="flex space-x-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full border-2 border-black shadow-[1px_1px_0_#000000]" />
                    <span className="w-3 h-3 bg-yellow-400 rounded-full border-2 border-black shadow-[1px_1px_0_#000000]" />
                    <span className="w-3 h-3 bg-green-500 rounded-full border-2 border-black shadow-[1px_1px_0_#000000]" />
                </div>
                    <h2 className="text-xl font-heading font-extrabold text-gray-800">ADD BOOK</h2>
                </div>

                        {/* FULL-WIDTH LINE */}
                <div className="h-[3px] w-full bg-black mb-2" />
            </div>
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 px-4 py-2">

                <input
                name="title"
                placeholder="Book Title"
                value={form.title}
                onChange={handleChange}
                className="font-heading border-black border-2 shadow-[2px_2px_0_#000000] w-full flex items-center p-2 rounded-xl gap-3"
                />

                <input
                name="author"
                placeholder="Book Author"
                value={form.author}
                onChange={handleChange}
                className="font-heading border-black border-2 shadow-[2px_2px_0_#000000] w-full flex items-center p-2 rounded-xl gap-3"
                />

                <input
                name="image"
                placeholder="Image URL from WEB"
                value={form.image}
                onChange={handleChange}
                className="font-heading border-black border-2 shadow-[2px_2px_0_#000000] w-full flex items-center p-2 rounded-xl gap-3"
                />

                <button type="submit" className="font-heading w-full p-2 bg-[#F9A822] border-black border-2 shadow-[2px_2px_0_#000000] rounded-xl hover:bg-blue-600 text-sm md:text-base text-black font-bold">Add this Book</button>
            </form>
        </div>
    </div>
    )
}
