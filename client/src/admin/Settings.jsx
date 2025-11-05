import React, { useState, useRef, useEffect } from 'react';

const Settings = () => {
  const [userData, setUserData] = useState({
    username: '',
    profileImage: null,
    imagePreview: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  // Handle username input change
  const handleUsernameChange = (e) => {
    setUserData({
      ...userData,
      username: e.target.value
    });
  };

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const user = await response.json();
          setUserData(prev => ({
            ...prev,
            username: user.username,
            imagePreview: user.profileImageUrl || ''
          }));
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };

    loadUserProfile();
  }, []);

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUserData({
          ...userData,
          profileImage: file,
          imagePreview: e.target.result
        });
      };
      reader.readAsDataURL(file);
      setMessage('');
    }
  };

  // Trigger file input click
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setUserData({
      ...userData,
      profileImage: null,
      imagePreview: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!userData.username.trim()) {
      setMessage('Please enter a username');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Update username - FIXED: Use correct backend URL
      const profileResponse = await fetch('http://localhost:5000/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: userData.username })
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      // Upload image if selected - FIXED: Use correct backend URL
      if (userData.profileImage) {
        const imageFormData = new FormData();
        imageFormData.append('profileImage', userData.profileImage);
        
        const imageResponse = await fetch('http://localhost:5000/api/user/profile-image', {
          method: 'POST',
          body: imageFormData
        });

        if (!imageResponse.ok) {
          const errorData = await imageResponse.json();
          throw new Error(errorData.message || 'Failed to upload image');
        }
      }

      setMessage('Profile updated successfully!');
      
      // Clear form but keep the new username in state if you want
      setUserData(prev => ({
        ...prev,
        profileImage: null,
        imagePreview: ''
      }));
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error saving data:', error);
      setMessage(error.message || 'Error saving profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto mt-10">
        <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-linear-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
              Profile Settings
            </h2>
            <p className="text-gray-400 mt-2">Manage your account preferences</p>
          </div>

          {/* Settings Form */}
          <div className="space-y-6">
            {/* Input for umuadmin */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={userData.username}
                onChange={handleUsernameChange}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl 
                         text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                         focus:ring-red-500 focus:border-transparent transition-all duration-300
                         hover:border-gray-500"
              />
            </div>

            {/* Profile Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Profile Image
              </label>
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {userData.imagePreview ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative group">
                      <img 
                        src={userData.imagePreview} 
                        alt="Profile preview" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-600 
                                 shadow-lg group-hover:border-red-500 transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                                    flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Change</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleRemoveImage}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg 
                               transition-all duration-300 transform hover:scale-105 text-sm font-medium"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={handleImageClick}
                    className="border-2 border-dashed border-gray-600 rounded-2xl p-8 text-center 
                             cursor-pointer transition-all duration-300 hover:border-red-500 
                             hover:bg-gray-700/30 group"
                  >
                    <div className="space-y-3">
                      <div className="text-4xl text-gray-400 group-hover:text-red-400 transition-colors">
                        📷
                      </div>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                        Click to upload profile image
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Button yo gukora save */}
            <button 
              onClick={handleSave}
              disabled={isLoading || !userData.username.trim()}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 
                       transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-offset-gray-900 focus:ring-red-500 ${
                         isLoading || !userData.username.trim()
                           ? 'bg-gray-600 cursor-not-allowed opacity-50'
                           : 'bg-linear-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700'
                       }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Profile'
              )}
            </button>

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-xl border text-center font-medium transition-all duration-300 ${
                message.includes('Error') 
                  ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                  : 'bg-green-500/20 border-green-500/50 text-green-400'
              }`}>
                {message}
              </div>
            )}
          </div>

          
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <div className="text-center text-gray-400 text-sm">
              <p>Your profile information will be visible to other users</p>
              <p className="mt-1">Make sure to choose a username that represents you well!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;