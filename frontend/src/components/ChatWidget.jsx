import React, { use, useState, useEffect } from "react";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { Button } from "flowbite-react";

function ChatBubble(props) {
    // Top-right square, other corners rounded
    return (
        <div className="flex items-start gap-2.5">
            <div className="flex flex-col gap-1 w-full max-w-[320px]">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{props.from}</span>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div
                    className={`p-4 border-gray-200 bg-gray-100 ${props.from === "ai"
                            ? "rounded-tr-xl rounded-bl-xl rounded-br-xl" // top-left square
                            : "rounded-bl-xl rounded-br-xl rounded-tl-xl" // top-right square
                        } dark:bg-gray-700 w-full`}
                >
                    <p className="text-[12px] font-normal text-gray-900 dark:text-white">{props.message}</p>
                </div>
            </div>
        </div>
    )
}



export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! How can I assist you today?", sender: "ai" }
    ]);
    const [waiting, setWaiting] = useState(false);

    // 🔁 useEffect to handle sending message to backend after user sends it
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];

        if (lastMsg.sender !== "you") return;

        const fetchResponse = async () => {
            setWaiting(true);
            try {
                // const backendUrl = "odoo.phpx.live:8000"; // Fallback to local if env variable not set
                const res = await axios.post(`http://odoo.phpx.live/chatbot/`, {
                    query: lastMsg.text,
                });

                setMessages(prev => [...prev, { text: res.data.response, sender: "ai" }]);
            } catch (err) {
                console.error(err);
                setMessages(prev => [...prev, { text: "Sorry, something went wrong.", sender: "ai" }]);
            } finally {
                setWaiting(false);
            }
        };

        fetchResponse();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const input = e.target.parentNode.childNodes[0];
        const userMsg = input.value.trim();
        if (!userMsg) return;

        setMessages(prev => [...prev, { text: userMsg, sender: "you" }]);
        input.value = ""; // clear input
    };


    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Toggle Button */}
            <button
                onClick={() => setOpen(!open)}
                className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:scale-105 transition duration-300"
            >
                {open ? <IoClose size={24} /> : <IoChatbubbleEllipsesSharp size={24} />}
            </button>

            {/* Chat Box */}
            {open && (
                <div className="mt-3 w-96 h-[30rem] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg flex flex-col overflow-hidden">
                    <div className="p-3 bg-blue-600 text-white font-semibold">AI Assistant</div>
                    <div className="flex-1 p-3 overflow-y-auto text-sm">
                        {/* You can add more UI or connect to an AI API */}
                        {messages.map((msg, index) => (
                            <div key={index} className="my-2">
                                <ChatBubble message={msg.text} from={msg.sender} />
                            </div>
                        ))}
                    </div>
                    <div className="p-2 border-t dark:border-gray-700">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="w-full p-2 text-sm rounded-lg border border-gray-300 dark:bg-gray-700 dark:text-white focus:outline-none"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            className="mt-2 w-full bg-blue-600 text-white p-2 rounded-lg hover:scale-105 transition duration-300"
                            onClick={handleSubmit}
                        >
                            Send
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
