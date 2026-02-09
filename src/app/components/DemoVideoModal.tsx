import React, { useEffect } from "react";

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId?: string;
}

const DemoVideoModal: React.FC<DemoVideoModalProps> = ({
  isOpen,
  onClose,
  videoId = "CBcpBr-0XsI", // Default placeholder or specific ID
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10 transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white/70 backdrop-blur hover:bg-black/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Close modal"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Video Container (16:9 aspect ratio) */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&autoplay=1`}
            className="absolute inset-0 h-full w-full"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Demo Video"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default DemoVideoModal;
