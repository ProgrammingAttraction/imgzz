import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  CloudUpload, 
  Image as ImageIcon, 
  Trash2, 
  X, 
  Loader,
  Copy,
  ExternalLink,
  Upload,
  Grid,
  List,
  Search,
  Calendar,
  Clock,
  Download,
  CheckCircle,
  AlertCircle,
  Eye,
  MoreVertical,
  Share2,
  Info,
  Sparkles,
  FolderOpen,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Star,
  Zap
} from 'lucide-react';

const Home = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  
  // State management
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoDelete, setAutoDelete] = useState('no');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterType, setFilterType] = useState('all');
  const [selectedImages, setSelectedImages] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    week: 0,
    month: 0
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Fetch all images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Update stats when images change
  useEffect(() => {
    updateStats();
  }, [images]);

  // Reset to first page when search, filter, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, sortBy]);

  // Update stats
  const updateStats = () => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));

    setStats({
      total: images.length,
      today: images.filter(img => new Date(img.createdAt) >= today).length,
      week: images.filter(img => new Date(img.createdAt) >= weekAgo).length,
      month: images.filter(img => new Date(img.createdAt) >= monthAgo).length
    });
  };

  // Fetch all images
  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/admin/images`);
      if (response.data.success) {
        setImages(response.data.data);
        toast.success('Gallery refreshed!', {
          icon: '✨',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      }
    } catch (error) {
      toast.error('Failed to fetch images', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#EF4444',
          color: '#fff',
        },
      });
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    validateAndSetFiles(files);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    validateAndSetFiles(files);
  };

  // Validate and set files
  const validateAndSetFiles = (files) => {
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValid) {
        toast.error(`${file.name} is not an image file`, {
          icon: '⚠️',
          style: {
            borderRadius: '10px',
            background: '#F59E0B',
            color: '#fff',
          },
        });
      }
      if (!isValidSize) {
        toast.error(`${file.name} exceeds 5MB limit`, {
          icon: '📦',
          style: {
            borderRadius: '10px',
            background: '#EF4444',
            color: '#fff',
          },
        });
      }
      
      return isValid && isValidSize;
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      
      // Create preview URLs
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
      
      toast.success(`${validFiles.length} file(s) selected successfully!`, {
        icon: '✅',
        style: {
          borderRadius: '10px',
          background: '#10B981',
          color: '#fff',
        },
      });
    }
  };

  // Remove file from selection
  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    
    toast('File removed', {
      icon: '🗑️',
      style: {
        borderRadius: '10px',
        background: '#6B7280',
        color: '#fff',
      },
    });
  };

  // Clear all selected files
  const clearSelectedFiles = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    setUploadProgress(0);
    
    toast('Selection cleared', {
      icon: '🧹',
      style: {
        borderRadius: '10px',
        background: '#6B7280',
        color: '#fff',
      },
    });
  };

  // Upload images
  const uploadImages = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image', {
        icon: '📸',
        style: {
          borderRadius: '10px',
          background: '#EF4444',
          color: '#fff',
        },
      });
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      setUploading(true);
      
      const response = await axios.post(`${base_url}/api/admin/upload/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        toast.success(`✨ Successfully uploaded ${response.data.data.length} images!`, {
          duration: 4000,
          style: {
            borderRadius: '10px',
            background: '#10B981',
            color: '#fff',
          },
          icon: '🎉',
        });
        
        clearSelectedFiles();
        await fetchImages();
        setShowUploadModal(false);
        
        if (autoDelete === 'yes') {
          setTimeout(() => {
            toast.success('Auto-delete timer started', {
              icon: '⏰',
              style: {
                borderRadius: '10px',
                background: '#3B82F6',
                color: '#fff',
              },
            });
          }, 1000);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#EF4444',
          color: '#fff',
        },
      });
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete image
  const deleteImage = async (id, imageUrl) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await axios.delete(`${base_url}/api/admin/image/${id}`);
      
      if (response.data.success) {
        toast.success('Image deleted successfully', {
          icon: '🗑️',
          style: {
            borderRadius: '10px',
            background: '#10B981',
            color: '#fff',
          },
        });
        
        setImages(prev => prev.filter(img => img._id !== id));
        if (selectedImage?._id === id) {
          setShowPreviewModal(false);
        }
      }
    } catch (error) {
      toast.error('Failed to delete image', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#EF4444',
          color: '#fff',
        },
      });
      console.error('Delete error:', error);
    }
  };

  // Copy URL to clipboard with enhanced toast
  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copied to clipboard! 📋', {
        duration: 2000,
        style: {
          borderRadius: '10px',
          background: '#3B82F6',
          color: '#fff',
          fontSize: '14px',
          padding: '16px',
        },
        icon: '✅',
      });
      
      // Optional: Show a small preview of the copied URL
      toast.success(url.substring(0, 30) + '...', {
        duration: 2000,
        style: {
          borderRadius: '10px',
          background: '#1F2937',
          color: '#9CA3AF',
          fontSize: '12px',
        },
      });
    } catch (error) {
      toast.error('Failed to copy URL', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#EF4444',
          color: '#fff',
        },
      });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter and sort images
  const getFilteredAndSortedImages = () => {
    let filtered = images.filter(image => 
      image.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply type filter
    if (filterType !== 'all') {
      const now = new Date();
      switch(filterType) {
        case 'today':
          const today = new Date(now.setHours(0, 0, 0, 0));
          filtered = filtered.filter(img => new Date(img.createdAt) >= today);
          break;
        case 'week':
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          filtered = filtered.filter(img => new Date(img.createdAt) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          filtered = filtered.filter(img => new Date(img.createdAt) >= monthAgo);
          break;
        default:
          break;
      }
    }

    // Apply sorting
    switch(sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredImages = getFilteredAndSortedImages();
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentImages = filteredImages.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Handle image click for preview
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowPreviewModal(true);
  };

  // Close preview modal
  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setSelectedImage(null);
  };

  // Download image
  const downloadImage = async (url, name) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = name || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('Image downloaded successfully! 📥', {
        icon: '✅',
        style: {
          borderRadius: '10px',
          background: '#10B981',
          color: '#fff',
        },
      });
    } catch (error) {
      toast.error('Failed to download image', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#EF4444',
          color: '#fff',
        },
      });
    }
  };

  // Toggle image selection for bulk actions
  const toggleImageSelection = (imageId) => {
    setSelectedImages(prev => {
      if (prev.includes(imageId)) {
        return prev.filter(id => id !== imageId);
      } else {
        return [...prev, imageId];
      }
    });
  };

  // Refresh gallery
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchImages();
    setRefreshing(false);
  };

  // Get image type from name
  const getImageType = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    const types = {
      'png': 'PNG',
      'jpg': 'JPEG',
      'jpeg': 'JPEG',
      'gif': 'GIF',
      'webp': 'WEBP',
      'svg': 'SVG'
    };
    return types[ext] || 'Image';
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="min-h-screen font-League bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-lg  border-b border-gray-300 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 group">
              <div className="p-3 bg-blue-600 rounded-[10px] shadow-sm group-hover:shadow-xl transition-all transform group-hover:scale-110">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Image Gallery Pro
                </h1>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  Professional media management
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 text-gray-600 bg-white border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-all transform hover:scale-105  disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => setShowUploadModal(true)}
                className="group inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-[10px] hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 hover:shadow-xl"
              >
                <Upload className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Upload Images
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { label: 'Total Images', value: stats.total, icon: ImageIcon, color: 'blue' },
              { label: 'Today', value: stats.today, icon: Clock, color: 'green' },
              { label: 'This Week', value: stats.week, icon: Calendar, color: 'purple' },
              { label: 'This Month', value: stats.month, icon: FolderOpen, color: 'orange' }
            ].map((stat, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                <div className="flex items-center gap-2">
                  <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                    <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-[10px]  p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search images by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              <div className="flex items-center gap-2 bg-gray-100 rounded-[10px]  border-[1px] border-gray-200 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'table' 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Images Display */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading your gallery...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-[10px] p-16 text-center border border-gray-200">
            <div className="relative">
              <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-gray-400" />
              </div>
              {searchTerm && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-white rounded-full p-2 shadow-lg">
                  <Filter className="w-4 h-4" />
                </div>
              )}
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm ? 'No matching images' : 'Welcome to your gallery!'}
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {searchTerm 
                ? `No images found matching "${searchTerm}". Try a different search term.`
                : 'Start building your professional image library by uploading your first image.'}
            </p>
            
            {!searchTerm && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl group"
              >
                <Upload className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Upload Your First Image
                <Zap className="w-4 h-4 ml-2 group-hover:animate-ping" />
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentImages.map((image) => (
              <div
                key={image._id}
                className="group bg-white rounded-[10px]  overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100"
                onClick={() => handleImageClick(image)}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300?text=Error+Loading+Image';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Image Type Badge */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-lg">
                    {getImageType(image.name)}
                  </div>
                  
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 right-3">
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(image._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleImageSelection(image._id);
                      }}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(image.url);
                      }}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-lg hover:shadow-xl"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(image.url, '_blank');
                      }}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-lg hover:shadow-xl"
                      title="View Original"
                    >
                      <Eye className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(image._id, image.url);
                      }}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-red-50 transition-colors shadow-lg hover:shadow-xl"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {image.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(image.createdAt)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(image.url, image.name);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white/80 backdrop-blur-sm rounded-[10px] overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name & Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                {currentImages.map((image,index) => (
                  <tr key={image._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                     {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="w-16 h-16 rounded-[10px] overflow-hidden cursor-pointer border-[1px] border-gray-200 transition-shadow"
                        onClick={() => handleImageClick(image)}
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{image.name}</span>
                        <span className="text-xs text-gray-500 mt-1">{getImageType(image.name)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(image.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(image.url)}
                          className="p-2 bg-blue-600 text-white rounded-[5px] transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(image.url, '_blank')}
                          className="p-2 bg-green-600 text-white rounded-[5px] transition-colors"
                          title="View"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadImage(image.url, image.name)}
                          className="p-2 bg-purple-600 text-white rounded-[5px] transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteImage(image._id, image.url)}
                          className="p-2 bg-red-600 text-white rounded-[5px] transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredImages.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, filteredImages.length)}</span> of{' '}
                <span className="font-medium">{filteredImages.length}</span> images
              </p>
              
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm text-sm"
                >
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={16}>16</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`dots-${index}`} className="px-4 py-2 text-gray-400">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto bg-[rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
         

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              {/* Modal Header */}
              <div className="px-6 py-5 bg-blue-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    Upload Images
                  </h3>
                  <button
                    onClick={() => !uploading && setShowUploadModal(false)}
                    className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-blue-100 text-sm mt-1">
                  Drag & drop or click to upload up to 5MB per image
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Drag & Drop Area */}
                <div
                  className={`relative border-3 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50 scale-105' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => !uploading && document.getElementById('fileInput').click()}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="fileInput"
                    disabled={uploading}
                  />
                  
                  <div className={`p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-28 h-28 mx-auto mb-4 flex items-center justify-center transition-all ${
                    dragActive ? 'scale-110' : ''
                  }`}>
                    <CloudUpload className={`w-14 h-14 ${
                      dragActive ? 'text-blue-600 animate-bounce' : 'text-gray-500'
                    }`} />
                  </div>
                  
                  <p className="text-lg font-medium text-gray-700 mb-1">
                    {dragActive ? 'Drop to upload' : 'Drop files here'}
                  </p>
                  <p className="text-gray-500 mb-3">or</p>
                  <span className={`inline-flex items-center px-6 py-3 ${
                    uploading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 cursor-pointer'
                  } text-white font-medium rounded-xl transition-all transform hover:scale-105 shadow-lg`}>
                    <Upload className="w-5 h-5 mr-2" />
                    Browse Files
                  </span>
                  
                  <p className="text-xs text-gray-400 mt-4">
                    Supported formats: PNG, JPG, GIF, WEBP (Max: 5MB each)
                  </p>
                </div>

                {/* Selected Files Preview */}
                {previewUrls.length > 0 && (
                  <div className="mt-6 animate-fadeIn">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Selected Files ({selectedFiles.length})
                      </h4>
                      <button
                        onClick={clearSelectedFiles}
                        disabled={uploading}
                        className="text-sm text-red-600 hover:text-red-700 disabled:text-red-300 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear all
                      </button>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-3 bg-gray-50 rounded-xl">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group animate-scaleIn">
                          <div className="relative rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-all">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {!uploading && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSelectedFile(index);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600 transform hover:scale-110"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                          <div className="absolute bottom-1 left-1 right-1">
                            <p className="text-[10px] text-white bg-black/50 backdrop-blur-sm px-1 py-0.5 rounded truncate">
                              {selectedFiles[index]?.name || `Image ${index + 1}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                      <div className="mt-4 animate-slideUp">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Uploading...</span>
                          <span className="text-sm font-medium text-blue-600">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300 relative"
                            style={{ width: `${uploadProgress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          {uploadProgress < 100 
                            ? `Uploading ${selectedFiles.length} file(s)...` 
                            : 'Processing...'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50/80 backdrop-blur-sm flex justify-end gap-3 border-t border-gray-200">
                <button
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={uploadImages}
                  disabled={uploading || selectedFiles.length === 0}
                  className="px-8 py-3 bg-blue-600 text-white rounded-[10px] cursor-pointer disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload {selectedFiles.length} Image{selectedFiles.length !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreviewModal && selectedImage && (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.4)] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="relative">
                {/* Close button */}
                <button
                  onClick={closePreviewModal}
                  className="absolute top-4 right-4 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg hover:shadow-xl transform hover:scale-110"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Image */}
                <div className="relative p-[20px]">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.name}
                    className="w-full h-[200px] object-contain"
                  />
                </div>

                {/* Image Info */}
                <div className="p-6 bg-white ">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedImage.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {getImageType(selectedImage.name)}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                          ID: {selectedImage._id.slice(-6)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500">Upload Date</p>
                        <p className="font-medium">{formatDate(selectedImage.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500">Upload Time</p>
                        <p className="font-medium">
                          {new Date(selectedImage.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      onClick={() => copyToClipboard(selectedImage.url)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all transform hover:scale-105"
                    >
                      <Copy className="w-4 h-4" />
                      Copy URL
                    </button>
                    <button
                      onClick={() => window.open(selectedImage.url, '_blank')}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </button>
                    <button
                      onClick={() => downloadImage(selectedImage.url, selectedImage.name)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all transform hover:scale-105"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => {
                        deleteImage(selectedImage._id, selectedImage.url);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all transform hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Home;