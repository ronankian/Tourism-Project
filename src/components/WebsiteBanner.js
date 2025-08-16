import React from 'react';
import { useNavigate } from 'react-router-dom';

const WebsiteBanner = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div 
      className="hidden min-[801px]:block relative w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/images/webtitlebg.jpg)',
        height: '120px', // Smaller height for mobile
        minHeight: '120px'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-0"></div>
      <div className="absolute inset-0 flex items-center justify-center z-20 px-4">
        <img 
          src="/images/webtitle.png" 
          alt="Casa Hacienda de Tejeros Tourism Office" 
          className="max-h-20 sm:max-h-24 md:max-h-32 max-w-full object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200"
          onClick={handleLogoClick}
        />
      </div>
    </div>
  );
};

export default WebsiteBanner;
