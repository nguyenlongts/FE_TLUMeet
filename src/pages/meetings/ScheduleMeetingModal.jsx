import { useState, useEffect } from "react";
import { Video, X, Calendar, Clock, User, Pencil } from "lucide-react";
import { useScheduleMeetingMutation, useUpdateMeetingApiMutation } from "../../redux/features/meetings/meetingsApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

const ScheduleMeetingModal = ({ isOpen, onClose, hostEmail, type,editMeeting }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const optionsRequireHostToStart = [
    { value: true,  label: t('scheduleMeetingModal.requireHostYes') },
    { value: false, label: t('scheduleMeetingModal.requireHostNo') },
  ];
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledDateTime: "",
    duration: 60,
    requireHostToStart: false,
  });
  const [errors, setErrors] = useState({});

  const [scheduleMeeting, { isLoading }] = useScheduleMeetingMutation();
  const [updateMeeting, { isLoading: isUpdating }] = useUpdateMeetingApiMutation();
  const isSubmitting = isLoading || isUpdating;

  useEffect(() => {
    if (type === "now") {
      const date = new Date(Date.now()); 
      setFormData((prev) => ({ ...prev, scheduledDateTime: date.toISOString() }));
    }
  }, [type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Thời điểm tối thiểu cho input (giờ hiện tại, theo local) để chặn chọn ngày/giờ quá khứ
  const minDateTime = (() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  })();

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = t('scheduleMeetingModal.errorTitleRequired');
    }
    if (type !== "now") {
      if (!formData.scheduledDateTime) {
        newErrors.scheduledDateTime = t('scheduleMeetingModal.errorDateTimeRequired');
      } else if (new Date(formData.scheduledDateTime) <= new Date()) {
        newErrors.scheduledDateTime = t('scheduleMeetingModal.errorDateTimePast');
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const localDate = new Date(formData.scheduledDateTime);
    const payload = {
      hostEmail,
      title: formData.title,
      description: formData.description,
      scheduledDateTime: localDate.toISOString(),
      duration: Number(formData.duration),
      requireHostToStart: type === "now" ? false : formData.requireHostToStart,
    };

    try {
    if (type === "edit") {
      // Gửi id của meeting cần update
      await updateMeeting({ id: editMeeting.id,roomCode:editMeeting.roomCode, ...payload }).unwrap();
      toast.success(t('scheduleMeetingModal.updateSuccess'));
    } else {
      const res = await scheduleMeeting(payload).unwrap();
      toast.success(t('scheduleMeetingModal.scheduleSuccess'));
      if (type === "now" && res?.data?.meetingLink) navigate(res.data.meetingLink);
    }
    onClose();
  } catch (err) {
    console.error(err);
    toast.error(err?.data?.message || t('scheduleMeetingModal.error'));
  }
  };

  const handleClose = () => {
    onClose();
    setFormData({ title: "", description: "", scheduledDateTime: "", duration: 60, requireHostToStart: false });
    setErrors({});
  };

  useEffect(() => {
  if (type === "edit" && editMeeting) {
    setFormData({
      title: editMeeting.title || "",
      description: editMeeting.description || "",
      scheduledDateTime: editMeeting.scheduledDateTime
        ? (() => {
            // datetime-local hiển thị theo giờ local, nên bù timezone offset
            const d = new Date(editMeeting.scheduledDateTime);
            return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16);
          })()
        : "",
      duration: editMeeting.duration || 60,
      requireHostToStart: editMeeting.requireHostToStart ?? false,
    });
  }
  }, [type, editMeeting]);

  if (!isOpen) return null;

  const isEdit = type === "edit";

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60">
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden border border-[var(--line)]"
        style={{ background: "var(--surface)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Video size={18} color="white" />
            </div>
            <div>
              <p className="text-[var(--content)] text-sm font-medium">
                {isEdit
                  ? t('scheduleMeetingModal.editTitle')
                  : type === "schedule"
                    ? t('scheduleMeetingModal.scheduleTitle')
                    : t('scheduleMeetingModal.nowTitle')}
              </p>
              <p className="text-[var(--content)]/70 text-xs">{t('scheduleMeetingModal.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-[var(--content)] hover:bg-white/25 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-6">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-[var(--content)]/50">{t('scheduleMeetingModal.title')}</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('scheduleMeetingModal.titlePlaceholder')}
              className={`w-full rounded-lg px-3.5 py-2.5 text-sm text-[var(--content)] placeholder-white/30 border outline-none transition-colors ${
                errors.title
                  ? "border-red-500 focus:border-red-500"
                  : "border-[var(--line)] focus:border-[var(--accent)]"
              }`}
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
            {errors.title && (
              <span className="text-xs text-red-400">{errors.title}</span>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-[var(--content)]/50">{t('scheduleMeetingModal.description')}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('scheduleMeetingModal.descriptionPlaceholder')}
              rows={3}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm text-[var(--content)] placeholder-white/30 border border-[var(--line)] outline-none focus:border-[var(--accent)] transition-colors resize-none"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          </div>

          {/* Date & Duration */}
          <div className="flex gap-3">
            {(type === "schedule" || isEdit) && (
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-[var(--content)]/50 flex items-center gap-1.5">
                  <Calendar size={11} />
                  {t('scheduleMeetingModal.dateTime')}
                </label>
                <input
                  type="datetime-local"
                  name="scheduledDateTime"
                  value={formData.scheduledDateTime}
                  onChange={handleChange}
                  min={minDateTime}
                  className={`w-full rounded-lg px-3.5 py-2.5 text-xs text-[var(--content)] border outline-none transition-colors ${
                    errors.scheduledDateTime
                      ? "border-red-500 focus:border-red-500"
                      : "border-[var(--line)] focus:border-[var(--accent)]"
                  }`}
                  style={{ background: "rgba(255,255,255,0.06)", colorScheme: "dark" }}
                />
                {errors.scheduledDateTime && (
                  <span className="text-xs text-red-400">{errors.scheduledDateTime}</span>
                )}
              </div>
            )}
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-[var(--content)]/50 flex items-center gap-1.5">
                <Clock size={11} />
                {t('scheduleMeetingModal.duration')}
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm text-[var(--content)] border border-[var(--line)] outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
                style={{ background: "var(--surface)" }}
              >
                {[30, 60, 90, 120].map((m) => (
                  <option key={m} value={m}>{t('scheduleMeetingModal.minutes', { count: m })}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Host */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-[var(--content)]/50 flex items-center gap-1.5">
              <User size={11} />
              {t('scheduleMeetingModal.host')}
            </label>
            <div
              className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 border border-[var(--line)]"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-[var(--content)] shrink-0"
                style={{ background: "linear-gradient(135deg, #f97316, #ef4444)" }}
              >
                {hostEmail?.charAt(0).toUpperCase()}
              </div>
              <span className="text-[var(--content)] text-sm flex-1 truncate">{hostEmail}</span>
              <span
                className="text-[var(--content)]/40 text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                {t('scheduleMeetingModal.hostBadge')}
              </span>
            </div>
          </div>

          {/* Require Host To Start — ẩn khi Start Now (host đang ở phòng rồi) */}
          {type !== "now" && (
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider text-[var(--content)]/50">
                {t('scheduleMeetingModal.requireHostToStart')}
              </label>
              <div
                className="flex flex-col gap-2 rounded-lg px-3.5 py-3 border border-[var(--line)]"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                {optionsRequireHostToStart.map((option) => (
                  <label
                    key={String(option.value)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="requireHostToStart"
                        checked={formData.requireHostToStart === option.value}
                        onChange={() =>
                          setFormData((prev) => ({ ...prev, requireHostToStart: option.value }))
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          formData.requireHostToStart === option.value
                            ? "border-[var(--accent)]"
                            : "border-[var(--line)] group-hover:border-[var(--line)]"
                        }`}
                      >
                        {formData.requireHostToStart === option.value && (
                          <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-[var(--content)]/80 group-hover:text-[var(--content)] transition-colors">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-1">
            <button
              onClick={handleClose}
              className="flex-1 cursor-pointer py-3 rounded-lg text-sm text-[var(--content)]/70 border border-[var(--line)] hover:border-[var(--line)] transition-colors"
            >
              {t('scheduleMeetingModal.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-[2] cursor-pointer py-3 rounded-lg text-sm font-medium text-[var(--content)] flex items-center justify-center gap-2 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
            >
              {isEdit ? <Pencil size={16} /> : <Video size={16} />}
              {isSubmitting
                ? t('scheduleMeetingModal.loading')
                : isEdit
                  ? t('scheduleMeetingModal.saveChanges')
                  : t('scheduleMeetingModal.createMeeting')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ScheduleMeetingModal;