
import { Button } from "@/components/ui/button";
import { Link, Image } from "lucide-react";
import { wrapSelectedText, getActiveTextarea, handleButtonClick, insertTemplate } from "../utils/textUtils";
import { MarkdownEditorButtonsProps } from "../types/editorTypes";

export default function MediaButtons({ onInsert }: MarkdownEditorButtonsProps) {
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
              wrapSelectedText('<a href="url">', '</a>', activeTextarea, '', onInsert);
            } else {
              insertTemplate('<a href="url">link text</a>', -12, activeTextarea, onInsert);
            }
          }
        })}
        title="Link"
        type="button"
      >
        <Link className="h-4 w-4" />
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
              const wrappedText = `<img src="image_url" alt="${selectedText}" />`;
              onInsert(wrappedText, 0);
            } else {
              insertTemplate('<img src="image_url" alt="alt text" />', -13, activeTextarea, onInsert);
            }
          }
        })}
        title="Image"
        type="button"
      >
        <Image className="h-4 w-4" />
      </Button>
    </>
  );
}
