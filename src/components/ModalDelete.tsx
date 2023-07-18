import { useEffect, useState } from "react";
import Modal from "react-modal";

type ModalDeleteProps = {
  isOpen: boolean;
  onClose: (confirm: boolean) => void;
};

const ModalDelete: React.FC<ModalDeleteProps> = ({ isOpen, onClose }) => {
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
      <div className="flex h-56 w-screen flex-wrap p-4 md:h-64 md:w-96">
        <h1 className=" font-bold">Delete</h1>
        <p className="py-3">
          Do you really want to delete this draft. This operation will be
          permanent!
        </p>
        <hr className=" w-full" />
        <div className="flex w-full items-center justify-end space-x-2">
          <button onClick={() => onButtonClick(false)} className="btn-md btn">
            Cancel
          </button>
          <button
            onClick={() => onButtonClick(true)}
            className="btn-error btn-md btn"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalDelete;
