
import React from "react";

const Error500 = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
    <h1 className="text-5xl font-bold text-red-700 mb-3">500</h1>
    <h2 className="text-2xl text-red-600 mb-2">Internal Server Error</h2>
    <p className="mb-6 text-gray-600">Oops! Something went wrong. Please try again later, or contact support.</p>
    <a href="/" className="text-blue-600 font-semibold underline">Go back Home</a>
  </div>
);

export default Error500;
