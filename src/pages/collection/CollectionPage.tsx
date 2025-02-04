import React from 'react';
import ReferenceCard from '../../components/collection/ReferenceCard';
import testImage from '../../assets/testImage.svg';


 {/* 태스트 더미데이터 */}
export const sampleData = [
  {
    title: 'Reference 1',
    referenceCount: 10,
    images: [testImage, testImage, testImage, testImage, testImage],
  },
  {
    title: 'Reference 2',
    referenceCount: 8,
    images: [testImage, testImage, testImage, testImage],
  },
  {
    title: 'Reference 3',
    referenceCount: 5,
    images: [testImage, testImage, testImage, testImage],
  },
  {
    title: 'Reference 3',
    referenceCount: 5,
    images: [testImage, testImage, testImage, testImage],
  },
  {
    title: 'Reference 3',
    referenceCount: 5,
    images: [testImage, testImage, testImage, testImage],
  },
];


const CollectionPage: React.FC = () => {
  return (
    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {sampleData.map((data, index) => (
        <ReferenceCard
          key={index}
          title={data.title}
          referenceCount={data.referenceCount}
          images={data.images}
        />
      ))}
    </div>
  );
};

export default CollectionPage;