import { useState } from "react";
import { Modal } from "./Modal";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AddImage = ({ editor }: { editor: any }) => {
  const [showModal, setShowModal] = useState(false);

  const uploadImage = (url: string) => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setShowModal(false);
  };

  return (
    <>
      <div className="flex items-center py-2">
        <button
          className="border border-black px-1 line rounded-md m-1 text-3xl mx-auto hover:bg-black hover:text-white"
          onClick={() => setShowModal(true)}
        >
          Add Image
        </button>
      </div>
      {/* Modal to enter image url */}
      {showModal && (
        <Modal
          cancelOperationHandler={() => setShowModal(false)}
          proceedOperationHandler={uploadImage}
          inputLabel="Enter image url here"
        />
      )}
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <>
      <AddImage editor={editor} />

      <div className="p-4 pt-0">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`border border-black px-1 line rounded-md m-1 cursor-default ${
            editor.isActive("bold") ? "text-white bg-black" : ""
          }`}
        >
          bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`border border-black px-1 line rounded-md m-1 cursor-default ${
            editor.isActive("italic") ? "text-white bg-black" : ""
          }`}
        >
          italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`border border-black px-1 line rounded-md m-1 cursor-default ${
            editor.isActive("strike") ? "text-white bg-black" : ""
          }`}
        >
          strike
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`border border-black px-1 line rounded-md m-1 cursor-default ${
            editor.isActive("code") ? "text-white bg-black" : ""
          }`}
        >
          code
        </button>
        <button
          className="border border-black px-1 line rounded-md m-1 cursor-default"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
        >
          clear marks
        </button>
        <button
          className="border border-black px-1 line rounded-md m-1 cursor-default"
          onClick={() => editor.chain().focus().clearNodes().run()}
        >
          clear nodes
        </button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`border border-black px-1 line rounded-md m-1 cursor-default ${
            editor.isActive("paragraph") ? "text-white bg-black" : ""
          }`}
        >
          paragraph
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`border border-black px-1 line rounded-md m-1 cursor-default ${
            editor.isActive("heading", { level: 1 })
              ? "text-white bg-black"
              : ""
          }`}
        >
          h1
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`border border-black px-1 line rounded-md m-1 cursor-default ${
            editor.isActive("heading", { level: 2 })
              ? "text-white bg-black"
              : ""
          }`}
        >
          h2
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`border border-black px-1 line rounded-md m-1 cursor-default ${
            editor.isActive("heading", { level: 3 })
              ? "text-white bg-black"
              : ""
          }`}
        >
          h3
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          className={`border border-black px-1 line rounded-md m-1 cursor-default ${
            editor.isActive("heading", { level: 4 })
              ? "text-white bg-black"
              : ""
          }`}
        >
          h4
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 5 }).run()
          }
          className={`border border-black px-1 line rounded-md m-1 cursor-default ${
            editor.isActive("heading", { level: 5 })
              ? "text-white bg-black"
              : ""
          }`}
        >
          h5
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 6 }).run()
          }
          className={`border border-black px-1 line rounded-md m-1 cursor-default ${
            editor.isActive("heading", { level: 6 })
              ? "text-white bg-black"
              : ""
          }`}
        >
          h6
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`border border-black px-1 line rounded-md m-1 cursor-default ${
            editor.isActive("bulletList") ? "text-white bg-black" : ""
          }`}
        >
          bullet list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`border border-black px-1 line rounded-md m-1 cursor-default ${
            editor.isActive("orderedList") ? "text-white bg-black" : ""
          }`}
        >
          ordered list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`border border-black px-1 line rounded-md m-1 cursor-default ${
            editor.isActive("codeBlock") ? "text-white bg-black" : ""
          }`}
        >
          code block
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`border border-black px-1 line rounded-md m-1 cursor-default ${
            editor.isActive("blockquote") ? "text-white bg-black" : ""
          }`}
        >
          blockquote
        </button>
        <button
          className="border border-black px-1 line rounded-md m-1 cursor-default"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          horizontal rule
        </button>
        <button
          className="border border-black px-1 line rounded-md m-1 cursor-default"
          onClick={() => editor.chain().focus().setHardBreak().run()}
        >
          hard break
        </button>
        <button
          className="border border-black px-1 line rounded-md m-1 cursor-default"
          onClick={() => editor.chain().focus().undo().run()}
        >
          undo
        </button>
        <button
          className="border border-black px-1 line rounded-md m-1 cursor-default"
          onClick={() => editor.chain().focus().redo().run()}
        >
          redo
        </button>
      </div>
    </>
  );
};
