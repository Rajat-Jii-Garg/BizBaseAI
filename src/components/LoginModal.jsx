import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const LoginModal = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
        <h2 className="text-xl font-semibold mb-3">
          Join BizBase to continue
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Create your professional presence and engage with posts.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="w-full bg-blue-600 text-white py-2 rounded-lg mb-3 hover:bg-blue-700 transition"
        >
          Login
        </button>

        <button
          onClick={() => navigate("/register")}
          className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          Create Account
        </button>

        <button
          onClick={onClose}
          className="text-xs text-gray-400 mt-4 hover:text-gray-600"
        >
          Continue Browsing
        </button>
      </div>
    </div>
  );
};

export default LoginModal;