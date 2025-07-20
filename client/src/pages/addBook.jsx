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
        <div className="max-w-md mx-auto mt-10 p-4 border rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Add Book</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

                <input
                name="title"
                placeholder="Book Title"
                value={form.title}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                />

                <input
                name="author"
                placeholder="Book Author"
                value={form.author}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                />

                <input
                name="image"
                placeholder="Image URL from WEB"
                value={form.image}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                />

                <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-700">Add this Book</button>
            </form>
        </div>
    )
}
