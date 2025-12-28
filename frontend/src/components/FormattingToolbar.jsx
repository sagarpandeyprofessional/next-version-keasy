/**
 * @file FormattingToolbar.jsx
 * @description A fixed top toolbar for rich text formatting (Word/Canva style).
 * Shows only when editing text-based blocks.
 * 
 * Features:
 * - Undo/Redo
 * - Font Family & Size
 * - Bold, Italic, Underline, Strikethrough
 * - Text Color & Highlight Color
 * - Alignment (left, center, right, justify)
 * - Lists (bullet, numbered)
 * - Indentation
 * - Line Spacing
 * - Subscript/Superscript
 * - Links
 * - Clear Formatting
 * 
 * @version 3.0.0
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  IndentIncrease,
  IndentDecrease,
  Heading1,
  Heading2,
  Heading3,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  RemoveFormatting,
  Palette,
  Highlighter,
  ChevronDown,
  Check,
  X,
  Type
} from 'lucide-react';

/* ============================================================================
   CONSTANTS
   ============================================================================ */

const FONT_FAMILIES = [
  { label: 'Default', value: 'inherit' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
  { label: 'Comic Sans', value: 'Comic Sans MS, cursive' },
  { label: 'Impact', value: 'Impact, sans-serif' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
];

const FONT_SIZES = [
  { label: '10', value: '10px' },
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '28', value: '28px' },
  { label: '32', value: '32px' },
  { label: '36', value: '36px' },
  { label: '48', value: '48px' },
];

const LINE_HEIGHTS = [
  { label: '1.0', value: '1' },
  { label: '1.15', value: '1.15' },
  { label: '1.5', value: '1.5' },
  { label: '2.0', value: '2' },
  { label: '2.5', value: '2.5' },
  { label: '3.0', value: '3' },
];

const TEXT_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#FFFFFF',
  '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#9900FF', '#FF00FF',
  '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#CFE2F3', '#D9D2E9', '#EAD1DC',
  '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#9FC5E8', '#B4A7D6', '#D5A6BD',
];

const HIGHLIGHT_COLORS = [
  '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#0000FF', '#FF0000', '#FF9900', '#FFFFFF',
  '#FFFFCC', '#CCFFCC', '#CCFFFF', '#FFCCFF', '#CCCCFF', '#FFCCCC', '#FFE5CC', '#F5F5F5',
];

/* ============================================================================
   SUB-COMPONENTS
   ============================================================================ */

/** Toolbar button - uses onMouseDown to execute command and prevent focus loss */
const ToolbarButton = ({ onClick, isActive, disabled, title, children }) => {
  const handleMouseDown = (e) => {
    e.preventDefault(); // Prevent editor from losing focus
    e.stopPropagation();
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type="button"
      onMouseDown={handleMouseDown}
      disabled={disabled}
      title={title}
      className={`
        p-1.5 sm:p-2 rounded transition-all duration-150
        ${isActive 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );
};

/** Vertical divider */
const ToolbarDivider = () => (
  <div className="w-px h-6 bg-gray-200 mx-0.5 sm:mx-1 hidden sm:block" />
);

/** Dropdown button with menu */
const DropdownButton = ({ label, isOpen, onToggle, children, title, width = 'w-40' }) => (
  <div className="relative">
    <button
      onClick={onToggle}
      title={title}
      className={`
        flex items-center gap-1 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded text-xs sm:text-sm
        transition-all duration-150
        ${isOpen 
          ? 'bg-gray-200 text-gray-900' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
    >
      <span className="truncate max-w-[60px] sm:max-w-[80px]">{label}</span>
      <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    
    {isOpen && (
      <div className={`absolute top-full left-0 mt-1 ${width} bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-64 overflow-y-auto`}>
        {children}
      </div>
    )}
  </div>
);

/** Color picker grid */
const ColorPicker = ({ colors, currentColor, onSelect, onClose }) => (
  <div className="p-2">
    <div className="grid grid-cols-8 gap-1">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => {
            onSelect(color);
            onClose();
          }}
          className={`
            w-5 h-5 sm:w-6 sm:h-6 rounded border-2 transition-transform hover:scale-110
            ${currentColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}
          `}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
    <button
      onClick={() => {
        onSelect(null);
        onClose();
      }}
      className="w-full mt-2 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded flex items-center justify-center gap-1"
    >
      <RemoveFormatting className="w-3 h-3" />
      Remove
    </button>
  </div>
);

/** Link input modal */
const LinkModal = ({ isOpen, onClose, onSubmit, initialUrl = '' }) => {
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url) {
      const finalUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
      onSubmit(finalUrl);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-4 w-96 max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Insert Link</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Insert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

/**
 * FormattingToolbar - Fixed top toolbar for rich text formatting
 * 
 * @param {Object} props
 * @param {Object} props.editor - Tiptap editor instance
 * @param {boolean} props.isVisible - Whether toolbar should be visible
 * @param {string} props.className - Additional CSS classes
 */
export default function FormattingToolbar({ editor, isVisible, className = '' }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  const closeAllDropdowns = useCallback(() => {
    setOpenDropdown(null);
  }, []);

  const toggleDropdown = useCallback((name) => {
    setOpenDropdown(prev => prev === name ? null : name);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.toolbar-dropdown')) {
        closeAllDropdowns();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeAllDropdowns]);

  // Don't render if no editor or not visible
  if (!editor || !isVisible) {
    return null;
  }

  const getCurrentFontFamily = () => {
    const fontFamily = editor.getAttributes('textStyle').fontFamily;
    const found = FONT_FAMILIES.find(f => f.value === fontFamily);
    return found ? found.label : 'Default';
  };

  const getCurrentFontSize = () => {
    const fontSize = editor.getAttributes('textStyle').fontSize;
    const found = FONT_SIZES.find(f => f.value === fontSize);
    return found ? found.label : '16';
  };

  const getCurrentLineHeight = () => {
    const attrs = editor.getAttributes('paragraph');
    return attrs.lineHeight || '1.5';
  };

  const handleLinkClick = () => {
    setLinkModalOpen(true);
  };

  const handleLinkSubmit = (url) => {
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const handleUnlink = () => {
    editor.chain().focus().unsetLink().run();
  };

  return (
    <>
      <div 
        className={`
          bg-white border-b border-gray-200 px-2 sm:px-4 py-2
          transition-all duration-300 ease-in-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}
          ${className}
        `}
      >
        <div className="flex flex-wrap items-center gap-0.5 sm:gap-1 max-w-5xl mx-auto">
          {/* Undo / Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Font Family */}
          <div className="toolbar-dropdown hidden sm:block">
            <DropdownButton
              label={getCurrentFontFamily()}
              isOpen={openDropdown === 'fontFamily'}
              onToggle={() => toggleDropdown('fontFamily')}
              title="Font Family"
              width="w-48"
            >
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font.value}
                  onClick={() => {
                    editor.chain().focus().setFontFamily(font.value).run();
                    closeAllDropdowns();
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between"
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                  {getCurrentFontFamily() === font.label && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </DropdownButton>
          </div>

          {/* Font Size */}
          <div className="toolbar-dropdown">
            <DropdownButton
              label={getCurrentFontSize()}
              isOpen={openDropdown === 'fontSize'}
              onToggle={() => toggleDropdown('fontSize')}
              title="Font Size"
              width="w-20"
            >
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => {
                    editor.chain().focus().setFontSize(size.value).run();
                    closeAllDropdowns();
                  }}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 flex items-center justify-between"
                >
                  {size.label}
                  {getCurrentFontSize() === size.label && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </DropdownButton>
          </div>

          <ToolbarDivider />

          {/* Headings - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarDivider />
          </div>

          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>

          {/* Subscript / Superscript - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              isActive={editor.isActive('subscript')}
              title="Subscript"
            >
              <SubscriptIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              isActive={editor.isActive('superscript')}
              title="Superscript"
            >
              <SuperscriptIcon className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Text Color */}
          <div className="toolbar-dropdown relative">
            <button
              onClick={() => toggleDropdown('textColor')}
              title="Text Color"
              className={`
                p-1.5 sm:p-2 rounded transition-all duration-150 flex items-center gap-1
                ${openDropdown === 'textColor' 
                  ? 'bg-gray-200 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <Palette className="w-4 h-4" />
              <div 
                className="w-4 h-1 rounded-sm" 
                style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}
              />
            </button>
            {openDropdown === 'textColor' && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <ColorPicker
                  colors={TEXT_COLORS}
                  currentColor={editor.getAttributes('textStyle').color}
                  onSelect={(color) => {
                    if (color) {
                      editor.chain().focus().setColor(color).run();
                    } else {
                      editor.chain().focus().unsetColor().run();
                    }
                  }}
                  onClose={closeAllDropdowns}
                />
              </div>
            )}
          </div>

          {/* Highlight Color */}
          <div className="toolbar-dropdown relative">
            <button
              onClick={() => toggleDropdown('highlightColor')}
              title="Highlight Color"
              className={`
                p-1.5 sm:p-2 rounded transition-all duration-150 flex items-center gap-1
                ${openDropdown === 'highlightColor' 
                  ? 'bg-gray-200 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <Highlighter className="w-4 h-4" />
              <div 
                className="w-4 h-1 rounded-sm border border-gray-300" 
                style={{ backgroundColor: editor.getAttributes('highlight').color || '#FFFF00' }}
              />
            </button>
            {openDropdown === 'highlightColor' && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <ColorPicker
                  colors={HIGHLIGHT_COLORS}
                  currentColor={editor.getAttributes('highlight').color}
                  onSelect={(color) => {
                    if (color) {
                      editor.chain().focus().toggleHighlight({ color }).run();
                    } else {
                      editor.chain().focus().unsetHighlight().run();
                    }
                  }}
                  onClose={closeAllDropdowns}
                />
              </div>
            )}
          </div>

          <ToolbarDivider />

          {/* Alignment */}
          <div className="hidden sm:flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={editor.isActive({ textAlign: 'justify' })}
              title="Justify"
            >
              <AlignJustify className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => {
              console.log('Bullet list clicked');
              console.log('Editor exists:', !!editor);
              console.log('Can toggle bullet list:', editor.can().toggleBulletList());
              const result = editor.chain().focus().toggleBulletList().run();
              console.log('Toggle result:', result);
            }}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              console.log('Ordered list clicked');
              console.log('Editor exists:', !!editor);
              console.log('Can toggle ordered list:', editor.can().toggleOrderedList());
              const result = editor.chain().focus().toggleOrderedList().run();
              console.log('Toggle result:', result);
            }}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>

          {/* Indentation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().decreaseIndent().run()}
              title="Decrease Indent"
            >
              <IndentDecrease className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().increaseIndent().run()}
              title="Increase Indent"
            >
              <IndentIncrease className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Line Spacing - Hidden on mobile */}
          <div className="toolbar-dropdown hidden lg:block">
            <DropdownButton
              label={`${getCurrentLineHeight()}x`}
              isOpen={openDropdown === 'lineHeight'}
              onToggle={() => toggleDropdown('lineHeight')}
              title="Line Spacing"
              width="w-24"
            >
              {LINE_HEIGHTS.map((lh) => (
                <button
                  key={lh.value}
                  onClick={() => {
                    editor.chain().focus().setLineHeight(lh.value).run();
                    closeAllDropdowns();
                  }}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 flex items-center justify-between"
                >
                  {lh.label}
                  {getCurrentLineHeight() === lh.value && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </DropdownButton>
          </div>

          <ToolbarDivider />

          {/* Link */}
          <ToolbarButton
            onClick={handleLinkClick}
            isActive={editor.isActive('link')}
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          {editor.isActive('link') && (
            <ToolbarButton
              onClick={handleUnlink}
              title="Remove Link"
            >
              <Unlink className="w-4 h-4" />
            </ToolbarButton>
          )}

          <ToolbarDivider />

          {/* Clear Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Link Modal */}
      <LinkModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onSubmit={handleLinkSubmit}
        initialUrl={editor?.getAttributes('link').href || ''}
      />
    </>
  );
}