/**
 * @file GuideEdit.jsx
 * @description Guide editing page with rich text editing capabilities.
 * Features: Collapsible sidebar, mobile bottom sheet, top formatting toolbar
 * 
 * @version 3.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../api/supabase-client';
import RichTextEditor from '../../../components/RichTextEditor';
import FormattingToolbar from '../../../components/FormattingToolbar';
import { 
  Plus, GripVertical, Trash2, Save, Type, Heading, Image, Minus, List, Quote,
  MapPin, Smartphone, Instagram, FileText, Lightbulb, MoreHorizontal, Loader2,
  X, ArrowUp, ArrowDown, Copy, PanelLeftClose, PanelLeft
} from 'lucide-react';

/** Block type configurations */
const BLOCK_TYPES = {
  text: { label: 'Text', icon: Type, description: 'Rich text paragraph' },
  heading: { label: 'Heading', icon: Heading, description: 'Section heading' },
  image: { label: 'Image', icon: Image, description: 'Upload an image' },
  list: { label: 'Bullet List', icon: List, description: 'Bullet points' },
  quote: { label: 'Quote', icon: Quote, description: 'Highlighted quote' },
  tip: { label: 'Tip', icon: Lightbulb, description: 'Helpful tip' },
  delimiter: { label: 'Divider', icon: Minus, description: 'Section separator' },
  links: { label: 'Location Links', icon: MapPin, description: 'Map links' },
  app_links: { label: 'App Links', icon: Smartphone, description: 'App store links' },
  social_links: { label: 'Social Links', icon: Instagram, description: 'Social media' },
  pdf_links: { label: 'PDF Links', icon: FileText, description: 'PDF documents' },
};

export default function GuideEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalGuide, setOriginalGuide] = useState(null);
  
  const [metadata, setMetadata] = useState({
    title: '', description: '', coverImage: null, coverImageUrl: '', existingCoverUrl: ''
  });
  const [editingMetadata, setEditingMetadata] = useState(false);
  
  const [blocks, setBlocks] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null); // Block selected by clicking
  
  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const [dropPosition, setDropPosition] = useState(null); // 'above' or 'below'
  
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Mobile bottom sheet state
  const [showMobileSheet, setShowMobileSheet] = useState(false);

  // Active editor state for formatting toolbar
  const [activeEditor, setActiveEditor] = useState(null);
  const [activeBlockType, setActiveBlockType] = useState(null);
  const [showFormattingToolbar, setShowFormattingToolbar] = useState(false);

  // Block types that support rich text formatting
  const TEXT_BLOCK_TYPES = ['text', 'heading', 'quote', 'tip'];

  useEffect(() => {
    checkAuthAndLoadGuide();
    fetchCategories();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close any dropdown when clicking outside
      if (activeDropdown && !e.target.closest('.dropdown-container') && !e.target.closest('.options-menu-container')) {
        setActiveDropdown(null);
      }
      // Close mobile sheet when clicking outside
      if (showMobileSheet && !e.target.closest('.mobile-sheet') && !e.target.closest('.mobile-fab')) {
        setShowMobileSheet(false);
      }
    };
    
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setShowMobileSheet(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [activeDropdown, showMobileSheet]);

  // Prevent body scroll when mobile sheet is open
  useEffect(() => {
    if (showMobileSheet) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileSheet]);

  const checkAuthAndLoadGuide = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert('Sign in to edit guides'); navigate('/guides'); return; }
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
      const { data, error } = await supabase.from('guide').select('*').eq('id', id).single();
      if (error) throw error;
      if (!data) { alert('Guide not found'); navigate('/guides'); return; }
      if (data.created_by !== userId) { alert('You can only edit your own guides'); navigate('/guides'); return; }

      setOriginalGuide(data);
      setMetadata({
        title: data.name || '', description: data.description || '',
        coverImage: null, coverImageUrl: '', existingCoverUrl: data.img_url || ''
      });
      setSelectedCategory(data.category || '');

      const content = data.content || {};
      const sections = content.sections || [];
      const loadedBlocks = sections.map((section, index) => {
        const blockId = `block-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
        
        if (['text', 'heading', 'quote', 'tip'].includes(section.type)) {
          return { id: blockId, type: section.type, content: section.body || '' };
        }
        if (section.type === 'image') {
          return { id: blockId, type: 'image', url: section.url || '', caption: section.caption || '', file: null };
        }
        if (section.type === 'list') {
          return { id: blockId, type: 'list', items: section.items || [''] };
        }
        if (section.type === 'delimiter') {
          return { id: blockId, type: 'delimiter', content: '' };
        }
        if (['links', 'app_links', 'pdf_links', 'social_links'].includes(section.type)) {
          return { id: blockId, type: section.type, items: section.items || [] };
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
      const { data, error } = await supabase.from('guide_category').select('id, name').order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) { console.error('Error fetching categories:', error); }
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
      setMetadata(prev => ({ ...prev, coverImage: file, coverImageUrl: url }));
    };
    img.src = url;
  };

  const saveMetadataChanges = () => {
    if (!metadata.title.trim()) { alert('Please enter a title'); return; }
    if (!metadata.description.trim()) { alert('Please enter a description'); return; }
    setEditingMetadata(false);
  };

  const addBlock = (type, afterIndex = null) => {
    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      ...(type === 'image' ? { url: '', caption: '', file: null } :
          type === 'list' ? { items: [''] } :
          ['links', 'social_links', 'pdf_links'].includes(type) ? { items: [{ name: '', url: '' }] } :
          type === 'app_links' ? { items: [{ label: 'Play Store', url: '' }] } :
          { content: '' })
    };

    if (afterIndex !== null && afterIndex >= 0) {
      const newBlocks = [...blocks];
      newBlocks.splice(afterIndex + 1, 0, newBlock);
      setBlocks(newBlocks);
    } else {
      setBlocks([...blocks, newBlock]);
    }
    setActiveDropdown(null);
    setShowMobileSheet(false);
  };

  const updateBlock = (blockId, updates) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, ...updates } : b));
  };

  const deleteBlock = (blockId) => setBlocks(blocks.filter(b => b.id !== blockId));

  const moveBlock = (index, direction) => {
    const newBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < blocks.length) {
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      setBlocks(newBlocks);
    }
  };

  const duplicateBlock = (index) => {
    const newBlock = {
      ...JSON.parse(JSON.stringify(blocks[index])),
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
  };

  const handleImageUpload = (blockId, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateBlock(blockId, { file, url });
  };

  const addListItem = (blockId) => {
    const block = blocks.find(b => b.id === blockId);
    if (block?.items) updateBlock(blockId, { items: [...block.items, ''] });
  };

  const updateListItem = (blockId, itemIndex, value) => {
    const block = blocks.find(b => b.id === blockId);
    if (block?.items) {
      const newItems = [...block.items];
      newItems[itemIndex] = value;
      updateBlock(blockId, { items: newItems });
    }
  };

  const removeListItem = (blockId, itemIndex) => {
    const block = blocks.find(b => b.id === blockId);
    if (block?.items?.length > 1) {
      updateBlock(blockId, { items: block.items.filter((_, i) => i !== itemIndex) });
    }
  };

  const addLinkItem = (blockId, type) => {
    const block = blocks.find(b => b.id === blockId);
    if (block?.items) {
      const newItem = type === 'app_links' ? { label: 'Play Store', url: '' } : { name: '', url: '' };
      updateBlock(blockId, { items: [...block.items, newItem] });
    }
  };

  const updateLinkItem = (blockId, itemIndex, field, value) => {
    const block = blocks.find(b => b.id === blockId);
    if (block?.items) {
      const newItems = [...block.items];
      newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
      updateBlock(blockId, { items: newItems });
    }
  };

  const removeLinkItem = (blockId, itemIndex) => {
    const block = blocks.find(b => b.id === blockId);
    if (block?.items?.length > 1) {
      updateBlock(blockId, { items: block.items.filter((_, i) => i !== itemIndex) });
    }
  };

  const addTag = () => {
    // Split input by commas to allow multiple tags at once
    const inputTags = tagInput.split(',');
    const newTags = [];
    
    inputTags.forEach(t => {
      // Clean each tag: trim, lowercase, remove special characters except spaces, then remove spaces
      const tag = t.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '');
      if (tag && !tags.includes(tag) && !newTags.includes(tag)) {
        newTags.push(tag);
      }
    });
    
    if (newTags.length > 0) {
      setTags([...tags, ...newTags]);
      setTagInput('');
    }
  };

  /**
   * Handle editor focus - show formatting toolbar
   */
  const handleEditorFocus = useCallback((editor, editorId) => {
    const block = blocks.find(b => b.id === editorId);
    if (block && TEXT_BLOCK_TYPES.includes(block.type)) {
      setActiveEditor(editor);
      setActiveBlockType(block.type);
      setShowFormattingToolbar(true);
    }
  }, [blocks]);

  /**
   * Handle editor blur - hide formatting toolbar after delay
   */
  const handleEditorBlur = useCallback((editor, editorId) => {
    setTimeout(() => {
      const activeElement = document.activeElement;
      const isToolbarClick = activeElement?.closest('.formatting-toolbar');
      const isEditorClick = activeElement?.closest('.ProseMirror');
      
      if (!isToolbarClick && !isEditorClick) {
        setShowFormattingToolbar(false);
        setActiveEditor(null);
        setActiveBlockType(null);
      }
    }, 150);
  }, []);

  const uploadImage = async (file, folderPath) => {
    if (!file) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileName = `${user.id}/${folderPath}/${timestamp}_${randomStr}.${fileExt}`;
      
      console.log('Uploading to path:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('guides')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        alert(`Upload failed: ${uploadError.message}`);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('guides')
        .getPublicUrl(fileName);

      console.log('Got public URL:', urlData?.publicUrl);

      if (urlData?.publicUrl) {
        return urlData.publicUrl;
      }
      
      console.error('Failed to get public URL');
      return null;
    } catch (error) {
      console.error('Upload exception:', error);
      alert(`Upload exception: ${error.message}`);
      return null;
    }
  };

  const handleSave = async () => {
    if (!metadata.title.trim()) { alert('Please enter a title'); setEditingMetadata(true); return; }
    if (!metadata.description.trim()) { alert('Please enter a description'); setEditingMetadata(true); return; }

    setSaving(true);
    try {
      const timestamp = Date.now();
      const folderPath = `${timestamp}_${user.id}`;

      let coverImageUrl = metadata.existingCoverUrl;
      if (metadata.coverImage) {
        const uploadedUrl = await uploadImage(metadata.coverImage, folderPath);
        if (uploadedUrl) {
          coverImageUrl = uploadedUrl;
        }
      }

      const processedSections = await Promise.all(blocks.map(async (block) => {
        if (block.type === 'image' && block.file) {
          const uploadedUrl = await uploadImage(block.file, folderPath);
          return { type: 'image', url: uploadedUrl || block.url, caption: block.caption || '' };
        }
        if (block.type === 'image') return { type: 'image', url: block.url, caption: block.caption || '' };
        if (block.type === 'list') return { type: 'list', items: block.items.filter(i => i.trim()) };
        if (['links', 'app_links', 'pdf_links', 'social_links'].includes(block.type)) {
          return { type: block.type, items: block.items.filter(i => (i.name || i.label) && i.url) };
        }
        if (block.type === 'delimiter') return { type: 'delimiter' };
        return { type: block.type, body: block.content || '' };
      }));

      const validSections = processedSections.filter(s => {
        if (s.type === 'delimiter') return true;
        if (s.type === 'image') return !!s.url;
        if (s.type === 'list') return s.items.length > 0;
        if (['links', 'app_links', 'pdf_links', 'social_links'].includes(s.type)) return s.items.length > 0;
        return !!s.body;
      });

      console.log('Saving guide with ID:', id);
      console.log('Update data:', {
        name: metadata.title.trim(),
        description: metadata.description.trim(),
        img_url: coverImageUrl,
        category: selectedCategory || null,
        content: { sections: validSections, tags }
      });

      const { error } = await supabase.from('guide').update({
        name: metadata.title.trim(),
        description: metadata.description.trim(),
        img_url: coverImageUrl,
        category: selectedCategory || null,
        content: { sections: validSections, tags }
      }).eq('id', id);

      if (error) {
        console.error('Supabase update error:', error);
        alert(`Failed to update guide: ${error.message}`);
        return;
      }
      
      alert('Guide updated successfully!');
      navigate(`/guides/guide/${id}`);
    } catch (error) {
      console.error('Save error:', error);
      alert(`Failed to save guide: ${error.message || 'Unknown error'}`);
    } finally { setSaving(false); }
  };

  /* ==========================================================================
     SECTION 1: SIDEBAR COMPONENTS
     ========================================================================== */

  const DesktopSidebar = () => (
    <div 
      className={`
        hidden lg:flex flex-col fixed left-0 h-full bg-white border-r border-gray-200 
        shadow-sm z-30 transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
      `}
      style={{ top: showFormattingToolbar ? '105px' : '57px' }}
    >
      {/* Collapse/Expand Button */}
      <div className="p-2 border-b border-gray-100">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-5 h-5 text-gray-500" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Sidebar Header */}
      {!sidebarCollapsed && (
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Add Content</h2>
          <p className="text-xs text-gray-500 mt-1">Click to add blocks</p>
        </div>
      )}

      {/* Block Type Buttons */}
      <div className={`flex-1 overflow-y-auto ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
        <div className="space-y-1">
          {Object.entries(BLOCK_TYPES).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={type}
                onClick={() => addBlock(type, blocks.length > 0 ? blocks.length - 1 : null)}
                className={`
                  w-full rounded-lg transition-all duration-150 flex items-center
                  hover:bg-blue-50 hover:text-blue-600 group
                  ${sidebarCollapsed ? 'p-3 justify-center' : 'px-3 py-2.5 gap-3 text-left'}
                `}
                title={sidebarCollapsed ? config.label : undefined}
              >
                <div className={`flex-shrink-0 rounded-md ${sidebarCollapsed ? '' : 'p-1.5 bg-gray-100 group-hover:bg-blue-100'}`}>
                  <Icon className={`w-4 h-4 ${sidebarCollapsed ? 'text-gray-600' : 'text-gray-500 group-hover:text-blue-600'}`} />
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600 truncate">{config.label}</div>
                    <div className="text-xs text-gray-400 truncate">{config.description}</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer */}
      {!sidebarCollapsed && (
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500">💡 Tip: Use + button next to blocks to insert at specific positions</p>
        </div>
      )}
    </div>
  );

  const MobileBottomSheet = () => (
    <>
      {showMobileSheet && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowMobileSheet(false)} />
      )}
      <div 
        className={`
          lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl
          transform transition-transform duration-300 ease-out mobile-sheet
          ${showMobileSheet ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ maxHeight: '70vh' }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <div className="px-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Add Content</h2>
            <button onClick={() => setShowMobileSheet(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">Choose a block to add</p>
        </div>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 100px)' }}>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(BLOCK_TYPES).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={type}
                  onClick={() => addBlock(type, blocks.length > 0 ? blocks.length - 1 : null)}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">{config.label}</div>
                    <div className="text-xs text-gray-500 truncate">{config.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );

  const MobileFAB = () => (
    <button
      onClick={() => setShowMobileSheet(true)}
      className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg 
                 flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all mobile-fab"
    >
      <Plus className="w-6 h-6" />
    </button>
  );

  /* ==========================================================================
     BLOCK RENDERING
     ========================================================================== */

  const renderBlock = (block, index) => {
    switch (block.type) {
      case 'text':
        return (
          <RichTextEditor
            content={block.content}
            onChange={(html) => updateBlock(block.id, { content: html })}
            onFocus={handleEditorFocus}
            onBlur={handleEditorBlur}
            placeholder="Start writing..."
            minHeight={120}
            editorId={block.id}
          />
        );

      case 'heading':
        return (
          <RichTextEditor
            content={block.content || '<h2></h2>'}
            onChange={(html) => updateBlock(block.id, { content: html })}
            onFocus={handleEditorFocus}
            onBlur={handleEditorBlur}
            placeholder="Enter heading..."
            minHeight={60}
            editorId={block.id}
          />
        );

      case 'quote':
        return (
          <div className="border-l-4 border-gray-300 pl-4">
            <RichTextEditor
              content={block.content}
              onChange={(html) => updateBlock(block.id, { content: html })}
              onFocus={handleEditorFocus}
              onBlur={handleEditorBlur}
              placeholder="Enter quote..."
              minHeight={80}
              editorId={block.id}
            />
          </div>
        );

      case 'tip':
        return (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
            <div className="flex items-start gap-3 p-4">
              <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <RichTextEditor
                  content={block.content}
                  onChange={(html) => updateBlock(block.id, { content: html })}
                  onFocus={handleEditorFocus}
                  onBlur={handleEditorBlur}
                  placeholder="Enter tip..."
                  minHeight={60}
                  editorId={block.id}
                />
              </div>
            </div>
          </div>
        );

      case 'image':
        return block.url ? (
          <div className="relative group">
            <img src={block.url} alt={block.caption || 'Guide image'} className="w-full rounded-lg object-cover max-h-96" />
            <button onClick={() => updateBlock(block.id, { url: '', file: null })} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
            <input type="text" value={block.caption || ''} onChange={(e) => updateBlock(block.id, { caption: e.target.value })} placeholder="Add caption..." className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50">
            <Image className="w-10 h-10 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Click to upload image</span>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(block.id, e.target.files[0])} className="hidden" />
          </label>
        );

      case 'list':
        return (
          <div className="space-y-2">
            {block.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-gray-400">•</span>
                <input type="text" value={item} onChange={(e) => updateListItem(block.id, i, e.target.value)} placeholder="List item..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                <button onClick={() => removeListItem(block.id, i)} className="p-2 text-gray-400 hover:text-red-500" disabled={block.items.length <= 1}><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={() => addListItem(block.id)} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"><Plus className="w-4 h-4" />Add item</button>
          </div>
        );

      case 'delimiter':
        return (
          <div className="flex justify-center py-4">
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <div className="w-2 h-2 rounded-full bg-gray-300" />
            </div>
          </div>
        );

      case 'links':
      case 'social_links':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              {block.type === 'links' ? <MapPin className="w-4 h-4" /> : <Instagram className="w-4 h-4" />}
              <span>{block.type === 'links' ? 'Location Links' : 'Social Links'}</span>
            </div>
            {block.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="text" value={item.name || ''} onChange={(e) => updateLinkItem(block.id, i, 'name', e.target.value)} placeholder="Link name..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg" />
                <input type="url" value={item.url || ''} onChange={(e) => updateLinkItem(block.id, i, 'url', e.target.value)} placeholder="https://..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg" />
                <button onClick={() => removeLinkItem(block.id, i)} className="p-2 text-gray-400 hover:text-red-500" disabled={block.items.length <= 1}><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={() => addLinkItem(block.id, block.type)} className="flex items-center gap-2 text-sm text-blue-600"><Plus className="w-4 h-4" />Add link</button>
          </div>
        );

      case 'app_links':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2"><Smartphone className="w-4 h-4" /><span>App Store Links</span></div>
            {block.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <select value={item.label || 'Play Store'} onChange={(e) => updateLinkItem(block.id, i, 'label', e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg">
                  <option value="Play Store">Play Store</option>
                  <option value="App Store">App Store</option>
                </select>
                <input type="url" value={item.url || ''} onChange={(e) => updateLinkItem(block.id, i, 'url', e.target.value)} placeholder="https://..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg" />
                <button onClick={() => removeLinkItem(block.id, i)} className="p-2 text-gray-400 hover:text-red-500" disabled={block.items.length <= 1}><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={() => addLinkItem(block.id, 'app_links')} className="flex items-center gap-2 text-sm text-blue-600"><Plus className="w-4 h-4" />Add app link</button>
          </div>
        );

      case 'pdf_links':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2"><FileText className="w-4 h-4" /><span>PDF Links</span></div>
            {block.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="text" value={item.label || item.name || ''} onChange={(e) => updateLinkItem(block.id, i, 'label', e.target.value)} placeholder="PDF name..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg" />
                <input type="url" value={item.url || ''} onChange={(e) => updateLinkItem(block.id, i, 'url', e.target.value)} placeholder="https://..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg" />
                <button onClick={() => removeLinkItem(block.id, i)} className="p-2 text-gray-400 hover:text-red-500" disabled={block.items.length <= 1}><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={() => addLinkItem(block.id, 'pdf_links')} className="flex items-center gap-2 text-sm text-blue-600"><Plus className="w-4 h-4" />Add PDF link</button>
          </div>
        );

      default:
        return <div className="text-gray-400 italic">Unknown block type: {block.type}</div>;
    }
  };

  /* ==========================================================================
     DROPDOWN MENUS
     ========================================================================== */

  const BlockMenu = ({ blockIndex }) => (
    <div className="dropdown-container absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
      <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase">Insert Block</div>
      {Object.entries(BLOCK_TYPES).map(([type, config]) => {
        const Icon = config.icon;
        return (
          <button key={type} onClick={() => addBlock(type, blockIndex)} className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3">
            <Icon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">{config.label}</span>
          </button>
        );
      })}
    </div>
  );

  /* ==========================================================================
     RENDER: LOADING STATE
     ========================================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading guide...</p>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     RENDER: METADATA EDITING MODAL
     ========================================================================== */

  if (editingMetadata) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Guide Info</h1>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input type="text" value={metadata.title} onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))} placeholder="Enter guide title..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea value={metadata.description} onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))} placeholder="Brief description..." rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Select a category</option>
                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image (Square 1:1)</label>
              {(metadata.coverImageUrl || metadata.existingCoverUrl) ? (
                <div className="relative inline-block">
                  <img src={metadata.coverImageUrl || metadata.existingCoverUrl} alt="Cover" className="w-40 h-40 object-cover rounded-lg border" />
                  <button onClick={() => setMetadata(prev => ({ ...prev, coverImage: null, coverImageUrl: '', existingCoverUrl: '' }))} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50">
                  <Image className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Upload</span>
                  <input type="file" accept="image/*" onChange={(e) => handleCoverImageUpload(e.target.files[0])} className="hidden" />
                </label>
              )}
              <p className="text-sm text-gray-500 mt-2">Square format (1:1 ratio) required</p>
            </div>
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={() => setEditingMetadata(false)} className="flex-1 px-6 py-3 text-gray-600 font-medium border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={saveMetadataChanges} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Save Changes</button>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     RENDER: MAIN EDITOR
     ========================================================================== */

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {(metadata.coverImageUrl || metadata.existingCoverUrl) && (
                <img src={metadata.coverImageUrl || metadata.existingCoverUrl} alt={metadata.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-gray-900 truncate">{metadata.title || 'Untitled Guide'}</h2>
                <p className="text-xs text-gray-500 truncate">{metadata.description || 'No description'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditingMetadata(true)} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg">Edit Info</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                {saving ? (<><Loader2 className="animate-spin h-4 w-4" />Saving...</>) : (<><Save className="w-4 h-4" />Update</>)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className={`sticky z-40 formatting-toolbar transition-all duration-300 ${showFormattingToolbar ? 'top-[57px]' : 'top-0'}`}>
        <FormattingToolbar 
          editor={activeEditor} 
          isVisible={showFormattingToolbar}
        />
      </div>

      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Mobile Bottom Sheet */}
      <MobileBottomSheet />

      {/* Mobile FAB */}
      <MobileFAB />

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
          {/* Blocks */}
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <div key={block.id}>
                {/* Drop indicator ABOVE this block */}
                {draggedIndex !== null && dropTargetIndex === index && dropPosition === 'above' && draggedIndex !== index && (
                  <div className="h-1 bg-blue-500 rounded-full mx-2 mb-2 transition-all" />
                )}
                
                <div 
                  className={`group relative transition-all ${draggedIndex === index ? 'opacity-50' : 'opacity-100'} ${selectedBlock === block.id ? 'ring-2 ring-blue-500 ring-opacity-50 rounded-lg' : ''}`}
                  onClick={() => setSelectedBlock(block.id)}
                  data-block-id={block.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    const rect = e.currentTarget.getBoundingClientRect();
                    const midPoint = rect.top + rect.height / 2;
                    const position = e.clientY < midPoint ? 'above' : 'below';
                    setDropTargetIndex(index);
                    setDropPosition(position);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setDropTargetIndex(null);
                      setDropPosition(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                    if (!isNaN(fromIndex) && fromIndex !== index) {
                      let toIndex = index;
                      if (dropPosition === 'below') {
                        toIndex = fromIndex < index ? index : index + 1;
                      } else {
                        toIndex = fromIndex < index ? index - 1 : index;
                      }
                      toIndex = Math.max(0, Math.min(toIndex, blocks.length - 1));
                      if (fromIndex !== toIndex) {
                        const newBlocks = [...blocks];
                        const [movedBlock] = newBlocks.splice(fromIndex, 1);
                        newBlocks.splice(toIndex, 0, movedBlock);
                        setBlocks(newBlocks);
                      }
                    }
                    setDraggedIndex(null);
                    setDropTargetIndex(null);
                    setDropPosition(null);
                  }}
                >
                  {/* Left Controls - visible when block is selected */}
                  <div className={`hidden md:flex absolute left-0 top-0 -ml-14 items-start gap-1 pt-2 transition-opacity ${selectedBlock === block.id ? 'opacity-100' : 'opacity-0'}`}>
                    {/* + Button - UNTOUCHED */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === `add-${block.id}` ? null : `add-${block.id}`);
                      }} 
                      className="p-1.5 hover:bg-gray-100 rounded-md" 
                      title="Add block"
                    >
                      <Plus className="w-4 h-4 text-gray-400" />
                    </button>
                    {/* 6-dot Drag Handle */}
                    <div
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', index.toString());
                        setDraggedIndex(index);
                      }}
                      onDragEnd={(e) => {
                        setDraggedIndex(null);
                        setDropTargetIndex(null);
                        setDropPosition(null);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-md cursor-grab active:cursor-grabbing"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Block Content */}
                  <div className="py-2">
                    {renderBlock(block, index)}
                  </div>

                  {/* Right Controls - 3-dot button */}
                  <div className={`absolute right-0 top-0 -mr-2 md:-mr-10 transition-opacity ${selectedBlock === block.id ? 'opacity-100' : 'opacity-0'}`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === `options-${block.id}` ? null : `options-${block.id}`);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="More options"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Dropdowns - rendered at block level like original */}
                  {activeDropdown === `add-${block.id}` && <BlockMenu blockIndex={index} />}
                  {activeDropdown === `options-${block.id}` && (
                    <div className="dropdown-container absolute left-full top-0 z-20 ml-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1">
                      {index > 0 && (
                        <button
                          onClick={() => {
                            moveBlock(index, 'up');
                            setActiveDropdown(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <ArrowUp className="w-4 h-4" />
                          Move up
                        </button>
                      )}
                      {index < blocks.length - 1 && (
                        <button
                          onClick={() => {
                            moveBlock(index, 'down');
                            setActiveDropdown(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <ArrowDown className="w-4 h-4" />
                          Move down
                        </button>
                      )}
                      <button
                        onClick={() => {
                          duplicateBlock(index);
                          setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={() => {
                          deleteBlock(block.id);
                          setActiveDropdown(null);
                          setSelectedBlock(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
              </div>
              
              {/* Drop indicator BELOW this block */}
              {draggedIndex !== null && dropTargetIndex === index && dropPosition === 'below' && draggedIndex !== index && (
                <div className="h-1 bg-blue-500 rounded-full mx-2 mt-2 transition-all" />
              )}
            </div>
            ))}
          </div>

          {/* Empty State */}
          {blocks.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start adding content</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {window.innerWidth >= 1024 
                  ? 'Use the sidebar on the left to add content blocks'
                  : 'Tap the + button below to add content blocks'
                }
              </p>
              <button
                onClick={() => window.innerWidth >= 1024 ? addBlock('text') : setShowMobileSheet(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Add First Block
              </button>
            </div>
          )}

          {/* Tags Section */}
          {blocks.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <span key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2">
                    #{tag}
                    <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {tags.length === 0 && <span className="text-sm text-gray-400">No tags added yet</span>}
              </div>
              <div className="flex gap-2">
                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTag()} placeholder="Add a tag..." className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                <button onClick={addTag} disabled={!tagInput.trim()} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">Add</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}