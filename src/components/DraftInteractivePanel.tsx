import { useState } from "react";
import { trpc } from "../utils/trpc";
import CustomModal from "./custom/CustomModal";

type DraftInteractivePanelProps = {
  draftId: string;
};

const DraftInteractivePanel: React.FC<DraftInteractivePanelProps> = ({
  draftId,
}) => {
  const [openModal, setOpenModal] = useState(false);

  const utils = trpc.useContext();

  const draftDeleteMutation = trpc.useMutation(["post.deleteDraft"], {
    onSuccess: () => {
      utils.invalidateQueries(["post.drafts"]);
    },
  });

  const onDeleteClick = (confirm: boolean) => {
    setOpenModal(false);
    if (confirm) {
      draftDeleteMutation.mutate({ id: draftId });
    }
  };

  return (
    <div className="flex items-center p-4 pb-2">
      <CustomModal
        isOpen={openModal}
        onClose={onDeleteClick}
        cancelButton="Cancel"
        okButton="Delete"
        content=" Do you really want to delete this draft. This operation will be
          permanent!"
        title="Delete"
        okButtonStyles="btn-error"
      />
      <button onClick={() => setOpenModal(true)}>
        <i className="ri-delete-bin-line" />
      </button>
    </div>
  );
};

export default DraftInteractivePanel;
