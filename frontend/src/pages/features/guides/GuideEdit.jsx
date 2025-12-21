import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  MoreHorizontal,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function GuideEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalGuide, setOriginalGuide] = useState(null);
  
  // Metadata (separate from content)
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    coverImage: null,
    coverImageUrl: '',
    existingCoverUrl: ''
  });
  const [editingMetadata, setEditingMetadata] = useState(false);
  
  // Content blocks
  const [blocks, setBlocks] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [showConvertMenu, setShowConvertMenu] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    checkAuthAndLoadGuide();
    fetchCategories();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeDropdown && !e.target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const checkAuthAndLoadGuide = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Sign in to edit guides');
        navigate('/guides');
        return;
      }
      
      setUser(user);
      await loadGuide(user.id);
    } catch (error) {
      console.error('Auth error:', error);
      alert('Sign in to edit guides');
      navigate('/guides');
    }
  };

  const loadGuide = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('guide')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        alert('Guide not found');
        navigate('/guides');
        return;
      }

      if (data.created_by !== userId) {
        alert('You can only edit your own guides');
        navigate('/guides');
        return;
      }

      setOriginalGuide(data);

      // Load metadata
      setMetadata({
        title: data.name || '',
        description: data.description || '',
        coverImage: null,
        coverImageUrl: '',
        existingCoverUrl: data.img_url || ''
      });

      setSelectedCategory(data.category || '');

      // Load content blocks
      const content = data.content || {};
      const sections = content.sections || [];
      const loadedBlocks = sections.map((section, index) => {
        const blockId = Date.now() + index + Math.random();
        
        if (section.type === 'text' || section.type === 'heading' || 
            section.type === 'quote' || section.type === 'tip') {
          return {
            id: blockId,
            type: section.type,
            content: section.body || ''
          };
        } else if (section.type === 'image') {
          return {
            id: blockId,
            type: 'image',
            url: section.url || '',
            caption: section.caption || '',
            file: null
          };
        } else if (section.type === 'list') {
          return {
            id: blockId,
            type: 'list',
            items: section.items || ['']
          };
        } else if (section.type === 'delimiter') {
          return {
            id: blockId,
            type: 'delimiter',
            content: ''
          };
        } else if (['links', 'app_links', 'pdf_links', 'social_links'].includes(section.type)) {
          return {
            id: blockId,
            type: section.type,
            items: section.items || []
          };
        }
        
        return null;
      }).filter(Boolean);

      setBlocks(loadedBlocks);
      setTags(content.tags || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading guide:', error);
      alert('Failed to load guide');
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

  const handleCoverImageUpload = (file) => {
    if (!file) return;
    
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      if (aspectRatio < 0.9 || aspectRatio > 1.1) {
        alert('Please upload a square image (1:1 aspect ratio)');
        URL.revokeObjectURL(url);
        return;
      }
      
      setMetadata(prev => ({
        ...prev,
        coverImage: file,
        coverImageUrl: url
      }));
    };
    
    img.src = url;
  };

  const saveMetadataChanges = () => {
    if (!metadata.title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!metadata.description.trim()) {
      alert('Please enter a description');
      return;
    }
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }
    
    setEditingMetadata(false);
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
      const fileExt = file.name.split(".").pop();
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileName = `${user.id}/${folderPath}/${timestamp}_${randomStr}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('guides')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('guides')
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        return urlData.publicUrl;
      }
      
      throw new Error('Failed to get public URL');
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const buildContentSections = () => {
    const contentSections = [];

    for (const block of blocks) {
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

    return contentSections;
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const timestamp = originalGuide.created_at ? new Date(originalGuide.created_at).getTime() : Date.now();
      const folderPath = `${timestamp}_${user.id}`;

      let finalCoverUrl = metadata.existingCoverUrl;

      // Upload new cover image if changed
      if (metadata.coverImage) {
        finalCoverUrl = await uploadImage(metadata.coverImage, folderPath);
      }

      // Build and upload content images
      const contentSections = buildContentSections();
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

      const { error } = await supabase
        .from('guide')
        .update({
          name: metadata.title,
          description: metadata.description,
          img_url: finalCoverUrl,
          content: content,
          category: selectedCategory
        })
        .eq('id', id);

      if (error) throw error;

      alert('Guide updated successfully!');
      navigate(`/guides/guide/${id}`);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to update guide. Please try again.');
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
      <button onClick={() => addBlock('text', blockIndex)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
        <Type className="w-4 h-4 text-gray-500" />
        Text
      </button>
      <button onClick={() => addBlock('heading', blockIndex)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
        <Heading className="w-4 h-4 text-gray-500" />
        Heading
      </button>
      <button onClick={() => addBlock('image', blockIndex)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
        <Image className="w-4 h-4 text-gray-500" />
        Image
      </button>
      <button onClick={() => addBlock('list', blockIndex)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
        <List className="w-4 h-4 text-gray-500" />
        Bullet Points
      </button>
      <button onClick={() => addBlock('quote', blockIndex)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
        <Quote className="w-4 h-4 text-gray-500" />
        Quote
      </button>
      <button onClick={() => addBlock('delimiter', blockIndex)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
        <Minus className="w-4 h-4 text-gray-500" />
        Delimiter
      </button>
      <button onClick={() => addBlock('tip', blockIndex)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
        <Lightbulb className="w-4 h-4 text-gray-500" />
        Tip
      </button>
      <button onClick={() => addBlock('links', blockIndex)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
        <MapPin className="w-4 h-4 text-gray-500" />
        Location Links
      </button>
      <button onClick={() => addBlock('app_links', blockIndex)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
        <Smartphone className="w-4 h-4 text-gray-500" />
        App Links
      </button>
      <button onClick={() => addBlock('social_links', blockIndex)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
        <Instagram className="w-4 h-4 text-gray-500" />
        Social Links
      </button>
      <button onClick={() => addBlock('pdf_links', blockIndex)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
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
                <span className="text-gray-400 mt-2">•</span>
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
            <button
              onClick={() => updateBlock(block.id, { items: [...block.items, { label: '', url: '' }] })}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add PDF
            </button>
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
            <button
              onClick={() => updateBlock(block.id, { items: [...block.items, { name: '', url: '' }] })}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add social link
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading guide...</p>
        </div>
      </div>
    );
  }

  // Metadata edit modal
  if (editingMetadata) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Guide Info</h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Update the information that appears in the guides feed.
            </p>

            <div className="space-y-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={metadata.title}
                  onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a compelling title for your guide"
                  maxLength={100}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">{metadata.title.length}/100 characters</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={metadata.description}
                  onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Write a brief description that will attract readers"
                  maxLength={300}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500 mt-1">{metadata.description.length}/300 characters</p>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image (Square) <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  {(metadata.coverImageUrl || metadata.existingCoverUrl) ? (
                    <div className="space-y-3">
                      <img 
                        src={metadata.coverImageUrl || metadata.existingCoverUrl} 
                        alt="Cover preview" 
                        className="w-48 h-48 mx-auto rounded-lg object-cover border-2 border-gray-200"
                      />
                      <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 block">
                        Change image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCoverImageUpload(e.target.files?.[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div>
                      <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 font-medium">Upload an image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCoverImageUpload(e.target.files?.[0])}
                          className="hidden"
                        />
                      </label>
                      <p className="text-sm text-gray-500 mt-2">Square format (1:1 ratio) required</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setEditingMetadata(false)}
                className="flex-1 px-6 py-3 text-gray-600 hover:text-gray-900 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveMetadataChanges}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Content editor
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {(metadata.coverImageUrl || metadata.existingCoverUrl) && (
                <img 
                  src={metadata.coverImageUrl || metadata.existingCoverUrl} 
                  alt={metadata.title}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-gray-900 truncate">{metadata.title}</h2>
                <p className="text-xs text-gray-500 truncate">{metadata.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingMetadata(true)}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Edit Info
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update
                  </>
                )}
              </button>
            </div>
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
                {/* Left Controls */}
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

                {/* Right Controls */}
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

        {/* Mobile Add Button */}
        {blocks.length > 0 && (
          <div className="md:hidden fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'mobile-add' ? null : 'mobile-add')}
              className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
            {activeDropdown === 'mobile-add' && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 mb-2">
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