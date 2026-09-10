import React, { useState, useEffect, useRef } from 'react';
import { GalleryItem } from '../../types';
import { Image as ImageIcon, Plus, X, Upload } from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';
import { useAuth } from '../../context/AuthContext';
import { galleryService } from '../../services/galleryService';

export const GalleryView: React.FC = () => {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('DAILY_LAB_SESSIONS');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load gallery items from Supabase on mount
  useEffect(() => {
    const loadGallery = async () => {
      const liveItems = await galleryService.fetchGalleryItems();
      if (liveItems && liveItems.length > 0) {
        setItems(liveItems);
      }
    };
    loadGallery();
  }, []);

  const categories = [
    { id: 'ALL', label: 'All Photos' },
    { id: 'DAILY_LAB_SESSIONS', label: 'Daily Lab Sessions' },
    { id: 'WORKSHOPS', label: 'Workshops' },
    { id: 'TALK_SESSIONS', label: 'Talk Sessions' },
    { id: 'HACKATHONS', label: 'Hackathons' },
    { id: 'CAMPUS_COMMUNITY', label: 'Campus Community' },
  ];

  const filteredItems = items.filter(
    (item) => activeCategory === 'ALL' || item.category === activeCategory
  );

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageFile) return;

    setIsUploading(true);
    playCyberClick();

    try {
      const result = await galleryService.uploadPhoto(imageFile, {
        title,
        category,
        description,
      });

      if (result) {
        setItems((prev) => [result, ...prev]);
        playSuccessChime();
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
      setUploadModalOpen(false);
      setTitle('');
      setDescription('');
      setImageFile(null);
      setImagePreview('');
    }
  };

  const resetUploadForm = () => {
    setUploadModalOpen(false);
    setTitle('');
    setDescription('');
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview('');
  };

  return (
    <div className="space-y-8 animate-fade-in font-mono">
      {/* Header */}
      <div className="space-y-2 border-b border-zinc-800 pb-4">
        <h2 className="text-3xl sm:text-4xl font-syne font-black tracking-tight text-white uppercase">
          EVENT & CAMPUS GALLERY
        </h2>
        <p className="text-xs text-zinc-400">
          Photos and moments from daily lab sessions, workshops, and hackathons.
        </p>
      </div>

      {/* Categories Bar & Upload Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                playCyberClick();
                setActiveCategory(c.id);
              }}
              className={`px-3 py-1.5 font-bold uppercase transition-all ${
                activeCategory === c.id
                  ? 'bg-white text-black'
                  : 'bg-[#121218] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => {
                playCyberClick();
                setUploadModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-purple-950 text-purple-200 border border-purple-600 hover:bg-purple-900 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus size={13} />
              <span>+ UPLOAD PHOTO</span>
            </button>
          )}
        </div>
      </div>

      {/* Gallery Grid or Empty State */}
      {filteredItems.length === 0 ? (
        <div className="p-16 bg-[#0a0a0f] border border-zinc-800 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 mx-auto bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400">
            <ImageIcon size={22} />
          </div>
          <div className="space-y-1">
            <h4 className="font-syne font-black text-lg text-white uppercase">
              NO PHOTOS UPLOADED YET
            </h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              {isAdmin
                ? 'Click "+ UPLOAD PHOTO" above to add event and workshop photos to the gallery.'
                : 'Photos from upcoming club sessions and hackathons will appear here.'}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                playCyberClick();
                setUploadModalOpen(true);
              }}
              className="px-5 py-2.5 bg-white text-black font-bold uppercase text-xs hover:bg-zinc-200 inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>+ UPLOAD PHOTO</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#0c0c12] border border-zinc-800 overflow-hidden group hover:border-zinc-500 transition-all shadow-md"
            >
              <div className="aspect-video w-full overflow-hidden bg-black relative">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 text-white text-[9px] uppercase border border-zinc-700">
                  {item.category}
                </span>
              </div>
              <div className="p-4 space-y-1.5">
                <div className="text-[10px] text-zinc-500">{item.date}</div>
                <h4 className="font-syne font-bold text-base text-white">{item.title}</h4>
                {item.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Photo Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#0d0d14] border border-zinc-700 p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="font-bold text-white uppercase">UPLOAD PHOTO TO GALLERY</span>
              <button onClick={resetUploadForm} className="text-zinc-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1 text-[10px]">EVENT / SESSION TITLE</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 text-[10px]">CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
                >
                  <option value="DAILY_LAB_SESSIONS">Daily Lab Sessions</option>
                  <option value="WORKSHOPS">Workshops</option>
                  <option value="TALK_SESSIONS">Talk Sessions</option>
                  <option value="HACKATHONS">Hackathons</option>
                  <option value="CAMPUS_COMMUNITY">Campus Community</option>
                </select>
              </div>

              {/* File Upload Zone */}
              <div>
                <label className="block text-zinc-400 mb-1 text-[10px]">UPLOAD IMAGE</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-2 p-4 ${
                    isDragging
                      ? 'border-purple-400 bg-purple-950/20'
                      : imagePreview
                      ? 'border-zinc-600 bg-black'
                      : 'border-zinc-700 bg-black hover:border-zinc-500'
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative w-full">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-h-40 object-contain rounded-sm"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          URL.revokeObjectURL(imagePreview);
                          setImagePreview('');
                        }}
                        className="absolute top-1 right-1 p-0.5 bg-black/80 border border-zinc-700 text-zinc-400 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                      <div className="text-[9px] text-zinc-500 mt-1 text-center truncate">
                        {imageFile?.name}
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={20} className="text-zinc-500" />
                      <span className="text-zinc-400 text-[10px]">
                        CLICK TO SELECT OR DRAG & DROP AN IMAGE
                      </span>
                      <span className="text-zinc-600 text-[9px]">
                        JPG, PNG, WEBP up to 10MB
                      </span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 text-[10px]">DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetUploadForm}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 border border-zinc-800"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!imageFile || isUploading}
                  className="px-5 py-2 bg-white text-black font-bold uppercase hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isUploading ? (
                    <span>UPLOADING...</span>
                  ) : (
                    <>
                      <Upload size={13} />
                      <span>UPLOAD & PUBLISH</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default GalleryView;