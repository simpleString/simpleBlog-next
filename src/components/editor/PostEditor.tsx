import Highlight from "@tiptap/extension-highlight";
// import ImageTipTap, { Image } from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import debounce from "lodash.debounce";
import NextImage from "next/image";
import NextLink from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { SupabaseBackets } from "../../constants/supabase";
import { fileUploader } from "../../utils/fileUploader";
import { generateBase64Image } from "../../utils/generateBase64Image";
import { MenuBar } from "./MenuBar";

import { FileUploader } from "react-drag-drop-files";
import { CreatePostType } from "../../types/frontend";

import { FILE_TYPES, MAX_FILE_SIZE } from "../../constants/frontend";
import { TipTapCustomImage } from "../../utils/lib/Tiptap/TipTapCustomImage";

type PostEditorProps = {
  title?: string;
  text?: string;
  image?: string | null;
  savePost: ({ title, text, image }: CreatePostType) => void;
  saveDraft?: ({ title, text, image }: CreatePostType) => Promise<void>;
};

const PostEditor: React.FC<PostEditorProps> = ({
  text,
  title,
  image = null,
  savePost,
  saveDraft,
}) => {
  const [content, setContent] = useState(text ?? "");
  const [postTitle, setPostTitle] = useState(title ?? "");
  const [postImage, setPostImage] = useState<string | null>(image);

  const [isDraftSaved, setIsDraftSaved] = useState(true);

  const mounted = useRef(false);

  const onButtonClearImageClick = () => {
    setPostImage(null);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveDraftDebounce = useCallback(
    debounce(async ({ image, text, title }: CreatePostType) => {
      if (saveDraft) {
        try {
          await saveDraft({ title, text, image });
          setIsDraftSaved(true);
        } catch (error) {}
      }
    }, 3000),
    []
  );

  useEffect(() => {
    if (!(postImage || content || postTitle) || !mounted.current) {
      mounted.current = true;
      return;
    }

    setIsDraftSaved(false);
    saveDraftDebounce({ image: postImage, text: content, title: postTitle });
  }, [postTitle, content, postImage, saveDraftDebounce]);

  const onFileChange = async (file: File) => {
    const toastId = toast.loading("📦 Uploading image...", {
      position: "bottom-center",
    });

    const base64Image = await generateBase64Image(file);

    setPostImage(base64Image);

    try {
      const photoUrl = await fileUploader({
        file,
        backet: SupabaseBackets.FILE,
      });
      toast.update(toastId, {
        type: "success",
        render: "🎉Image uploaded",
        autoClose: 3000,
        isLoading: false,
        closeButton: true,
      });

      setPostImage(photoUrl);
    } catch (error) {
      if (error instanceof Error) {
        toast.update(toastId, {
          type: "error",
          render: error.message,
          autoClose: 3000,
          isLoading: false,
          closeButton: true,
        });
        setPostImage(null);
      }
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
      TipTapCustomImage(async (file: File) => {
        const toastId = toast.loading("📦 Uploading image...", {
          position: "bottom-center",
        });
        try {
          const filePath = await fileUploader({
            file,
            backet: SupabaseBackets.FILE,
          });
          toast.update(toastId, {
            type: "success",
            render: "🎉 Image uploaded",
            autoClose: 3000,
            isLoading: false,
            closeButton: true,
          });
          return filePath;
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
          return "";
        }
      }),
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
          "prose prose-sm focus:outline-none p-2 prose-img:my-1 prose-img:w-full max-w-none prose-headings:my-1 prose-p:my-1",
      },
    },
  });

  return (
    <>
      <div className="space-y-4 shadow sm:p-4 ">
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
            <FileUploader
              handleChange={onFileChange}
              name="file"
              types={FILE_TYPES}
              classes="w-full"
              maxSize={MAX_FILE_SIZE}
              onTypeError={() => {
                toast.error("Incorrect file type");
              }}
              onSizeError={() => {
                toast.error(`File size more that ${MAX_FILE_SIZE}mb`);
              }}
            >
              <label className="flex h-32 w-full cursor-pointer flex-col border-4 border-dashed border-blue-200 hover:border-gray-300 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-7">
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
              </label>
            </FileUploader>
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
        {isDraftSaved ? (
          <span className="text-success">Saved</span>
        ) : (
          <span className="text-warning">Saving...</span>
        )}
      </div>
    </>
  );
};

export default PostEditor;
