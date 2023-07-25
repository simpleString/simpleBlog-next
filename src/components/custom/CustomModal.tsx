import { useEffect, useState } from "react";
import Modal from "react-modal";
import { twMerge } from "tailwind-merge";

type CustomModalProps = {
  isOpen: boolean;
  onClose: (confirm: boolean) => void;
  title: string;
  content: string;
  cancelButton: string;
  okButton: string;
  okButtonStyles: string;
};

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  cancelButton,
  content,
  okButton,
  title,
  okButtonStyles,
}) => {
  const [innerState, setInnerState] = useState(isOpen);

  useEffect(() => {
    setInnerState(isOpen);
  }, [isOpen]);

  const onButtonClick = (confirm: boolean) => {
    onClose(confirm);
    setInnerState(false);
  };

  return (
    <Modal
      className="absolute top-1/2 left-1/2 z-40 -translate-x-1/2 -translate-y-1/2 rounded-md bg-base-100 shadow"
      isOpen={innerState}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
      preventScroll={true}
      overlayClassName="bg-base-300 fixed inset-0 bg-opacity-70"
      onRequestClose={() => {
        onButtonClick(false);
      }}
    >
      <div className="flex h-56 w-screen flex-col p-4 md:h-64 md:w-96">
        <h1 className="font-bold">{title}</h1>
        <p className="flex flex-1 items-center ">{content}</p>
        <hr className="w-full py-2" />
        <div className="flex h-max w-full items-end justify-end space-x-2">
          <button onClick={() => onButtonClick(false)} className="btn-md btn">
            {cancelButton}
          </button>
          <button
            onClick={() => onButtonClick(true)}
            className={twMerge("btn-md btn", okButtonStyles)}
          >
            {okButton}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CustomModal;
