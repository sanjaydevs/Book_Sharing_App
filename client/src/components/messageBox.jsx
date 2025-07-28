import React, {useEffect,useState} from "react";
import axios from "axios";

export default function MessageBox({requestId, userId}) {
    const NumericUserId=Number(userId);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [refreshToggle, setRefreshToggle] = useState(false);

    useEffect(()=>{
        const fetchMessages = async () => {
            try {
                const res=await axios.get(`http://localhost:5000/api/messages/${requestId}`);

                setMessages(res.data)
                console.log("Messages:",messages)
            } catch (err) {
                console.error("Error Fetching Messgaes:", err)
            }
        };

        fetchMessages();

        const interval = setInterval(()=>{
            setRefreshToggle ((prev)=>!prev);
        }, 3000);

        return ()=>clearInterval(interval);
    },[refreshToggle, requestId]);


    const handleSend = async ()=>{
        if (!newMessage.trim()) return;

        try {
            const res= await axios.post("http://localhost:5000/api/messages",{
                requestId,
                senderId: userId,
                content: newMessage
            });
        
            setMessages((prev) => [...prev, res.data]);

            setNewMessage("")
        } catch (err) {
            console.error("Error sending message",err);
        }   
    };

    return (
    <div className="border rounded-lg p-4 bg-white shadow max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-2">Chat</h2>
      <div className="h-64 overflow-y-auto border p-2 rounded bg-gray-100 mb-2">
        {Array.isArray(messages) && messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 p-2 rounded w-fit break-words ${
              msg.sender_id === NumericUserId ? "bg-blue-200 ml-auto text-right" : "bg-gray-300 mr-auto text-left"
            } max-w-[75%]`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="flex">
        <input
          type="text"
          className="flex-1 p-2 border rounded-l"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}