import React, { useState } from 'react';
import { Upload, Film, Calendar, FileText, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const SeasonUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle', 'uploading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [seasonData, setSeasonData] = useState({
    title: '',
    seasonNumber: '',
    year: new Date().getFullYear(),
    description: '',
    episodes: []
  });

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validate file type
    const allowedTypes = [
      'video/mp4',
      'video/mkv',
      'video/avi',
      'video/mov',
      'video/wmv',
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed'
    ];
    
    // Also check file extensions for archive files
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'zip', 'rar', '7z'];
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setErrorMessage('Invalid file type. Please select a video or archive file.');
      return;
    }

    // Validate file size (5GB limit)
    if (file.size > 5 * 1024 * 1024 * 1024) {
      setErrorMessage('File size too large. Maximum size is 5GB.');
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');
  }
};

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileChange({ target: { files: [file] } });
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSeasonData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const uploadSeason = async (formData) => {
    try {
      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('http://localhost:5000/api/seasons', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Upload timeout - server took too long to respond');
      }
      throw new Error(`Network error: ${error.message}`);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedFile || !seasonData.title || !seasonData.seasonNumber || !seasonData.year) {
      setErrorMessage('Please fill in all required fields and select a file.');
      return;
    }

    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', seasonData.title);
    formData.append('seasonNumber', seasonData.seasonNumber);
    formData.append('year', seasonData.year);
    formData.append('description', seasonData.description);
    formData.append('episodes', JSON.stringify(seasonData.episodes));

    // Simulate progress (in real app, you'd use axios with onUploadProgress)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const result = await uploadSeason(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      
      // Reset form after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setSeasonData({
          title: '',
          seasonNumber: '',
          year: new Date().getFullYear(),
          description: '',
          episodes: []
        });
        setUploadProgress(0);
        setUploadStatus('idle');
      }, 3000);

    } catch (error) {
      clearInterval(progressInterval);
      setUploadStatus('error');
      setErrorMessage(error.message || 'Upload failed. Please try again.');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setErrorMessage('');
  };

  const resetForm = () => {
    setSelectedFile(null);
    setSeasonData({
      title: '',
      seasonNumber: '',
      year: new Date().getFullYear(),
      description: '',
      episodes: []
    });
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-linear-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
            Upload Season
          </h1>
          <p className="text-gray-400 text-lg">
            Add a new season to your series collection
          </p>
        </div>

        {/* Upload Status */}
        {uploadStatus === 'uploading' && (
          <div className="mb-6 bg-blue-900/20 border border-blue-500 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Loader className="w-6 h-6 text-blue-400 animate-spin" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-blue-300">Uploading...</span>
                  <span className="text-blue-300">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="mb-6 bg-green-900/20 border border-green-500 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="text-green-300 font-semibold">Upload Successful!</h3>
                <p className="text-green-400 text-sm">Season has been uploaded successfully.</p>
              </div>
            </div>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="mb-6 bg-red-900/20 border border-red-500 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-red-300 font-semibold">Upload Failed</h3>
                <p className="text-red-400 text-sm">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                selectedFile 
                  ? 'border-green-500 bg-green-500/10' 
                  : uploadStatus === 'error' 
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 hover:border-blue-500 hover:bg-blue-500/10'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept="video/*,.zip,.rar,.7z"
                className="hidden"
                id="season-upload"
                disabled={uploadStatus === 'uploading'}
              />
              
              {!selectedFile ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Upload className="w-16 h-16 text-gray-400" />
                  </div>
                  <div>
                    <label
                      htmlFor="season-upload"
                      className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-block disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={uploadStatus === 'uploading'}
                    >
                      Choose Season Files
                    </label>
                    <p className="text-gray-400 mt-3">or drag and drop here</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Supports video files (MP4, MKV, AVI, MOV, WMV) or compressed archives (ZIP, RAR, 7Z)
                  </p>
                  <p className="text-xs text-gray-600">Maximum file size: 5GB</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <FileText className="w-16 h-16 text-green-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-green-400 font-semibold text-lg">
                      {selectedFile.name}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <p className="text-gray-400 text-sm capitalize">
                      {selectedFile.type.split('/')[1]} file
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center mx-auto space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={uploadStatus === 'uploading'}
                  >
                    <X size={16} />
                    <span>Remove File</span>
                  </button>
                </div>
              )}
            </div>

            {/* Season Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Season Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={seasonData.title}
                  onChange={handleInputChange}
                  placeholder="Enter season title"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  required
                  disabled={uploadStatus === 'uploading'}
                />
              </div>

              {/* Season Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Season Number *
                </label>
                <input
                  type="number"
                  name="seasonNumber"
                  value={seasonData.seasonNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 1, 2, 3"
                  min="1"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  required
                  disabled={uploadStatus === 'uploading'}
                />
              </div>

              {/* Release Year */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Release Year *
                </label>
                <input
                  type="number"
                  name="year"
                  value={seasonData.year}
                  onChange={handleInputChange}
                  placeholder="e.g., 2024"
                  min="1900"
                  max="2030"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  required
                  disabled={uploadStatus === 'uploading'}
                />
              </div>

              {/* Total Episodes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Total Episodes *
                </label>
                <input
                  type="number"
                  name="episodes"
                  value={seasonData.episodes.length}
                  onChange={(e) => setSeasonData(prev => ({
                    ...prev,
                    episodes: Array(parseInt(e.target.value) || 0).fill('')
                  }))}
                  placeholder="Number of episodes"
                  min="1"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  required
                  disabled={uploadStatus === 'uploading'}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Season Description
              </label>
              <textarea
                name="description"
                value={seasonData.description}
                onChange={handleInputChange}
                placeholder="Describe the season plot, themes, or any important details..."
                rows="4"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical disabled:opacity-50"
                disabled={uploadStatus === 'uploading'}
              />
            </div>

            {/* Episode Titles (if episodes count is set) */}
            {seasonData.episodes.length > 0 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">
                  Episode Titles (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {seasonData.episodes.map((episode, index) => (
                    <input
                      key={index}
                      type="text"
                      value={episode}
                      placeholder={`Episode ${index + 1} title`}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm disabled:opacity-50"
                      onChange={(e) => {
                        const newEpisodes = [...seasonData.episodes];
                        newEpisodes[index] = e.target.value;
                        setSeasonData(prev => ({ ...prev, episodes: newEpisodes }));
                      }}
                      disabled={uploadStatus === 'uploading'}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploadStatus === 'uploading'}
              >
                <X size={20} />
                <span>Reset</span>
              </button>
              
              <button
                type="submit"
                className="bg-linear-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedFile || !seasonData.title || !seasonData.seasonNumber || uploadStatus === 'uploading'}
              >
                {uploadStatus === 'uploading' ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Film size={20} />
                )}
                <span>
                  {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Season'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-gray-800 rounded-xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300">
            <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Organized Structure</h3>
            <p className="text-gray-400 text-sm">
              Keep your seasons properly organized with metadata and episode information
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300">
            <Upload className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Batch Upload</h3>
            <p className="text-gray-400 text-sm">
              Upload multiple episodes at once with support for compressed files
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300">
            <FileText className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Rich Metadata</h3>
            <p className="text-gray-400 text-sm">
              Add detailed information including descriptions and episode titles
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonUpload;