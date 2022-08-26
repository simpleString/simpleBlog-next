import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Document from "@tiptap/extension-document";
import Dropcursor from "@tiptap/extension-dropcursor";
import Image from "@tiptap/extension-image";
import { useCallback } from "react";
import Placeholder from "@tiptap/extension-placeholder";

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="p-4">
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
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`border border-black px-1 line rounded-md m-1 cursor-default ${
          editor.isActive("heading", { level: 1 }) ? "text-white bg-black" : ""
        }`}
      >
        h1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`border border-black px-1 line rounded-md m-1 cursor-default ${
          editor.isActive("heading", { level: 2 }) ? "text-white bg-black" : ""
        }`}
      >
        h2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`border border-black px-1 line rounded-md m-1 cursor-default ${
          editor.isActive("heading", { level: 3 }) ? "text-white bg-black" : ""
        }`}
      >
        h3
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={`border border-black px-1 line rounded-md m-1 cursor-default ${
          editor.isActive("heading", { level: 4 }) ? "text-white bg-black" : ""
        }`}
      >
        h4
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={`border border-black px-1 line rounded-md m-1 cursor-default ${
          editor.isActive("heading", { level: 5 }) ? "text-white bg-black" : ""
        }`}
      >
        h5
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={`border border-black px-1 line rounded-md m-1 cursor-default ${
          editor.isActive("heading", { level: 6 }) ? "text-white bg-black" : ""
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
  );
};

const CustomDocument = Document.extend({
  content: "heading block*",
});

const Tiptap = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        document: false,
      }),
      Highlight,
      Typography,
      CustomDocument,
      Image,
      Dropcursor,
      Placeholder.configure({
        emptyNodeClass:
          "before:content-[attr(data-placeholder)] before:float-left before:text-gray-400 before:pointer-events-none before:h-0 ",
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return "What’s the title?";
          }

          return "Can you add some further context?";
        },
      }),
    ],
    content: "<p>Hello World! 🌎️</p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none",
      },
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt("URL");

    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <>
      <button onClick={addImage}>setImage</button>
      <MenuBar editor={editor} />;
      <EditorContent className="" editor={editor} />
    </>
  );
};

export default Tiptap;
