import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNotifications } from '../context/NotificationContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, MessageSquare, AlertCircle, X } from 'lucide-react';
import React from 'react';

// Determine Socket URL - ideally from environment variable
const SOCKET_URL = 'http://localhost:5000';

const useSocketNotifications = () => {
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'], 
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    // Listener for new messages
    socket.on('new_message', (data) => {
      console.log('New message event:', data);
      
      addNotification({
        type: 'message',
        title: `New message from ${data.from}`,
        message: data.content,
        data: data
      });

      // Matching NotificationDropdown style
      toast.custom((t) => (
        <div 
          onClick={() => {
            navigate('/dashboard/chat');
            toast.dismiss(t.id);
          }}
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black/5 cursor-pointer hover:bg-gray-50 transition-colors`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                 <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                 </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-slate-800">
                  New message from {data.from}
                </p>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {data.content || 'Image/Media'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={(e) => {
                  e.stopPropagation();
                  toast.dismiss(t.id);
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: 5000 });
    });

    // Listener for status updates (e.g., failed messages)
    socket.on('status_update', (data) => {
      if (data.status === 'failed') {
        const errorMsg = data.error || 'Unknown error';
        addNotification({
          type: 'error',
          title: 'Message Failed',
          message: `Message to ${data.recipient_id} failed: ${errorMsg}`,
          data: data
        });

        toast.custom((t) => (
            <div 
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black/5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                     <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                     </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      Message Failed
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                       Message to {data.recipient_id} failed.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
                >
                  Close
                </button>
              </div>
            </div>
          ), { duration: 5000 });
      }
    });

    // Listener for campaign completion
    socket.on('campaign_completed', (data) => {
        addNotification({
            type: 'success',
            title: 'Campaign Completed',
            message: data.msg || `Campaign ${data.name} finished.`,
            data: data
        });

        toast.custom((t) => (
            <div 
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black/5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                     <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                        <CheckCheck className="w-5 h-5 text-green-500" />
                     </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      Campaign Completed
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                       {data.name} has finished processing.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
                >
                  Close
                </button>
              </div>
            </div>
          ), { duration: 5000 });
    });

    // Listener for template status updates
    socket.on('template_status_update', (data) => {
        if (data.status === 'approved') {
            addNotification({
                type: 'success',
                title: 'Template Approved',
                message: `Template "${data.name}" has been approved.`,
                data: data
            });

            toast.custom((t) => (
                <div 
                  className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                  } max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black/5`}
                >
                  <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                         <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                            <CheckCheck className="w-5 h-5 text-green-500" />
                         </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-slate-800">
                          Template Approved
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                           "{data.name}" is now ready to use.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex border-l border-gray-200">
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ), { duration: 5000 });
        } else if (data.status === 'rejected') {
             addNotification({
                type: 'error',
                title: 'Template Rejected',
                message: `Template "${data.name}" was rejected. Reason: ${data.reason}`,
                data: data
            });
            
             toast.custom((t) => (
                <div 
                  className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                  } max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black/5`}
                >
                  <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                         <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                         </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-slate-800">
                          Template Rejected
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                           {data.name} was rejected.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex border-l border-gray-200">
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ), { duration: 5000 });
        }
    });

    return () => {
      socket.disconnect();
    };
  }, [addNotification, navigate]);
};

export default useSocketNotifications;
