
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, Code } from "lucide-react";
import { wrapSelectedText, getActiveTextarea, handleButtonClick } from "../utils/textUtils";
import { MarkdownEditorButtonsProps } from "../types/editorTypes";

export default function FormattingButtons({ onInsert }: MarkdownEditorButtonsProps) {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => handleButtonClick(e, () => {
          const activeTextarea = getActiveTextarea();
          if (activeTextarea) {
            wrapSelectedText('<b>', '</b>', activeTextarea, 'bold text', onInsert);
          }
        })}
        title="Bold"
        type="button"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => handleButtonClick(e, () => {
          const activeTextarea = getActiveTextarea();
          if (activeTextarea) {
            wrapSelectedText('<i>', '</i>', activeTextarea, 'italic text', onInsert);
          }
        })}
        title="Italic"
        type="button"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => handleButtonClick(e, () => {
          const activeTextarea = getActiveTextarea();
          if (activeTextarea) {
            wrapSelectedText('<u>', '</u>', activeTextarea, 'underlined text', onInsert);
          }
        })}
        title="Underline"
        type="button"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => handleButtonClick(e, () => {
          const activeTextarea = getActiveTextarea();
          if (activeTextarea) {
            wrapSelectedText('<code>', '</code>', activeTextarea, 'code', onInsert);
          }
        })}
        title="Inline Code"
        type="button"
      >
        <Code className="h-4 w-4" />
      </Button>
    </>
  );
}
