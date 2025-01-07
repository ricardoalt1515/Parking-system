
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Función para disparar notificaciones
export function notify(message, type = "success") {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "info":
      toast.info(message);
      break;
    default:
      toast(message);
  }
}

// Contenedor que se debe renderizar una sola vez
export default function Notification() {
  return <ToastContainer position="top-right" autoClose={3000} />;
}

