
export interface MarkdownEditorButtonsProps {
  onInsert: (markdown: string, cursorOffset?: number) => void;
}

export interface ButtonClickHandler {
  (e: React.MouseEvent, action: () => void): void;
}
