import { useSession } from "next-auth/react";
import Tiptap from "../components/Tiptap";

const CreatePost: React.FC = () => {
  const session = useSession({ required: true });

  return (
    <div className="container mx-auto mt-10">
      <div className="max-w-3xl mx-auto  border-2 border-black">
        <Tiptap />
      </div>
    </div>
  );
};

export default CreatePost;
