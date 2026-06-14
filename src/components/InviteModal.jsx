import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus } from "lucide-react";
import { Select } from "antd";
import { sendInvites } from "../api/notificationApi";
import { useSelector } from "react-redux";
import {
  selectAccessToken,
  selectCurrentUser,
} from "../redux/features/auth/authSlice";
import { useGetUsersQuery } from "../redux/features/auth/authApi";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

export default function InviteModal({ open, onClose, roomCode }) {
  const { t } = useTranslation();
  const token = useSelector(selectAccessToken);
  const currentUser = useSelector(selectCurrentUser);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  // Chỉ tải danh sách user khi modal mở
  const { data: usersResp, isLoading: usersLoading } = useGetUsersQuery(undefined, {
    skip: !open,
  });

  // Bỏ chính mình ra khỏi danh sách mời (API trả ApiResponse → lấy .data)
  const options = useMemo(() => {
    const users = usersResp?.data || [];
    const myEmail = currentUser?.email?.toLowerCase();
    return users
      .filter((u) => u.email && u.email.toLowerCase() !== myEmail)
      .map((u) => ({
        label: u.name ? `${u.name} (${u.email})` : u.email,
        value: u.email,
      }));
  }, [usersResp, currentUser]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (selected.length === 0) {
      toast.error(t("inviteModal.selectAtLeastOne", "Vui lòng chọn ít nhất một người"));
      return;
    }
    if (!roomCode) {
      toast.error(t("inviteModal.noRoomCode"));
      return;
    }
    try {
      setLoading(true);
      const res = await sendInvites(roomCode, selected, token);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.message || t("inviteModal.errorStatus", { status: res.status }));
      }
      toast.success(t("inviteModal.sendSuccess", { count: selected.length }));
      setSelected([]);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelected([]);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 40 }}
          className="w-full max-w-md bg-[var(--surface)] rounded-2xl shadow-xl p-5 text-[var(--content)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <UserPlus size={18} /> {t("inviteModal.title")}
            </h2>
            <div className="flex items-center gap-2">
              {roomCode && (
                <span className="text-xs text-[var(--content)]/40 font-mono bg-[var(--overlay)] px-2 py-1 rounded">
                  {roomCode}
                </span>
              )}
              <button onClick={handleClose}>
                <X className="text-[var(--content)]/50 hover:text-[var(--content)]" />
              </button>
            </div>
          </div>

          {/* Chọn người mời (multi-select, tìm theo tên/email) */}
          <Select
            mode="multiple"
            allowClear
            showSearch
            style={{ width: "100%" }}
            placeholder={t("inviteModal.selectPlaceholder", "Chọn người để mời…")}
            value={selected}
            onChange={setSelected}
            options={options}
            loading={usersLoading}
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            // dropdown phải nổi trên overlay modal (z-[9999])
            dropdownStyle={{ zIndex: 10050 }}
            notFoundContent={
              usersLoading
                ? t("inviteModal.loading", "Đang tải…")
                : t("inviteModal.noUsers", "Không có người dùng")
            }
          />

          {/* Actions */}
          <div className="flex justify-end mt-5 gap-2">
            <button
              onClick={handleClose}
              className="px-3 py-1.5 text-sm text-[var(--content)]/60 hover:text-[var(--content)] transition"
            >
              {t("inviteModal.cancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || selected.length === 0}
              className="px-4 py-1.5 bg-[var(--accent)] text-sm cursor-pointer rounded-lg hover:bg-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? t("inviteModal.sending") : t("inviteModal.sendInvite", { count: selected.length })}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
