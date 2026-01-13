import toast from "react-hot-toast";

export default function notifyToast(message,type){
    switch(type){
        case "success":
            return toast.success(message, {
                duration: 5000,
                style: {
                    background: '#4CAF50',
                    color: '#fff',
                },
            });
        case "error":
            return toast.error(message, {
            duration: 4000,
                style: {
                    background: '#F44336',
                    color: '#fff',
                },
            });
        case "info":
            return toast.info(message, {
                duration: 4000,
                style: {
                    background: '#2196F3',
                    color: '#fff',
                },
            });
        default:
            return toast(message);
    }
}