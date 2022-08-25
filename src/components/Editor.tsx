/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef, useState } from "react";
import { createReactEditorJS } from "react-editor-js";

// const Editor = () => {
//   const ReactEditorJS = createReactEditorJS();
// const [value, setValue] = useState();

//   const editorJS = useRef(null);

//   const handleInitialize = useCallback((instance: any) => {
//     editorJS.current = instance;
//   }, []);

//   const handleSave = useCallback(async () => {
//     const savedData = await (editorJS.current as any).save();
//   }, []);

//   return <ReactEditorJS onInitialize={handleInitialize} />;
// };

// export default Editor;

import { useEffect } from "react";
import React from "react";

export default function Editor() {
  const editorCore = React.useRef(null);

  const handleInitialize = React.useCallback((instance: any) => {
    editorCore.current = instance;
  }, []);

  const handleSave = React.useCallback(async () => {
    const savedData = await (editorCore.current as any).save();
    console.log(savedData);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Editorjs = require("@editorjs/editorjs");
    new Editorjs("editorjs");
  }, []);

  return <div id="editorjs"></div>;
}
