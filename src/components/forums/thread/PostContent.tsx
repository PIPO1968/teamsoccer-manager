
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import MarkdownEditorButtons from "@/components/forums/MarkdownEditorButtons";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface PostContentProps {
  content: string;
  isEditing: boolean;
  editContent: string;
  onEditChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onMarkdownInsert: (markdown: string, cursorOffset?: number) => void;
}

// Function to preprocess content to handle line breaks properly
const preprocessContent = (content: string): string => {
  // Normalize line endings first
  let processed = content.replace(/\r\n/g, '\n');
  
  // Handle multiple consecutive newlines by converting them to HTML breaks
  // This preserves the visual spacing that users expect
  processed = processed.replace(/\n{3,}/g, (match) => {
    // Convert 3+ newlines to multiple <br> tags
    const count = match.length - 2; // Subtract 2 to account for paragraph break
    return '\n\n' + '<br>'.repeat(count);
  });
  
  // Convert single newlines to HTML line breaks
  processed = processed.replace(/(?<!\n)\n(?!\n)/g, '<br>');
  
  return processed;
};

// Function to ensure URLs have proper protocol
const ensureProtocol = (url: string): string => {
  if (!url) return url;
  
  // Check if URL already has a protocol
  if (url.match(/^https?:\/\//i)) {
    return url;
  }
  
  // Check if it's a mailto link
  if (url.match(/^mailto:/i)) {
    return url;
  }
  
  // Check if it's a relative link (starts with / or #)
  if (url.startsWith('/') || url.startsWith('#')) {
    return url;
  }
  
  // Add http:// prefix for all other URLs
  return `http://${url}`;
};

export default function PostContent({
  content,
  isEditing,
  editContent,
  onEditChange,
  onSave,
  onCancel,
  onMarkdownInsert
}: PostContentProps) {
  return isEditing ? (
    <div className="space-y-4">
      <MarkdownEditorButtons onInsert={onMarkdownInsert} />
      <Textarea
        id="edit-content"
        rows={4}
        className="min-h-[120px] resize-y"
        value={editContent}
        onChange={(e) => onEditChange(e.target.value)}
      />
      <div className="flex gap-2 mt-2">
        <Button onClick={onSave}>
          Save Changes
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  ) : (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ href, children, ...props }) => (
            <a 
              href={ensureProtocol(href || '')} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
              {...props}
            >
              {children}
            </a>
          ),
          h1: ({ children, ...props }) => (
            <h1 className="text-2xl font-bold mb-4 mt-6" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-xl font-bold mb-3 mt-5" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-lg font-bold mb-2 mt-4" {...props}>
              {children}
            </h3>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside my-2" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside my-2" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="my-1" {...props}>
              {children}
            </li>
          )
        }}
      >
        {preprocessContent(content)}
      </ReactMarkdown>
    </div>
  );
}
