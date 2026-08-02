import React from "react";

const BizBaseMark = ({ className = "" }) => {
  return (
    <img
      src="/images/logo_icon.png"
      alt="BizBase Logo"
      className={`w-full h-full object-contain ${className}`}
      draggable={false}
    />
  );
};

export default BizBaseMark;






// import React from 'react';

// // BizBase brand mark: bold geometric "B" with rounded double-lobe counters
// const BizBaseMark = ({ className = 'w-6 h-6' }) => (
//   <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
//     <path
//       fillRule="evenodd"
//       clipRule="evenodd"
//       d="M4.2 5.6 6.9 2.8A3 3 0 0 1 9 2h5.4a5.3 5.3 0 0 1 3.9 8.9 5.3 5.3 0 0 1-3.9 8.9H9a3 3 0 0 1-2.1-.9L4.2 16v-4.6l2.7-2.8V5.6ZM9.5 5.6v4h4.7a2 2 0 0 0 0-4H9.5Zm0 8.8v4h4.7a2 2 0 0 0 0-4H9.5Z"
//     />
//   </svg>
// );

// export default BizBaseMark;