import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Modal dialog generik yang dipakai di halaman perizinan.
 * Memakai portal agar tidak tertutup scrollbar/absensi lain.
 */
export default function Modal({ isOpen, onClose, title, children, size = "md", footer = null }) {
    if (!isOpen) return null;

    const sizeClass = {
        sm: "modal-sm",
        md: "modal-md",
        lg: "modal-lg",
        xl: "modal-xl",
    }[size] || "modal-md";

    return createPortal(
        <div className="modal-backdrop" onClick={onClose}>
            <div className={`modal-card ${sizeClass}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h4 className="modal-title">{title}</h4>
                    <button type="button" className="modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>,
        document.body
    );
}
