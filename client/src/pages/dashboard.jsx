  import React,{useState, useEffect} from "react";
  import axios from "axios";
  import {jwtDecode} from "jwt-decode";
  import MessageBox from "../components/messageBox";
  import { HiArrowUp } from "react-icons/hi";
  import toast from "react-hot-toast";
  import { MoonLoader } from "react-spinners";

  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const Dashboard=()=>{
    const [loading, setLoading] = useState(true);
    const [showMessageBox, setShowMessageBox] = useState(false);

    const [activeChatId, setActiveChatId] = useState(null);

    const [myBooks, setMyBooks] = useState([]);
    const [requests,setRequests] = useState([]);
    const [incomingRequests, setIncomingRequests]=useState([]);

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");


    const token = localStorage.getItem("token");
    let userId = null;
    

    if (token) {
      const decoded = jwtDecode(token);
      userId = decoded.userId;
    }
    const resetReqs = async()=>{
      const sentRes = await axios.get(`${baseURL}/api/requests/me`,
          {headers:
            {Authorization: `Bearer ${token}`}
        });

          
          setRequests(sentRes.data.requests);

          const incomingRes= await axios.get(`${baseURL}/api/requests/my-requests`,
          {headers:
            {Authorization: `Bearer ${token}` }
          });
          

          setIncomingRequests(incomingRes.data.requests);
    };

    const handleConfirmExchange = async (requestId) => {
      try {
        await axios.patch(`${baseURL}/api/requests/${requestId}/confirm`, 
          null,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
        ); 

        await resetReqs();
        
        toast.success("Exchange marked.", { duration: 3000 });
        // optionally refresh list
      } catch (err) {
        console.error(err);
      }
    };


    const handleReturnConfirm = async (requestId) => {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${baseURL}/api/requests/${requestId}/return`,
          null,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Return Confirmed From your side", { duration: 3000 });

        // Find request BEFORE resetting
        const req = [...requests, ...incomingRequests].find((r) => r.id === requestId);

        if (req) {
          const targetId =
            parseInt(userId) === req.sender_id ? req.receiver_id : req.sender_id;
          console.log("Setting review target:", targetId);

          // ✅ Set review modal BEFORE refreshing
          setReviewTarget({ requestId, targetId });
          setShowReviewModal(true);
        }

        // ✅ Refresh *after* small delay to let modal open cleanly
        setTimeout(() => {
          resetReqs();
        }, 2000);

      } catch (err) {
        console.error("Error confirming return:", err);
        toast.error("Failed to confirm return");
      }
    };

    const handleAccept = async (reqId)=>{
      try{
        await axios.post(`${baseURL}/api/requests/${reqId}/accept`,
          null,
          {
          headers:{Authorization:`Bearer ${token}`},
          
        });

        await resetReqs();

      } catch (err){
        console.error("Error Accepting Request",err)
        toast.error("Failed to Accept Request", { duration: 3000 });
      }
    };

    const handleDelete = async (reqId)=>{
      try{
        await axios.delete(`${baseURL}/api/requests/${reqId}`,{
          headers:{Authorization:`Bearer ${token}`},
        });
        
        setRequests((prev)=> prev.filter((r)=> r.id!==reqId));
        toast.success("Request Deleted", { duration: 2000});

      }catch(err){
        console.error("Error Deleting Request",err)
        toast.error("Failed to Delete Request", { duration: 2000 });
      }
    };

    const handleReject = async (reqId)=>{
      try{
        await axios.post(`${baseURL}/requests/${reqId}/reject`,
          null,
          {
          headers:{Authorization:`Bearer ${token}`},
        })

        await resetReqs();

      } catch (err){
        console.error("Error Rejecting Request",err)
        toast.error("Failed to Reject Request", { duration: 3000 });
      }
    };
    

    useEffect(()=>{
      const fetchRequests = async ()=>{
        try{
          const sentRes = await axios.get(`${baseURL}/api/requests/me`,
          {headers:
            {Authorization: `Bearer ${token}`}
        });

          
          setRequests(sentRes.data.requests);

          const incomingRes= await axios.get(`${baseURL}/api/requests/my-requests`,
          {headers:
            {Authorization: `Bearer ${token}` }
          });
          

          setIncomingRequests(incomingRes.data.requests);
        } catch (err){
          console.error("Error fetching books");
        } finally {
          setLoading(false);
        }
      };
      if (token) {
      fetchRequests();
      }
      
    },[token]);

    return (
      <div className="min-h-full bg-[#FAECB6]">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

    {/* Sent Requests Section */}
  <div>
    <h2 className="sm:text-xl lg:text-2xl font-title mb-6 flex gap-2"> Sent Requests</h2>
    {loading ? (
            <div className="flex justify-center items-center min-h-[50vh]">
              <MoonLoader size={50}
            color="#F96635"
            />
            </div>
          ) : (
    <div>
    {requests?.length > 0 ? (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {requests.map((req) => {


          return (
            <div key={req.id} className="bg-[#B6E6FA] border-black border-2 drop-shadow-[4px_4px_0_#000000] p-3 rounded-lg shadow-sm text-sm">
              <img
                src={req.image}
                alt={req.title}
                className="w-full h-40 object-cover rounded-md mb-3"
              />
              <div className="h-[3px] w-full bg-black mb-2" />
              <p className="py-1 font-title "><span className="font-heading font-bold">📚 Book:</span> {req.title}</p>
              <p className="py-1 font-heading"><span className="font-heading font-bold">👤 Owner:</span> {req.owner_name}</p>
              <p className="py-1 font-heading"><span className="font-heading font-bold">📌 Status:</span> {req.status}</p>
              
              <div className="items-center mt-3 flex flex-col gap-2">
                
                {/* Delete Request Button */}
                {req.status=='pending' && (
                  <>
                <button
                  onClick={() => handleDelete(req.id)}
                  className="bg-[#B6E6FA] border-black border-2 drop-shadow-[2px_2px_0_#000000] font-heading px-4 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
  </>
                )}

                {/* Confirm Return Logic */}
                {req.is_exchanged && !req.is_returned && (
                  <>
                    {(parseInt(userId) === req.sender_id && !req.sender_returned) ||
                    (parseInt(userId) === req.receiver_id && !req.receiver_returned) ? (
                      <button
                        onClick={() => handleReturnConfirm(req.id)}
                        className="font-heading border-2 border-black drop-shadow-[2px_2px_0_#000000] px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Confirm Return
                      </button>
                    ) : (
                      <span className="text-gray-500 font-heading ">Waiting for other user...</span>
                    )}
                  </>
                )}

                {/* Book Returned Message */}
                {req.is_returned && <span className="text-green-600 font-medium">✅ Book Returned</span>}

                {req.status === "accepted" && req.requester_id === userId && (
                  <div className="">
                    <button
                      className="font-heading border-2 border-black drop-shadow-[2px_2px_0_#000000] px-3 py-1 rounded bg-blue-200 hover:bg-blue-400 transition"
                      onClick={() => setActiveChatId((prev) => (prev===req.id ? null : req.id))}
                    >
                      {activeChatId === req.id ? "Hide Chat" : "Show Chat"}
                    </button>

                    {activeChatId === req.id && (
                      <MessageBox userId={userId} requestId={req.id} />
                    )}
                  </div>
                )}

                {/* Mark as Exchanged Button */}
                {!req.sender_confirmed && req.status === "accepted" && (
                  <button
                    className="w-[75%] font-heading border-2 border-black drop-shadow-[2px_2px_0_#000000] px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() => handleConfirmExchange(req.id)}
                  >
                    Mark as Exchanged
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <p className="text-gray-500 font-heading ">No sent requests yet.</p>
    )}
    </div>
  )}
  </div>


    {/* Incoming Requests Section */}
    <div>
      <h2 className="sm:text-xl lg:text-2xl font-title mb-6 flex gap-2">Incoming Requests</h2>
      {loading ? (
            <div className="flex justify-center items-center min-h-[50vh]">
              <MoonLoader size={50}
            color="#F96635"
            />
            </div>
          ) : (
      <div>
      {incomingRequests?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {incomingRequests.map((req) => (

            <div key={req.id} className="bg-[#FACAB6] border-black border-2 drop-shadow-[4px_4px_0_#000000] p-3 rounded-lg shadow-sm text-sm">
              <img
                src={req.image}
                alt={req.title}
                className="w-full h-40 object-cover rounded-md mb-3"
              />
              <div className="h-[3px] w-full bg-black mb-2" />
              <p className="py-1 font-title"><span className="font-heading font-bold">📚 Book:</span> {req.title}</p>
              <p className="py-1 font-heading"><span className="font-heading font-bold">🙋 Requested By:</span> {req.requester_name}</p>
              <p className="py-1 font-heading"><span className="font-heading font-bold ">📌 Status:</span> {req.status}</p>
              <div className="items-center mt-3 flex flex-col gap-2">
              {req.status==='pending' &&(
                <>
              <div className="flex flex-cols gap-2">
              <button
                onClick={() => handleAccept(req.id)}
                className="border-black border-2 drop-shadow-[2px_2px_0_#000000] self-start  px-4 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(req.id)}
                className="border-black border-2 drop-shadow-[2px_2px_0_#000000] self-start  px-4 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Reject
              </button>
              </div>
  </>
              )}

              {req.is_exchanged && !req.is_returned && (
                  <>
                    {(parseInt(userId) === req.sender_id && !req.sender_returned) ||
                    (parseInt(userId) === req.receiver_id && !req.receiver_returned) ? (
                      <button
                        onClick={() => {
                          console.log("button clicked");
                          handleReturnConfirm(req.id)
                        }}
                        className="font-heading border-2 border-black drop-shadow-[2px_2px_0_#000000] px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Confirm Return
                      </button>
                    ) : (
                      <span className="text-gray-500 font-heading">Waiting for other user...</span>
                    )}
                  </>
                )}

  {req.is_returned && <span>✅ Book Returned</span>}

              {req.status === "accepted" && req.requester_id !== userId && (
                <div className="">
                  <button
                    className="font-heading border-2 border-black drop-shadow-[2px_2px_0_#000000] px-3 py-1 rounded bg-blue-200 hover:bg-blue-400 transition"
                    onClick={() => setShowMessageBox((prev) => !prev)}
                  >
                    {showMessageBox ? "Hide Chat" : "Show Chat"}
                  </button>

                  {showMessageBox && (
                    <MessageBox userId={userId} requestId={req.id}/>
                  )}
                </div>
              )}


              {!req.receiver_confirmed && req.status==="accepted" &&(
                <button
                  className="w-[75%] font-heading border-2 border-black drop-shadow-[2px_2px_0_#000000] px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => handleConfirmExchange(req.id)}>
                  Mark as Exchanged
                </button>
              )}       
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 font-heading">No incoming requests.</p>
      )}
      </div>
  )}
    </div>
    </div>

        </div>

        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md border-2 border-black">
              <h2 className="font-title text-xl mb-4 text-center">Leave a Review</h2>

              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={star <= rating ? "text-yellow-400 text-2xl" : "text-gray-400 text-2xl"}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Rate your Exchange experience"
                className="w-full border border-gray-300 rounded p-2 mb-4"
                rows={3}
              />

              <div className="flex justify-between">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-1 border-2 border-black rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      console.log("trying to post review");
                      
                      if (!reviewTarget?.targetId) {
                          toast.error("Review target missing");
                          return;
                        }

                      
                      await axios.post(
                        `${baseURL}/api/reviews`,
                        {
                          reviewer_id: userId,
                          reviewed_user_id: reviewTarget.targetId,
                          request_id: reviewTarget.requestId,
                          rating,
                          comment,
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      toast.success("Review submitted!");
                      setShowReviewModal(false);
                      setComment("");
                      setRating(0);
                    } catch (err) {
                      console.error("Error submitting review:", err);
                      toast.error("Failed to submit review");
                    }
                  }}
                  className="px-4 py-1 border-2 border-black rounded bg-blue-500 text-white hover:bg-blue-600"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    )

  }
  export default Dashboard;