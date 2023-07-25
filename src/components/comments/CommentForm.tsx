import { useState } from "react";
import { FieldZodError } from "../../types/frontend";
import CustomTextarea from "../custom/CustomTextarea";

type CommentFormProps = {
  onSubmit: (text: string) => Promise<void>;
  error: FieldZodError;
  loading: boolean;
  initialValue?: string;
};

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  error,
  loading,
  initialValue = "",
}) => {
  const [text, setText] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(text).then(() => setText(""));
  };

  return (
    <form onSubmit={handleSubmit}>
      <CustomTextarea
        name="text"
        // autoFocus
        className={`overflow-hidden border bg-inherit ${
          error ? "border-red-600" : ""
        }`}
        placeholder="Write your comment here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {error && <div className="text-error">{error["text"]}</div>}
      <div className="flex justify-end pb-4">
        <button
          className={`btn ${loading ? "loading" : ""}`}
          disabled={loading}
          type="submit"
        >
          {loading ? "Loading" : "Comment"}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
