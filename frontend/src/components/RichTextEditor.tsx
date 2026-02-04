"use client";

/**
 * @file RichTextEditor.jsx
 * @description A rich text editor component built with Tiptap.
 * This version exposes the editor instance for external toolbar control.
 * 
 * @version 3.0.0
 */

import type { Editor } from '@tiptap/core';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import FontFamily from '@tiptap/extension-font-family';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import { Extension } from '@tiptap/core';

/* ============================================================================
   CUSTOM EXTENSIONS
   ============================================================================ */

/**
 * Custom FontSize extension for Tiptap
 */
const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize }).run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
      },
    } as any;
  },
});

/**
 * Custom LineHeight extension
 */
const LineHeight = Extension.create({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      defaultLineHeight: '1.5',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultLineHeight,
            parseHTML: element => element.style.lineHeight || this.options.defaultLineHeight,
            renderHTML: attributes => {
              if (!attributes.lineHeight) {
                return {};
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight: lineHeight => ({ commands }) => {
        return this.options.types.every(type => 
          commands.updateAttributes(type, { lineHeight })
        );
      },
    } as any;
  },
});

/**
 * Custom Indent extension
 */
const Indent = Extension.create({
  name: 'indent',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      minLevel: 0,
      maxLevel: 8,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: element => {
              const marginLeft = element.style.marginLeft;
              if (marginLeft) {
                return parseInt(marginLeft) / 40;
              }
              return 0;
            },
            renderHTML: attributes => {
              if (!attributes.indent || attributes.indent === 0) {
                return {};
              }
              return {
                style: `margin-left: ${attributes.indent * 40}px`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      increaseIndent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        const { from, to } = selection;
        
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            if (currentIndent < this.options.maxLevel) {
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                indent: currentIndent + 1,
              });
            }
          }
        });
        
        if (dispatch) dispatch(tr);
        return true;
      },
      decreaseIndent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        const { from, to } = selection;
        
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            if (currentIndent > this.options.minLevel) {
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                indent: currentIndent - 1,
              });
            }
          }
        });
        
        if (dispatch) dispatch(tr);
        return true;
      },
    } as any;
  },
});

/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

/**
 * RichTextEditor Component
 * 
 * A text editor that exposes its editor instance for external toolbar control.
 * 
 * @param {Object} props
 * @param {string} props.content - Initial HTML content
 * @param {Function} props.onChange - Callback when content changes
 * @param {Function} props.onEditorReady - Callback when editor is ready, receives editor instance
 * @param {Function} props.onFocus - Callback when editor receives focus
 * @param {Function} props.onBlur - Callback when editor loses focus
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.minHeight - Minimum height in pixels
 * @param {string} props.editorId - Unique identifier for this editor
 */
type RichTextEditorProps = {
  content?: string;
  onChange?: (html: string) => void;
  onEditorReady?: (editor: Editor, editorId: string) => void;
  onFocus?: (editor: Editor, editorId: string) => void;
  onBlur?: (editor: Editor, editorId: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  editorId?: string;
};

export default function RichTextEditor({
  content = '',
  onChange,
  onEditorReady,
  onFocus,
  onBlur,
  placeholder = 'Start writing...',
  className = '',
  minHeight = 120,
  editorId = '',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // Ensure lists are enabled (they are by default, but being explicit)
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      FontSize,
      LineHeight,
      Indent,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Subscript,
      Superscript,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    onFocus: () => {
      if (onFocus) {
        onFocus(editor, editorId);
      }
    },
    onBlur: () => {
      if (onBlur) {
        onBlur(editor, editorId);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none focus:outline-none',
      },
    },
  });

  // Notify parent when editor is ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor, editorId);
    }
  }, [editor, onEditorReady, editorId]);

  // Loading state
  if (!editor) {
    return (
      <div className="animate-pulse bg-gray-50 rounded-lg" style={{ minHeight }}>
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`border border-gray-200 rounded-lg bg-white overflow-hidden ${className}`}
      onClick={() => editor.chain().focus().run()}
    >
      <div 
        className="p-3 sm:p-4 overflow-auto"
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
      </div>
      
      {/* List styling for the editor */}
      <style>{`
        .ProseMirror ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin: 0.5rem 0 !important;
        }
        .ProseMirror ol {
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin: 0.5rem 0 !important;
        }
        .ProseMirror ul li,
        .ProseMirror ol li {
          display: list-item !important;
          margin: 0.25rem 0 !important;
        }
        .ProseMirror ul li::marker {
          color: #374151;
        }
        .ProseMirror ol li::marker {
          color: #374151;
          font-weight: 500;
        }
        .ProseMirror ul ul {
          list-style-type: circle !important;
        }
        .ProseMirror ul ul ul {
          list-style-type: square !important;
        }
      `}</style>
    </div>
  );
}

// Export the useEditor hook for custom usage
export { useEditor };
