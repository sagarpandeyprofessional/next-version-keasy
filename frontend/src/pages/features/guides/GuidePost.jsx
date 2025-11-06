import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../api/supabase-client';
import { 
  Plus,
  GripVertical,
  Trash2,
  Save,
  Sparkles,
  Type,
  Heading,
  Image,
  Minus,
  List,
  Quote,
  MapPin,
  Smartphone,
  Instagram,
  FileText,
  Lightbulb,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';

export default function GuideEditor() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [showConvertMenu, setShowConvertMenu] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    checkAuth();
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeDropdown && !e.target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Sign in to create a guide');
        navigate('/guides');
        return;
      }
      
      setUser(user);
      setLoading(false);
    } catch (error) {
      console.error('Auth error:', error);
      alert('Sign in to create a guide');
      navigate('/guides');
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('guide_category')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const addBlock = (type, afterIndex = null) => {
    const newBlock = { 
      id: Date.now() + Math.random(), 
      type,
      content: ''
    };

    if (type === 'image') {
      newBlock.url = '';
      newBlock.caption = '';
      newBlock.file = null;
    } else if (type === 'links') {
      newBlock.items = [{ name: '', url: '' }];
    } else if (type === 'app_links') {
      newBlock.items = [{ label: 'Play Store', url: '' }];
    } else if (type === 'pdf_links') {
      newBlock.items = [{ label: '', url: '' }];
    } else if (type === 'social_links') {
      newBlock.items = [{ name: '', url: '' }];
    } else if (type === 'list') {
      newBlock.items = [''];
    }

    if (afterIndex !== null) {
      const newBlocks = [...blocks];
      newBlocks.splice(afterIndex + 1, 0, newBlock);
      setBlocks(newBlocks);
    } else {
      setBlocks([...blocks, newBlock]);
    }
    
    setActiveDropdown(null);
  };

  const updateBlock = (id, updates) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBlock = (id) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index, direction) => {
    const newBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < blocks.length) {
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      setBlocks(newBlocks);
    }
  };

  const handleImageUpload = (blockId, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateBlock(blockId, { file, url });
  };

  const uploadImage = async (file, folderPath) => {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
      const filePath = `${folderPath}/${fileName}`;

      console.log('Uploading to path:', filePath); // Debug log

      const { error } = await supabase.storage
        .from('guides')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error details:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('guides')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const extractMetadata = () => {
    let title = '';
    let description = '';
    let coverImageBlock = null;
    const contentSections = [];
    let foundTitle = false;
    let foundDescription = false;
    let foundCoverImage = false;

    for (const block of blocks) {
      // Extract first heading as title
      if (!foundTitle && block.type === 'heading' && block.content.trim()) {
        title = block.content.trim();
        foundTitle = true;
        continue;
      }

      // Extract first text as description
      if (!foundDescription && block.type === 'text' && block.content.trim()) {
        description = block.content.trim();
        foundDescription = true;
        continue;
      }

      // Extract first image as cover
      if (!foundCoverImage && block.type === 'image' && (block.url || block.file)) {
        coverImageBlock = block;
        foundCoverImage = true;
        continue;
      }

      // Add all remaining blocks to content
      if (block.type === 'text' && block.content.trim()) {
        contentSections.push({ type: 'text', body: block.content });
      } else if (block.type === 'heading' && block.content.trim()) {
        contentSections.push({ type: 'heading', body: block.content });
      } else if (block.type === 'image' && (block.url || block.file)) {
        contentSections.push({ 
          type: 'image', 
          url: block.url, 
          caption: block.caption,
          file: block.file 
        });
      } else if (block.type === 'tip' && block.content.trim()) {
        contentSections.push({ type: 'tip', body: block.content });
      } else if (block.type === 'quote' && block.content.trim()) {
        contentSections.push({ type: 'quote', body: block.content });
      } else if (block.type === 'delimiter') {
        contentSections.push({ type: 'delimiter' });
      } else if (block.type === 'list' && block.items?.length > 0) {
        const filteredItems = block.items.filter(i => i.trim());
        if (filteredItems.length > 0) {
          contentSections.push({ type: 'list', items: filteredItems });
        }
      } else if (block.type === 'links' && block.items?.some(i => i.name || i.url)) {
        contentSections.push({ type: 'links', items: block.items.filter(i => i.name && i.url) });
      } else if (block.type === 'app_links' && block.items?.some(i => i.url)) {
        contentSections.push({ type: 'app_links', items: block.items.filter(i => i.url) });
      } else if (block.type === 'pdf_links' && block.items?.some(i => i.url)) {
        contentSections.push({ type: 'pdf_links', items: block.items.filter(i => i.url) });
      } else if (block.type === 'social_links' && block.items?.some(i => i.name || i.url)) {
        contentSections.push({ type: 'social_links', items: block.items.filter(i => i.name && i.url) });
      }
    }

    return { title, description, coverImageBlock, contentSections };
  };

  const handleSave = async () => {
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    setSaving(true);

    try {
      const { title, description, coverImageBlock, contentSections } = extractMetadata();

      if (!title) {
        alert('Please add at least one heading as the title');
        setSaving(false);
        return;
      }

      // Create folder name: created_at_created_by
      const timestamp = Date.now();
      const folderPath = `${timestamp}_${user.id}`;

      // Upload cover image
      let coverImageUrl = '';
      if (coverImageBlock?.file) {
        coverImageUrl = await uploadImage(coverImageBlock.file, folderPath);
      }

      // Upload section images
      const processedSections = await Promise.all(
        contentSections.map(async (section) => {
          if (section.type === 'image' && section.file) {
            const imageUrl = await uploadImage(section.file, folderPath);
            return { 
              type: section.type, 
              url: imageUrl, 
              caption: section.caption 
            };
          }
          const { file, ...cleanSection } = section;
          return cleanSection;
        })
      );

      const content = {
        sections: processedSections,
        tags: tags
      };
      const { data, error } = await supabase
        .from('guide')
        .insert({
          name: title,
          description: description || '',
          img_url: coverImageUrl,
          content: content,
          category: selectedCategory,
          created_by: user.id,
          view: 0,






// update






          like: {}
        })
        .select()
        .single();

      if (error) throw error;

      alert('Guide created successfully!');
      navigate(`/guides/guide/${data.id}`);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save guide. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const BlockMenu = ({ blockIndex }) => (
    <div className="dropdown-container absolute left-0 top-0 z-10 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 max-h-80 overflow-y-auto">
      <button
        onClick={() => addBlock('text', blockIndex)}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
      >
        <Type className="w-4 h-4 text-gray-500" />
        Text
      </button>
      <button
        onClick={() => addBlock('heading', blockIndex)}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
      >
        <Heading className="w-4 h-4 text-gray-500" />
        Heading
      </button>
      <button
        onClick={() => addBlock('image', blockIndex)}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
      >
        <Image className="w-4 h-4 text-gray-500" />
        Image
      </button>
      <button
        onClick={() => addBlock('list', blockIndex)}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
      >
        <List className="w-4 h-4 text-gray-500" />
        Bullet Points
      </button>
      <button
        onClick={() => addBlock('quote', blockIndex)}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
      >
        <Quote className="w-4 h-4 text-gray-500" />
        Quote
      </button>
      <button
        onClick={() => addBlock('delimiter', blockIndex)}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
      >
        <Minus className="w-4 h-4 text-gray-500" />
        Delimiter
      </button>
      <button
        onClick={() => addBlock('tip', blockIndex)}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
      >
        <Lightbulb className="w-4 h-4 text-gray-500" />
        Tip
      </button>
      <button
        onClick={() => addBlock('links', blockIndex)}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
      >
        <MapPin className="w-4 h-4 text-gray-500" />
        Location Links
      </button>
      <button
        onClick={() => addBlock('app_links', blockIndex)}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
      >
        <Smartphone className="w-4 h-4 text-gray-500" />
        App Links
      </button>
      <button
        onClick={() => addBlock('social_links', blockIndex)}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
      >
        <Instagram className="w-4 h-4 text-gray-500" />
        Social Links
      </button>
      <button
        onClick={() => addBlock('pdf_links', blockIndex)}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
      >
        <FileText className="w-4 h-4 text-gray-500" />
        PDF Links
      </button>
    </div>
  );

  const BlockOptions = ({ block, index }) => {
    const convertTo = (newType) => {
      const newBlock = { ...block, type: newType };
      
      if (newType === 'image') {
        newBlock.url = '';
        newBlock.caption = '';
        newBlock.file = null;
      } else if (newType === 'list') {
        newBlock.items = block.content ? [block.content] : [''];
        delete newBlock.content;
      } else if (['links', 'app_links', 'pdf_links', 'social_links'].includes(newType)) {
        newBlock.items = [{ name: '', url: '' }];
        delete newBlock.content;
      } else if (['text', 'heading', 'quote', 'tip'].includes(newType)) {
        if (block.items) {
          newBlock.content = block.items.join(', ');
          delete newBlock.items;
        }
      }
      
      setBlocks(blocks.map(b => b.id === block.id ? newBlock : b));
      setActiveDropdown(null);
      setShowConvertMenu(null);
    };

    return (
      <div className="dropdown-container absolute right-0 top-0 z-20 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1">
        <div className="relative">
          <button
            onMouseEnter={() => setShowConvertMenu(block.id)}
            onClick={() => setShowConvertMenu(showConvertMenu === block.id ? null : block.id)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
          >
            Convert to
            <ChevronDown className={`w-4 h-4 transition-transform ${showConvertMenu === block.id ? 'rotate-180' : ''}`} />
          </button>
          
          {showConvertMenu === block.id && (
            <div className="absolute left-full top-0 ml-1 w-40 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-30">
              <button onClick={() => convertTo('text')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">Text</button>
              <button onClick={() => convertTo('heading')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">Heading</button>
              <button onClick={() => convertTo('quote')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">Quote</button>
              <button onClick={() => convertTo('tip')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">Tip</button>
              <button onClick={() => convertTo('list')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">Bullet Points</button>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 my-1"></div>
        
        {index > 0 && (
          <button
            onClick={() => {
              moveBlock(index, 'up');
              setActiveDropdown(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
          >
            Move up
          </button>
        )}
        {index < blocks.length - 1 && (
          <button
            onClick={() => {
              moveBlock(index, 'down');
              setActiveDropdown(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
          >
            Move down
          </button>
        )}
        
        <div className="border-t border-gray-200 my-1"></div>
        
        <button
          onClick={() => {
            deleteBlock(block.id);
            setActiveDropdown(null);
          }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600"
        >
          Delete
        </button>
      </div>
    );
  };

  const renderBlock = (block, index) => {
    switch (block.type) {
      case 'text':
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            placeholder="Start typing..."
            className="w-full min-h-24 p-0 text-base text-gray-800 bg-transparent border-none focus:outline-none resize-none"
          />
        );

      case 'heading':
        return (
          <input
            type="text"
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            placeholder="Heading"
            className="w-full p-0 text-2xl md:text-3xl font-bold text-gray-900 bg-transparent border-none focus:outline-none"
          />
        );

      case 'image':
        return (
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(block.id, e.target.files?.[0])}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {block.url && (
              <img src={block.url} alt="Preview" className="w-full rounded-lg border border-gray-200" />
            )}
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
              placeholder="Image caption (optional)"
              className="w-full p-2 text-sm text-gray-600 bg-transparent border-none focus:outline-none"
            />
          </div>
        );

      case 'list':
        return (
          <div className="space-y-2 mx-10">
            {block.items?.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-gray-400 mt-2 ">•</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...block.items];
                    newItems[idx] = e.target.value;
                    updateBlock(block.id, { items: newItems });
                  }}
                  placeholder="List item"
                  className="flex-1 p-0 bg-transparent border-none focus:outline-none"
                />
                {block.items.length > 1 && (
                  <button
                    onClick={() => {
                      const newItems = block.items.filter((_, i) => i !== idx);
                      updateBlock(block.id, { items: newItems });
                    }}
                    className="text-red-400 hover:text-red-600 mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => updateBlock(block.id, { items: [...block.items, ''] })}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add item
            </button>
          </div>
        );

      case 'quote':
        return (
          <div className="border-l-4 border-gray-300 pl-4">
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Quote"
              className="w-full min-h-16 p-0 text-lg italic text-gray-700 bg-transparent border-none focus:outline-none resize-none"
            />
          </div>
        );

      case 'delimiter':
        return (
          <div className="flex justify-center py-4">
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            </div>
          </div>
        );

      case 'tip':
        return (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Add your tip here..."
              className="w-full min-h-16 bg-transparent border-none focus:outline-none resize-none text-gray-800"
            />
          </div>
        );

      case 'links':
        return (
          <div className="space-y-2">
            {block.items?.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => {
                    const newItems = [...block.items];
                    newItems[idx].name = e.target.value;
                    updateBlock(block.id, { items: newItems });
                  }}
                  placeholder="Location name"
                  className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  value={item.url}
                  onChange={(e) => {
                    const newItems = [...block.items];
                    newItems[idx].url = e.target.value;
                    updateBlock(block.id, { items: newItems });
                  }}
                  placeholder="URL"
                  className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <button
              onClick={() => updateBlock(block.id, { items: [...block.items, { name: '', url: '' }] })}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add location
            </button>
          </div>
        );

      case 'app_links':
        return (
          <div className="space-y-2">
            {block.items?.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-2">
                <select
                  value={item.label}
                  onChange={(e) => {
                    const newItems = [...block.items];
                    newItems[idx].label = e.target.value;
                    updateBlock(block.id, { items: newItems });
                  }}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Play Store">Play Store</option>
                  <option value="App Store">App Store</option>
                </select>
                <input
                  type="url"
                  value={item.url}
                  onChange={(e) => {
                    const newItems = [...block.items];
                    newItems[idx].url = e.target.value;
                    updateBlock(block.id, { items: newItems });
                  }}
                  placeholder="App URL"
                  className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        );

      case 'pdf_links':
        return (
          <div className="space-y-2">
            {block.items?.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => {
                    const newItems = [...block.items];
                    newItems[idx].label = e.target.value;
                    updateBlock(block.id, { items: newItems });
                  }}
                  placeholder="PDF name"
                  className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  value={item.url}
                  onChange={(e) => {
                    const newItems = [...block.items];
                    newItems[idx].url = e.target.value;
                    updateBlock(block.id, { items: newItems });
                  }}
                  placeholder="PDF URL"
                  className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        );

      case 'social_links':
        return (
          <div className="space-y-2">
            {block.items?.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => {
                    const newItems = [...block.items];
                    newItems[idx].name = e.target.value;
                    updateBlock(block.id, { items: newItems });
                  }}
                  placeholder="Account name"
                  className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  value={item.url}
                  onChange={(e) => {
                    const newItems = [...block.items];
                    newItems[idx].url = e.target.value;
                    updateBlock(block.id, { items: newItems });
                  }}
                  placeholder="Instagram URL"
                  className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 sm:flex-none sm:w-48 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/guides')}
              className="flex-1 sm:flex-none px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        {/* Blocks */}
        <div className="space-y-1">
          {blocks.map((block, index) => (
            <div key={block.id}>
              <div
                className="group relative"
                onMouseEnter={() => setHoveredBlock(block.id)}
                onMouseLeave={() => setHoveredBlock(null)}
              >
                {/* Left Controls - Hidden on mobile */}
                <div className={`hidden md:flex absolute left-0 top-0 -ml-12 items-start gap-1 transition-opacity ${hoveredBlock === block.id ? 'opacity-100' : 'opacity-0'}`}>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === `add-${block.id}` ? null : `add-${block.id}`)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Add block"
                  >
                    <Plus className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded cursor-grab" title="Drag to reorder">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Block Content */}
                <div className="py-2">
                  {renderBlock(block, index)}
                </div>

                {/* Right Controls - Always visible on mobile */}
                <div className={`absolute right-0 top-0 -mr-2 md:-mr-10 transition-opacity ${hoveredBlock === block.id || window.innerWidth < 768 ? 'opacity-100' : 'opacity-0'}`}>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === `options-${block.id}` ? null : `options-${block.id}`)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="More options"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Dropdowns */}
                {activeDropdown === `add-${block.id}` && <BlockMenu blockIndex={index} />}
                {activeDropdown === `options-${block.id}` && <BlockOptions block={block} index={index} />}
              </div>

              {/* Plus button for next line */}
              {index === blocks.length - 1 && (
                <div 
                  className="group relative py-1"
                  onMouseEnter={() => setHoveredBlock(`next-${block.id}`)}
                  onMouseLeave={() => setHoveredBlock(null)}
                >
                  <div className={`hidden md:block absolute left-0 top-0 -ml-12 transition-opacity ${hoveredBlock === `next-${block.id}` ? 'opacity-100' : 'opacity-0'}`}>
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === `add-next-${block.id}` ? null : `add-next-${block.id}`)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Add block"
                    >
                      <Plus className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  
                  <div className="text-gray-300 text-sm py-2">
                    {hoveredBlock === `next-${block.id}` ? 'Click + to add content' : ''}
                  </div>

                  {activeDropdown === `add-next-${block.id}` && <BlockMenu blockIndex={index} />}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add First Block */}
        {blocks.length === 0 && (
          <div className="relative">
            <button
              onClick={() => setActiveDropdown('initial')}
              className="group w-full text-left py-3 px-2 text-gray-400 hover:text-gray-600 flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-base md:text-lg">Click to add content</span>
            </button>
            {activeDropdown === 'initial' && <BlockMenu blockIndex={null} />}
          </div>
        )}

        {/* Mobile Add Button - Floating */}
        {blocks.length > 0 && (
          <div className="md:hidden fixed bottom-18 left-1/2 transform -translate-x-1/2 z-40">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'mobile-add' ? null : 'mobile-add')}
              className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
            {activeDropdown === 'mobile-add' && (
              <div className="absolute bottom-80 right-0 mb-2">
                <BlockMenu blockIndex={blocks.length - 1} />
              </div>
            )}
          </div>
        )}

        {/* Tags Section */}
        {blocks.length > 0 && (
          <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2"
                >
                  #{tag}
                  <button
                    onClick={() => setTags(tags.filter(t => t !== tag))}
                    className="hover:text-gray-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add a tag..."
                className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}