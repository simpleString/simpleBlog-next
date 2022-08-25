import { useSession } from "next-auth/react";
import { createReactEditorJS } from "react-editor-js";
import dynamic from "next/dynamic";
import Editor from "../components/Editor";
// import CheckList from "@editorjs/checklist";

// const EditorJs = dynamic(() => import("../components/Editor"), {
//   ssr: false,
// });

const CreatePost: React.FC = () => {
  const session = useSession({ required: true });
  // let block;

  // const ReactEditorJS = createReactEditorJS();

  // return (
  //   <ReactEditorJS
  //     holder="ssrHolder"
  //     value={block}
  //     tools={{ checkList: CheckList }}
  //   />
  // );
  return (
    <div>
      Hello
      {/* <EditorJs /> */}
      <Editor />
    </div>
  );
};

// const Editor = () => {

// }

// const EditorJs = dynamic(() => import("react-editor-js"), {
//   ssr: false,
// });

export default CreatePost;
