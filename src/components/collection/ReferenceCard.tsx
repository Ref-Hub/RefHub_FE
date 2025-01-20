import React, { useState } from 'react';
import { ReferenceCardProps } from '../../types/collection';


const ReferenceCard: React.FC<ReferenceCardProps> = ({ title, referenceCount, images }) => {
    const [isStarred, setIsStarred] = useState(false);
  
    const toggleStar = () => {
      setIsStarred(!isStarred);
    };
  
    return (
      <div className="border rounded-lg shadow-md p-4 max-w-sm">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={toggleStar} aria-label="Toggle Star">
            {isStarred ? (
              <img src="/src/assets/star-filled.svg" alt="Starred" className="w-6 h-6" />
            ) : (
              <img src="/src/assets/star-outline.svg" alt="Not Starred" className="w-6 h-6" />
            )}
          </button>
          <h2 className="text-lg font-bold text-gray-800 flex-1 ml-2">{title}</h2>
          <button aria-label="Settings">
            <img src="/src/assets/settings.svg" alt="Settings" className="w-6 h-6" />
          </button>
        </div>
  
        {/* Reference Count */}
        <p className="text-gray-600 mb-4">{referenceCount} references</p>
  
        {/* Image Grid */}
        <div className="grid grid-cols-2 gap-2">
          {images.slice(0, 4).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Reference ${index + 1}`}
              className="w-full h-24 object-cover rounded-md"
            />
          ))}
        </div>
      </div>
    );
  };
  
  export default ReferenceCard;
  