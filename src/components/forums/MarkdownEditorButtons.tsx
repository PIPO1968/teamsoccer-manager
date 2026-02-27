
import HeadingButtons from "./buttons/HeadingButtons";
import FormattingButtons from "./buttons/FormattingButtons";
import StructureButtons from "./buttons/StructureButtons";
import MediaButtons from "./buttons/MediaButtons";
import { MarkdownEditorButtonsProps } from "./types/editorTypes";

export default function MarkdownEditorButtons({ onInsert }: MarkdownEditorButtonsProps) {
  return (
    <div className="flex flex-wrap gap-1 mb-2">
      <HeadingButtons onInsert={onInsert} />
      <FormattingButtons onInsert={onInsert} />
      <StructureButtons onInsert={onInsert} />
      <MediaButtons onInsert={onInsert} />
    </div>
  );
}
