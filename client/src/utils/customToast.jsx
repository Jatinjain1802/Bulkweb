import toast from "react-hot-toast";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import "../App.css";


export const showSuccessToast = (message) => {
    toast.custom(
        (t) => (
            <div
                style={{
                    opacity: t.visible ? 1 : 0,
                    transition: "opacity 100ms ease-in-out",
                    background: "#ffffff",
                    padding: "16px 20px",
                    borderRadius: "12px",
                    color: "#222",
                    fontWeight: "600",
                    fontSize: "15px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                    // borderLeft: "6px solid #16a34a",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    minWidth: "300px",
                }}
            >
                <AiOutlineCheckCircle size={30} color="#16a34a" />
                <span style={{ flex: 1 }}>{message}</span>
                <div className="toast-progress-line"></div>
            </div>
        ),
        {
            duration: 3000,
        }
    );
};

export const showErrorToast = (message) => {
    toast.custom(
        (t) => (
            <div
                style={{
                    opacity: t.visible ? 1 : 0,
                    transition: "opacity 100ms ease-in-out",
                    background: "#ffffff",
                    padding: "16px 20px",
                    borderRadius: "12px",
                    color: "#222",
                    fontWeight: "600",
                    fontSize: "15px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                    // borderLeft: "6px solid #ef4444",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    minWidth: "300px",
                }}
            >
                <AiOutlineCloseCircle size={30} color="#ef4444" />
                <span style={{ flex: 1 }}>{message}</span>
                <div className="toast-progress-line-error"></div>
            </div>
        ),
        {
            duration: 3000,
        }
    );
};
