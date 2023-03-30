import Document from "@tiptap/extension-document";
import Highlight from "@tiptap/extension-highlight";
import ImageTipTap from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import NextImage from "next/image";
import NextLink from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { SupabaseBackets } from "../../constants/supabase";
import { fileUploader } from "../../utils/fileUploader";
import { MenuBar } from "./MenuBar";

type PostEditorProps = {
  title: string;
  text: string;
  image?: string | null;
  savePost: ({
    title,
    text,
    image,
  }: {
    title: string;
    text: string;
    image: string | null;
  }) => void;
};

const PostEditor: React.FC<PostEditorProps> = ({
  text,
  title,
  image = null,
  savePost,
}) => {
  const [content, setContent] = useState(text);
  const [postTitle, setPostTitle] = useState(title);
  const [postImage, setPostImage] = useState<string | null>(image);

  const onButtonClearImageClick = () => {
    setPostImage(null);
  };

  const onFileChange = async (e: FormEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    const base64Image = await new Promise<string>((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = () => {
        if (fileReader.result) {
          resolve(fileReader.result as string);
        }
        reject(null);
      };
      fileReader.readAsDataURL(file);
    });

    setPostImage(base64Image);

    try {
      const photoUrl = await fileUploader({
        file,
        backet: SupabaseBackets.FILE,
      });

      setPostImage(photoUrl);
    } catch (error) {
      toast.error("Can't upload image");
      setPostImage(null);
    }
  };

  const onButtonSaveClick = () => {
    savePost({ title: postTitle, text: content, image: postImage });
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Typography,
      Document,
      ImageTipTap,
      Placeholder.configure({
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:float-left before:text-gray-400 before:pointer-events-none before:h-0 ",
        placeholder: "Text(optional)",
      }),
    ],

    onUpdate({ editor }) {
      setContent(editor.getHTML());
    },

    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm focus:outline-none p-4 min-h-[200px] prose-img:my-1 prose-img:w-full max-w-none prose-headings:my-1 prose-p:my-1",
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
      <div className="space-y-4 shadow sm:p-4">
        <div className="w-full">
          <input
            className="input-bordered input w-full "
            placeholder="Title"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-center">
          {postImage && (
            <div className="indicator">
              <label
                onClick={onButtonClearImageClick}
                className="badge-secondary badge indicator-item top-3 right-6 cursor-pointer hover:bg-secondary-focus"
              >
                <i className="ri-close-line" />
              </label>
              <div className="h-[360px] w-[640px] bg-base-200">
                <NextImage
                  src={postImage}
                  alt="Post image"
                  layout="fill"
                  objectFit="contain"
                  loading="eager"
                />
              </div>
            </div>
          )}
          {!postImage && (
            <label className="flex h-32 w-full flex-col border-4 border-dashed border-blue-200 hover:border-gray-300 hover:bg-gray-100">
              <div className="flex cursor-pointer flex-col items-center justify-center pt-7">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-400 group-hover:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                  Upload photo
                </p>
              </div>
              <input
                type="file"
                className="opacity-0"
                onChange={onFileChange}
                accept="image/png, image/jpeg"
              />
            </label>
          )}
        </div>
        <div className="shadow">
          <MenuBar editor={editor} />
          <EditorContent editor={editor} />
        </div>
      </div>
      <div className="mx-4 my-4 space-x-2 sm:mx-0">
        <button
          disabled={!postTitle}
          className="btn-primary btn"
          onClick={onButtonSaveClick}
        >
          Save
        </button>
        <NextLink href="/">
          <button className="btn-ghost btn">Close</button>
        </NextLink>
      </div>
    </>
  );
};

export default PostEditor;
