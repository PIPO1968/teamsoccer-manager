
import { Button } from "@/components/ui/button";
import { Heading1, Heading2, Heading3 } from "lucide-react";
import { wrapSelectedText, getActiveTextarea, handleButtonClick } from "../utils/textUtils";
import { MarkdownEditorButtonsProps } from "../types/editorTypes";

export default function HeadingButtons({ onInsert }: MarkdownEditorButtonsProps) {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => handleButtonClick(e, () => {
          const activeTextarea = getActiveTextarea();
          if (activeTextarea) {
            wrapSelectedText('<h1>', '</h1>', activeTextarea, 'Main Heading', onInsert);
          }
        })}
        title="Main Heading (H1)"
        type="button"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => handleButtonClick(e, () => {
          const activeTextarea = getActiveTextarea();
          if (activeTextarea) {
            wrapSelectedText('<h2>', '</h2>', activeTextarea, 'Sub Heading', onInsert);
          }
        })}
        title="Sub Heading (H2)"
        type="button"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => handleButtonClick(e, () => {
          const activeTextarea = getActiveTextarea();
          if (activeTextarea) {
            wrapSelectedText('<h3>', '</h3>', activeTextarea, 'heading', onInsert);
          }
        })}
        title="Heading (H3)"
        type="button"
      >
        <Heading3 className="h-4 w-4" />
      </Button>
    </>
  );
}
