import { useState } from 'react';
import ImageUpload from '../components/ImageUpload';

const ImageUploadPage = () => {
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleUploadSuccess = (imageData: any) => {
    setUploadedImages(prev => [...prev, imageData]);
    setError(null);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Image Upload</h1>
      
      <div className="mb-8">
        <ImageUpload
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Uploaded Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedImages.map((image) => (
              <div key={image.id} className="border rounded-md p-4">
                <img
                  src={`/api/images/${image.id}`}
                  alt={image.originalName}
                  className="w-full h-48 object-contain mb-2"
                />
                <div className="text-sm text-gray-600">
                  <p>Name: {image.originalName}</p>
                  <p>Size: {(image.size / 1024).toFixed(2)} KB</p>
                  <p>Uploaded: {new Date(image.uploadedAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadPage; 