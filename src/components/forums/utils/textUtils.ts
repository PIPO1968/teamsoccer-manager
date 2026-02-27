
export const wrapSelectedText = (
  startTag: string, 
  endTag: string, 
  textareaId: string, 
  placeholder: string = 'text',
  onInsert: (markdown: string, cursorOffset?: number) => void
) => {
  const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  
  if (selectedText) {
    // Wrap selected text with HTML tags
    const wrappedText = `${startTag}${selectedText}${endTag}`;
    onInsert(wrappedText, -(endTag.length));
  } else {
    // No text selected, insert placeholder
    const wrappedText = `${startTag}${placeholder}${endTag}`;
    onInsert(wrappedText, -(endTag.length + placeholder.length));
  }
};

export const insertTemplate = (
  template: string, 
  cursorOffset: number, 
  textareaId: string,
  onInsert: (markdown: string, cursorOffset?: number) => void
) => {
  const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
  if (!textarea) return;

  onInsert(template, cursorOffset);
};

export const getActiveTextarea = () => {
  const textareaIds = ['content', 'edit-content'];
  return textareaIds.find(id => document.getElementById(id));
};

export const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
  e.preventDefault();
  action();
};
