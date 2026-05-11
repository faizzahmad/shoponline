"use client";

import { Button } from "@/components/ui/button";
import { UploadDropzone } from "@/utils/uploadthing";
import { cn } from "@/lib/utils";
import Image from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { ImagePlus, Link2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  className?: string;
};

export const RichTextEditor = ({ value, onChange, className }: RichTextEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: { HTMLAttributes: { class: "list-disc list-outside pl-6" } },
        orderedList: { HTMLAttributes: { class: "list-decimal list-outside pl-6" } },
        listItem: { HTMLAttributes: { class: "my-1" } },
      }),
      Underline,
      LinkExt.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        HTMLAttributes: { class: "max-w-full rounded-lg py-2" },
      }),
      Placeholder.configure({
        placeholder: "Write description — use toolbar for headings, bullets, and numbered lists…",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "raleway min-h-[280px] px-4 py-3 outline-none focus:outline-none " +
          "text-sm leading-relaxed [&_ul]:my-3 [&_ol]:my-3 [&_ul]:list-disc [&_ul]:pl-7 [&_ol]:list-decimal [&_ol]:pl-7 " +
          "[&_li]:my-1 [&_li>p]:my-0 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const next = value || "";
    if (editor.getHTML() === next) return;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  const addLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    const trimmed = url.trim();
    if (trimmed === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
  };

  const addImageByUrl = () => {
    if (!editor) return;
    const url = window.prompt("Image URL");
    if (!url?.trim()) return;
    editor.chain().focus().setImage({ src: url.trim() }).run();
  };

  return (
    <div className={cn("rich-desc-editor-wrap w-full rounded-lg border bg-white", className)}>
      <div className="flex flex-wrap gap-2 border-b p-2">
        <Button type="button" variant="outline" size="sm" disabled={!editor} onClick={() => editor!.chain().focus().toggleBold().run()}>
          Bold
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!editor} onClick={() => editor!.chain().focus().toggleItalic().run()}>
          Italic
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!editor} onClick={() => editor!.chain().focus().toggleUnderline().run()}>
          Underline
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!editor} onClick={() => editor!.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!editor} onClick={() => editor!.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!editor} onClick={() => editor!.chain().focus().toggleBulletList().run()}>
          Bullet list
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!editor} onClick={() => editor!.chain().focus().toggleOrderedList().run()}>
          Number list
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!editor} onClick={() => editor!.chain().focus().toggleBlockquote().run()}>
          Quote
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!editor} onClick={addLink}>
          <Link2 className="mr-1 size-4" />
          Link
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!editor} onClick={addImageByUrl}>
          <ImagePlus className="mr-1 size-4" />
          Image URL
        </Button>
      </div>

      <div className="border-b p-3">
        <p className="mb-2 text-xs text-muted-foreground">
          Uploaded images are inserted where the cursor is (or append if nothing is focused).
        </p>
        <div className="max-w-[320px]">
          <UploadDropzone
            endpoint={"imageUploader"}
            onClientUploadComplete={(res) => {
              const uploadedUrl = res?.[0]?.ufsUrl;
              if (!uploadedUrl || !editor) return;
              editor.chain().focus().setImage({ src: uploadedUrl }).run();
              toast.success("Image added to description");
            }}
            onUploadError={(error: Error) => {
              toast.error(error.message);
            }}
          />
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};
