import { Editor } from "@tiptap/react";
import { FormEvent, useRef } from "react";
import { toast } from "react-toastify";
import { twMerge } from "tailwind-merge";
import { SupabaseBackets } from "../../constants/supabase";
import { fileUploader } from "../../utils/fileUploader";

export const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  if (!editor) {
    return null;
  }

  const uploadImage = async (e: FormEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    const toastId = toast.loading("📦 Uploading image...", {
      position: "bottom-center",
    });

    try {
      const filePath = await fileUploader({
        file,
        backet: SupabaseBackets.FILE,
      });
      editor
        .chain()
        .focus()
        .createParagraphNear()
        .setImage({ src: filePath })
        .createParagraphNear()
        .run();

      toast.update(toastId, {
        type: "success",
        render: "🎉 Image uploaded",
        autoClose: 3000,
        isLoading: false,
        closeButton: true,
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.update(toastId, {
          type: "error",
          render: error.message,
          autoClose: 3000,
          isLoading: false,
          closeButton: true,
        });
      }
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="sticky top-0  flex flex-wrap bg-primary p-2 shadow">
      <div className="tooltip" data-tip="Bold">
        <button
          className={twMerge(
            "btn-ghost btn-square btn-sm btn font-normal",
            editor.isActive("bold") ? "bg-accent-focus text-accent-content" : ""
          )}
        >
          <i
            className="ri-bold ri-xl"
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
        </button>
      </div>

      <div className="tooltip" data-tip="Italic">
        <button
          className={twMerge(
            "btn-ghost btn-square btn-sm btn font-normal",
            editor.isActive("italic")
              ? "bg-accent-focus text-accent-content"
              : ""
          )}
        >
          <i
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className="ri-italic ri-xl"
          />
        </button>
      </div>

      <div className="tooltip" data-tip="Strikethrough">
        <button
          className={twMerge(
            "btn-ghost btn-square btn-sm btn font-normal",
            editor.isActive("strike")
              ? "bg-accent-focus text-accent-content"
              : ""
          )}
        >
          <i
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className="ri-strikethrough ri-xl"
          />
        </button>
      </div>

      <div className="tooltip" data-tip="Inline Code">
        <button
          className={twMerge(
            "btn-ghost btn-square btn-sm btn font-normal",
            editor.isActive("code") ? "bg-accent-focus text-accent-content" : ""
          )}
        >
          <i
            onClick={() => editor.chain().focus().toggleCode().run()}
            className="ri-code-s-slash-line ri-xl"
          />
        </button>
      </div>

      <div className="divider divider-horizontal mx-1 py-1"></div>

      <div className="tooltip" data-tip="Heading">
        <button
          className={twMerge(
            "btn-ghost btn-square btn-sm btn font-normal",
            editor.isActive("heading", { level: 1 })
              ? "bg-accent-focus text-accent-content"
              : ""
          )}
        >
          <i
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className="ri-heading ri-xl"
          />
        </button>
      </div>

      <div className="tooltip" data-tip="Bulleted List">
        <button
          className={twMerge(
            "btn-ghost btn-square btn-sm btn font-normal",
            editor.isActive("bulletList")
              ? "bg-accent-focus text-accent-content"
              : ""
          )}
        >
          <i
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className="ri-list-unordered ri-xl"
          />
        </button>
      </div>

      <div className="tooltip" data-tip="Numbered List">
        <button
          className={twMerge(
            "btn-ghost btn-square btn-sm btn font-normal",
            editor.isActive("orderedList")
              ? "bg-accent-focus text-accent-content"
              : ""
          )}
        >
          <i
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className="ri-list-ordered ri-xl"
          />
        </button>
      </div>

      <div className="tooltip" data-tip="Code block">
        <button
          className={twMerge(
            "btn-ghost btn-square btn-sm btn font-normal",
            editor.isActive("codeBlock")
              ? "bg-accent-focus text-accent-content"
              : ""
          )}
        >
          <i
            className="ri-code-box-line ri-xl"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          />
        </button>
      </div>

      <div className="tooltip" data-tip="Quote Block">
        <button
          className={twMerge(
            "btn-ghost btn-square btn-sm btn font-normal",
            editor.isActive("blockquote")
              ? "bg-accent-focus text-accent-content"
              : ""
          )}
        >
          <i
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className="ri-double-quotes-l ri-xl"
          />
        </button>
      </div>

      <div className="tooltip" data-tip="Hard Break">
        <button className="btn-ghost btn-square btn-sm btn font-normal">
          <i
            className="ri-text-wrap ri-xl"
            onClick={() => editor.chain().focus().setHardBreak().run()}
          />
        </button>
      </div>

      <div className="divider divider-horizontal mx-1 py-1"></div>

      <div className="tooltip" data-tip="Add Image">
        <label className="btn-ghost btn-square btn-sm btn font-normal">
          <input
            ref={fileRef}
            onChange={uploadImage}
            className="hidden"
            type="file"
            accept="image/png, image/jpeg"
          />
          <i className="ri-image-add-line ri-xl" />
        </label>
      </div>
    </div>
  );
};
