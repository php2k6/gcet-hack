import { useEffect, useRef, useState } from "react";
import back from "../assets/back.png";
import image from "../assets/pothole1.png";
import { Check } from "lucide-react";
import { Bell, CheckCircle, AlertCircle, XCircle } from "lucide-react";

const Notification = () => {
  //   useEffect(() => {
  //     document.body.style.overflow = "hidden";

  //     return () => {
  //       document.body.style.overflow = "auto";
  //     };
  //   }, []);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Issue",
      message: "Someone posted issue on electricity in Anand.",
      time: "15m ago",
      type: "info",
      read: false,
      //   date: "today",
    },
    {
      id: 2,
      title: "Issue resolved",
      message: "The issue that you posted was resolved.",
      time: "30m ago",
      type: "success",
      read: true,
      //   date: "today",
    },
    {
      id: 3,
      title: "Post issue",
      message: "The issue you posted was rejected by the authority.",
      time: "1d ago",
      type: "error",
      read: false,
      //   date: "yesterday",
    },
    {
      id: 4,
      title: "Incomplete post.",
      message: "Issue that you were registering was not completed.",
      time: "2d ago",
      type: "warning",
      read: true,
      //   date: "yesterday",
    },
  ]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };
  return (
    <>
      <div
        style={{
          backgroundImage: `url(${back})`,
          backgroundSize: "70%",
          backgroundPosition: "right",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          position: "fixed",
          height: "100vh",
          width: "100%",
          filter: "blur(30px)",
          zIndex: -1,
        }}
      ></div>
      <div className="mx-auto max-w-2xl p-6">
        <h2 className="mt-20 mb-6 text-2xl font-bold">Notifications</h2>

        {/* Group: Today */}
        <div className="mb-6">
          <h3 className="mt-5 mb-3 text-sm font-semibold text-gray-500"></h3>
          <div className="space-y-4">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-4 rounded-lg border p-4 shadow-sm transition ${
                  n.read ? "bg-white" : "bg-blue-50"
                }`}
              >
                {/* Icon */}
                <div>
                  {n.type === "success" && (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                  {n.type === "info" && (
                    <Bell className="h-6 w-6 text-blue-500" />
                  )}
                  {n.type === "warning" && (
                    <AlertCircle className="h-6 w-6 text-yellow-500" />
                  )}
                  {n.type === "error" && (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-gray-600">{n.message}</p>
                  <span className="text-xs text-gray-400">{n.time}</span>
                </div>

                {/* Mark read button */}
                {!n.read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notification;
