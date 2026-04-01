"use client";

import { useState } from "react";
import EditProfileModal from "./EditProfileModal";

export default function StoreProfileClient({
  tenant,
  canEdit,
}: {
  tenant: Record<string, unknown>;
  canEdit: boolean;
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!canEdit) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsEditModalOpen(true)}
        className="bg-primary text-white px-6 py-2.5 rounded-full font-bold shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-[20px]">edit</span>
        Edit Profil
      </button>

      {isEditModalOpen && (
        <EditProfileModal tenant={tenant} onClose={() => setIsEditModalOpen(false)} />
      )}
    </>
  );
}
