import Document from "@tiptap/extension-document";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import NextLink from "next/link";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { MenuBar } from "./MenuBar";

type TiptapProps = {
  content: Readonly<JSONContent | undefined>;
  setContent: Dispatch<SetStateAction<JSONContent | undefined>>;
  onSave: (titleAndImg: { title: string; img: string }) => void;
};

const Tiptap: React.FC<TiptapProps> = ({ content, setContent, onSave }) => {
  const [error, setError] = useState({ message: "", field: "" });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        document: false,
      }),
      Highlight,
      Typography,
      Document.extend({ content: "heading block*" }),
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
      const _title = content?.content?.[0]?.content?.[0]?.text;
      if (_title && _title.length > 4) {
        setError({ field: "", message: "" });
      }
      const item = editor.getJSON();
      setContent(item);
    },
    content,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg focus:outline-none m-5",
        // "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none",
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
    if (content.content![0]?.content) {
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

    if (titleAndImg.title.length < 5) {
      setError({
        field: "Title",
        message: "Title mast be not less 5 simbols.",
      });
    }

    if (!titleAndImg.img) {
      setError({
        field: "Image",
        message: "Post must have at least one image.",
      });
    }

    if (titleAndImg.img && titleAndImg.title) {
      onSave(titleAndImg);
    }
  };

  useEffect(() => {
    editor?.commands.setContent(content || "");
  }, [editor]);

  return (
    <>
      <div
        className={`${
          error.field ? "border-red-500 " : "border-black "
        } " max-w-3xl mx-auto border-2 "  
        `}
      >
        {error.field ? (
          <div className="text-red-600 text-xl">
            {error.field}: {error.message}
          </div>
        ) : null}
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
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
