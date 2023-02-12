import { useState } from "react";

//Modal component to enter urls
type ModalProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cancelOperationHandler: () => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  proceedOperationHandler: ({}: any) => any;
  inputLabel: string;
};

export const Modal: React.FC<ModalProps> = ({
  cancelOperationHandler,
  proceedOperationHandler,
  inputLabel,
}) => {
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState(false);
  return (
    <>
      <div className="bg-opacity-50 bg-black fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center z-50">
        <div className="bg-white p-8 m-4 overflow-auto relative overflow-y-auto max-h-screen border-4 border-black rounded-md">
          <label className="inline-block mb-2">{inputLabel}</label>
          <br />
          <input
            className="inline-block p-2 border border-gray-800 rounded-md"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          {error ? (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              <span className="font-medium">Oh, not valid url.</span> Image not
              exists.
            </p>
          ) : null}

          <br />
          <button
            className="mr-2 px-3 border rounded border-black font-semibold text-lg hover:bg-black hover:text-white"
            onClick={async () => {
              //Check that valid url and it return normal status code
              try {
                const result = await fetch(inputText);
                if (result.status === 200) {
                  const metaType = result.headers.get("Content-Type");
                  if (metaType?.includes("image/"))
                    proceedOperationHandler(inputText);
                }
              } catch (error) {
              } finally {
                setError(true);
              }
            }}
          >
            Add
          </button>
          <button
            className="mr-2 px-3 border rounded border-black font-semibold text-lg bg-yellow-300 hover:bg-yellow-500 "
            onClick={() => {
              setInputText("");
              cancelOperationHandler();
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};
