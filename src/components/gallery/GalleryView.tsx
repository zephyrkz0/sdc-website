import React, { useState } from 'react';
import { GalleryItem } from '../../types';
import { Image as ImageIcon, Plus, X, Upload } from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../common/AudioEffects';
import { useAuth } from '../../context/AuthContext';

export const GalleryView: React.FC = () => {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('DAILY_LAB_SESSIONS');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

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

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      title,
      category,
      imageUrl,
      description,
      date: new Date().toISOString().split('T')[0],
    };

    setItems((prev) => [newItem, ...prev]);
    playSuccessChime();
    setUploadModalOpen(false);
    setTitle('');
    setImageUrl('');
    setDescription('');
  };

  return (
    <div className="space-y-8 animate-fade-in font-mono">
      {/* Header (Frame 13) */}
      <div className="space-y-2 border-b border-zinc-800 pb-4">
        <h2 className="text-3xl sm:text-4xl font-syne font-black tracking-tight text-white uppercase">
          EVENT & CAMPUS GALLERY
        </h2>
        <p className="text-xs text-zinc-400">
          Photos and moments from daily lab sessions, workshops, and hackathons.
        </p>
      </div>

      {/* Categories Bar & Upload Button (Frame 13) */}
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

      {/* Gallery Grid or Empty State (Frame 13) */}
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
              <button onClick={() => setUploadModalOpen(false)} className="text-zinc-500 hover:text-white">
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

              <div>
                <label className="block text-zinc-400 mb-1 text-[10px]">IMAGE URL</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none"
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
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 border border-zinc-800"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black font-bold uppercase hover:bg-zinc-200"
                >
                  SAVE & PUBLISH
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