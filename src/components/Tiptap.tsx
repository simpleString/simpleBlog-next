import Document from "@tiptap/extension-document";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import NextLink from "next/link";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
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
const MenuBar = ({ editor }: { editor: any }) => {
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

const CustomDocument = Document.extend({
  content: "heading block*",
});

type TiptapProps = {
  content: Readonly<JSONContent | undefined>;
  setContent: Dispatch<SetStateAction<JSONContent | undefined>>;
  onSave: (titleAndImg: { title: string; img: string }) => void;
};

const Tiptap: React.FC<TiptapProps> = ({ content, setContent, onSave }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        document: false,
      }),
      Highlight,
      Typography,
      CustomDocument,
      Image,
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
    onUpdate({ editor }) {
      const item = editor.getJSON();
      setContent(item);
    },
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none",
      },
    },
  });

  const savePos = () => {
    const titleAndImg = {
      title: "",
      img: "",
    };

    if (typeof content === "undefined") {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (content.content![0]!.content) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      titleAndImg.title = content.content![0]!.content![0]!.text!;
    }

    let notUpdated = true;

    content.content?.forEach((item) => {
      if (notUpdated && item.type === "image") {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (typeof item.attrs !== "undefined") {
          titleAndImg.img = item.attrs.src;
          notUpdated = false;
        }
      }
    });

    if (titleAndImg.img && titleAndImg.title) {
      onSave(titleAndImg);
    }
  };

  useEffect(() => {
    editor?.commands.setContent(content || "");
  }, [editor, content]);

  return (
    <>
      <div className="max-w-3xl mx-auto  border-2 border-black ">
        <MenuBar editor={editor} />
        <EditorContent className="" editor={editor} />
      </div>
      <div className="max-w-3xl mx-auto py-8">
        <button
          className="mr-2 px-3 border rounded border-black font-semibold text-lg hover:bg-black hover:text-white"
          onClick={() => savePos()}
        >
          Save
        </button>
        <NextLink href="/">
          <button className="mr-2 px-3 border rounded border-black font-semibold text-lg bg-yellow-300 hover:bg-yellow-500 ">
            Close
          </button>
        </NextLink>
      </div>
    </>
  );
};

export default Tiptap;
