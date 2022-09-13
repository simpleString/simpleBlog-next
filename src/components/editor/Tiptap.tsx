import Document from "@tiptap/extension-document";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import Select from "react-select";
import { MenuBar } from "./MenuBar";

type TiptapProps = {
  // content: Readonly<JSONContent | undefined>;
  // setContent: Dispatch<SetStateAction<JSONContent | undefined>>;
  title: string;
  text: JSONContent;
  onSave: (titleAndImg: { title: string; img: string }) => void;
  tags: {
    id: string;
    title: string;
  }[];
};

const Tiptap: React.FC<TiptapProps> = ({ text, title, onSave }) => {
  const [content, setContent] = useState(text);
  const [postTitle, setPostTitle] = useState(title);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Typography,
      Document,
      Image,
      Placeholder.configure({
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:float-left before:text-gray-400 before:pointer-events-none before:h-0 ",
        placeholder: "Text(optional)",
      }),
    ],
    onUpdate({ editor }) {
      // const _title = content?.content?.[0]?.content?.[0]?.text;
      // if (_title && _title.length > 4) {
      //   setError({ field: "", message: "" });
      // }
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

  useEffect(() => {
    if (editor) {
      try {
        editor.commands?.setContent(content || "");
      } catch (error) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return (
    <>
      <div className="mt-7 shadow">
        <div className="w-1/3">
          <Select placeholder="Choose community" />
        </div>
        <div>
          <input
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
          />
        </div>
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      <div className="max-w-3xl space-x-2">
        <button className="btn btn-primary">Save</button>
        <NextLink href="/">
          <button className="btn btn-ghost">Close</button>
        </NextLink>
      </div>
    </>
  );
};

export default Tiptap;
