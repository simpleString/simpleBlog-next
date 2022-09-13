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
      {/* <AddImage editor={editor} /> */}

      <div className="flex p-2 shadow bg-primary">
        <div className="tooltip" data-tip="Bold">
          <button className="btn btn-square btn-ghost btn-sm font-normal">
            <i
              className="ri-bold ri-xl"
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
          </button>
        </div>

        <div className="tooltip" data-tip="Italic">
          <button className="btn btn-square btn-ghost btn-sm font-normal">
            <i
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className="ri-italic ri-xl"
            />
          </button>
        </div>

        <div className="tooltip" data-tip="Strikethrough">
          <button className="btn btn-square btn-ghost btn-sm font-normal">
            <i
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className="ri-strikethrough ri-xl"
            />
          </button>
        </div>

        <div className="tooltip" data-tip="Inline Code">
          <button className="btn btn-square btn-ghost btn-sm font-normal">
            <i
              onClick={() => editor.chain().focus().toggleCode().run()}
              className="ri-code-s-slash-line ri-xl"
            />
          </button>
        </div>

        <div className="divider divider-horizontal mx-1 py-1"></div>

        <div className="tooltip" data-tip="Heading">
          <button className="btn btn-square btn-ghost btn-sm font-normal">
            <i
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className="ri-heading ri-xl"
            />
          </button>
        </div>

        <div className="tooltip" data-tip="Bulleted List">
          <button className="btn btn-square btn-ghost btn-sm font-normal">
            <i
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className="ri-list-unordered ri-xl"
            />
          </button>
        </div>

        <div className="tooltip" data-tip="Numbered List">
          <button className="btn btn-square btn-ghost btn-sm font-normal">
            <i
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className="ri-list-ordered ri-xl"
            />
          </button>
        </div>

        <div className="tooltip" data-tip="Code block">
          <button className="btn btn-square btn-ghost btn-sm font-normal">
            <i
              className="ri-code-box-line ri-xl"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            />
          </button>
        </div>

        <div className="tooltip" data-tip="Quote Block">
          <button className="btn btn-square btn-ghost btn-sm font-normal">
            <i
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className="ri-double-quotes-l ri-xl"
            />
          </button>
        </div>

        {/* <button
          className="border border-black px-1 line rounded-md m-1 cursor-default"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          horizontal rule
        </button> */}

        <div className="tooltip" data-tip="Hard Break">
          <button className="btn btn-square btn-ghost btn-sm font-normal">
            <i
              className="ri-text-wrap ri-xl"
              // className="border border-black px-1 line rounded-md m-1 cursor-default"
              onClick={() => editor.chain().focus().setHardBreak().run()}
            />
          </button>
        </div>

        <div className="divider divider-horizontal mx-1 py-1"></div>

        <div className="tooltip" data-tip="Add Image">
          <button className="btn btn-square btn-ghost btn-sm font-normal">
            <i className="ri-image-add-line ri-xl" />
          </button>
        </div>

        {/* <button
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
        </button> */}
      </div>
    </>
  );
};
