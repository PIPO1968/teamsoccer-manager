
import { Button } from "@/components/ui/button";
import { ListOrdered, List, Quote } from "lucide-react";
import { wrapSelectedText, getActiveTextarea, handleButtonClick } from "../utils/textUtils";
import { MarkdownEditorButtonsProps } from "../types/editorTypes";

export default function StructureButtons({ onInsert }: MarkdownEditorButtonsProps) {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => handleButtonClick(e, () => {
          const activeTextarea = getActiveTextarea();
          if (activeTextarea) {
            const textarea = document.getElementById(activeTextarea) as HTMLTextAreaElement;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = textarea.value.substring(start, end);
            
            if (selectedText) {
              const listItems = selectedText.split('\n').map(line => `<li>${line.trim()}</li>`).join('');
              const wrappedText = `<ol>${listItems}</ol>`;
              onInsert(wrappedText, 0);
            } else {
              const template = '<ol><li>item</li></ol>';
              onInsert(template, -10);
            }
          }
        })}
        title="Numbered List"
        type="button"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => handleButtonClick(e, () => {
          const activeTextarea = getActiveTextarea();
          if (activeTextarea) {
            const textarea = document.getElementById(activeTextarea) as HTMLTextAreaElement;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = textarea.value.substring(start, end);
            
            if (selectedText) {
              const listItems = selectedText.split('\n').map(line => `<li>${line.trim()}</li>`).join('');
              const wrappedText = `<ul>${listItems}</ul>`;
              onInsert(wrappedText, 0);
            } else {
              const template = '<ul><li>item</li></ul>';
              onInsert(template, -10);
            }
          }
        })}
        title="Bullet List"
        type="button"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => handleButtonClick(e, () => {
          const activeTextarea = getActiveTextarea();
          if (activeTextarea) {
            wrapSelectedText('<blockquote>', '</blockquote>', activeTextarea, 'quote', onInsert);
          }
        })}
        title="Quote"
        type="button"
      >
        <Quote className="h-4 w-4" />
      </Button>
    </>
  );
}
