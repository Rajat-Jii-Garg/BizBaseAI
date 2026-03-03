import React from 'react';
import { useNavigate } from "react-router-dom";
import { X } from 'lucide-react';

const LoginModal = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-card rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative border border-border/50">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-primary">B</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1.5">
            Join BizBase to continue
          </h2>
          <p className="text-sm text-muted-foreground">
            Create your professional presence and engage with posts.
          </p>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl mb-3 hover:opacity-90 transition font-medium text-sm"
        >
          Login
        </button>

        <button
          onClick={() => navigate("/signup")}
          className="w-full border border-border py-2.5 rounded-xl hover:bg-muted/50 transition font-medium text-sm text-foreground"
        >
          Create Account
        </button>

        <button
          onClick={onClose}
          className="text-xs text-muted-foreground mt-4 hover:text-foreground transition-colors"
        >
          Continue Browsing
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
