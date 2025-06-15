import React from "react";
import Modal from "./Modal";
import PostInput from "./PostInput";

interface Props {
  onClose: () => void;
  onPost?: (post: any) => void;
}

export default function AddPostModal({ onClose, onPost }: Props) {
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <PostInput
          onPost={(p) => {
            onPost?.(p);
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}
