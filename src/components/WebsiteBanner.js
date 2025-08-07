import React from 'react';

const WebsiteBanner = () => {
  return (
    <div 
      className="relative w-full h-48 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/images/webtitlebg.jpg)',
        height: '200px' // Fixed height as requested
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-0"></div>
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <img 
          src="/images/webtitle.png" 
          alt="Casa Hacienda de Tejeros Tourism Office" 
          className="max-h-32 max-w-full object-contain"
        />
      </div>
    </div>
  );
};

export default WebsiteBanner;
