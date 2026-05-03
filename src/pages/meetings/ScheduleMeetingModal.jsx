// import { useState, useEffect } from "react";
// import { Video, X, Calendar, Clock, User } from "lucide-react";
// import { useScheduleMeetingMutation } from "../../redux/features/meetings/meetingsApi";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";

// const optionsRequireHostToStart = [
//   { value: true,  label: "Cần host để bắt đầu" },
//   { value: false, label: "Không cần host" },
// ];

// const ScheduleMeetingModal = ({ isOpen, onClose, hostEmail, type }) => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     scheduledDateTime: "",
//     duration: 60,
//     requireHostToStart: false,  
//   });

//   const [scheduleMeeting, { isLoading }] = useScheduleMeetingMutation();


//   useEffect(() => {
//     if (type === "now") {
//       const date = new Date(Date.now()); 
//       setFormData((prev) => ({ ...prev, scheduledDateTime: date.toISOString() }));
//     }
//   }, [type]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async () => {
//     if (!formData.title || !formData.scheduledDateTime) return;

//     const localDate = new Date(formData.scheduledDateTime);
//     const payload = {
//       hostEmail,
//       title: formData.title,
//       description: formData.description,
//       scheduledDateTime: localDate.toISOString(),
//       duration: Number(formData.duration),
//       requireHostToStart: formData.requireHostToStart,
//     };

//     try {
//       const res = await scheduleMeeting(payload);
//       if (type === "now") navigate(`${res.data.data.meetingLink}`);
//       onClose();
//       toast.success("Lên lịch thành công");
//     } catch (err) {
//       console.error(err);
//       toast.error("Đã xảy ra lỗi");
//     }
//   };

//   const handleClose = () => {
//     onClose();
//     setFormData({ title: "", description: "", scheduledDateTime: "", duration: 60, requireHostToStart: false });
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
//       <div
//         className="w-full max-w-lg rounded-2xl overflow-hidden border border-white/8"
//         style={{ background: "#1a1d2e" }}
//       >
//         {/* Header */}
//         <div
//           className="flex items-center justify-between px-6 py-5"
//           style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
//         >
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
//               <Video size={18} color="white" />
//             </div>
//             <div>
//               <p className="text-white text-sm font-medium">
//                 {type === "schedule" ? "Schedule New Meeting" : "Start Meeting Now"}
//               </p>
//               <p className="text-white/70 text-xs">Start New Meeting</p>
//             </div>
//           </div>
//           <button
//             onClick={handleClose}
//             className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
//           >
//             <X size={14} />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="flex flex-col gap-4 p-6">
//           {/* Title */}
//           <div className="flex flex-col gap-1.5">
//             <label className="text-xs uppercase tracking-wider text-white/50">Title</label>
//             <input
//               name="title"
//               value={formData.title}
//               onChange={handleChange}
//               placeholder="Enter meeting title..."
//               className="w-full rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/30 border border-white/10 outline-none focus:border-purple-500 transition-colors"
//               style={{ background: "rgba(255,255,255,0.06)" }}
//             />
//           </div>

//           {/* Description */}
//           <div className="flex flex-col gap-1.5">
//             <label className="text-xs uppercase tracking-wider text-white/50">Description</label>
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               placeholder="Enter description..."
//               rows={3}
//               className="w-full rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/30 border border-white/10 outline-none focus:border-purple-500 transition-colors resize-none"
//               style={{ background: "rgba(255,255,255,0.06)" }}
//             />
//           </div>

//           {/* Date & Duration */}
//           <div className="flex gap-3">
//             {type === "schedule" && (
//               <div className="flex-1 flex flex-col gap-1.5">
//                 <label className="text-xs uppercase tracking-wider text-white/50 flex items-center gap-1.5">
//                   <Calendar size={11} />
//                   Date & Time
//                 </label>
//                 <input
//                   type="datetime-local"
//                   name="scheduledDateTime"
//                   value={formData.scheduledDateTime}
//                   onChange={handleChange}
//                   className="w-full rounded-lg px-3.5 py-2.5 text-xs text-white border border-white/10 outline-none focus:border-purple-500 transition-colors"
//                   style={{ background: "rgba(255,255,255,0.06)", colorScheme: "dark" }}
//                 />
//               </div>
//             )}
//             <div className="flex-1 flex flex-col gap-1.5">
//               <label className="text-xs uppercase tracking-wider text-white/50 flex items-center gap-1.5">
//                 <Clock size={11} />
//                 Duration
//               </label>
//               <select
//                 name="duration"
//                 value={formData.duration}
//                 onChange={handleChange}
//                 className="w-full rounded-lg px-3.5 py-2.5 text-sm text-white border border-white/10 outline-none focus:border-purple-500 transition-colors cursor-pointer"
//                 style={{ background: "#1e2235" }}
//               >
//                 <option value={30}>30 minutes</option>
//                 <option value={60}>60 minutes</option>
//                 <option value={90}>90 minutes</option>
//                 <option value={120}>120 minutes</option>
//               </select>
//             </div>
//           </div>

//           {/* Host */}
//           <div className="flex flex-col gap-1.5">
//             <label className="text-xs uppercase tracking-wider text-white/50 flex items-center gap-1.5">
//               <User size={11} />
//               Host
//             </label>
//             <div
//               className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 border border-white/10"
//               style={{ background: "rgba(255,255,255,0.06)" }}
//             >
//               <div
//                 className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0"
//                 style={{ background: "linear-gradient(135deg, #f97316, #ef4444)" }}
//               >
//                 {hostEmail?.charAt(0).toUpperCase()}
//               </div>
//               <span className="text-white text-sm flex-1 truncate">{hostEmail}</span>
//               <span
//                 className="text-white/40 text-xs px-2 py-0.5 rounded-full"
//                 style={{ background: "rgba(255,255,255,0.08)" }}
//               >
//                 Host
//               </span>
//             </div>
//           </div>


//           <div className="flex flex-col gap-2">
//             <label className="text-xs uppercase tracking-wider text-white/50">
//               Require Host To Start
//             </label>
//             <div
//               className="flex flex-col gap-2 rounded-lg px-3.5 py-3 border border-white/10"
//               style={{ background: "rgba(255,255,255,0.06)" }}
//             >
//               {optionsRequireHostToStart.map((option) => (
//                 <label
//                   key={String(option.value)}
//                   className="flex items-center gap-3 cursor-pointer group"
//                 >
//                   <div className="relative flex items-center justify-center">
//                     <input
//                       type="radio"
//                       name="requireHostToStart"

//                       checked={formData.requireHostToStart === option.value}
//                       onChange={() =>
//                         setFormData((prev) => ({ ...prev, requireHostToStart: option.value }))
//                       }
//                       className="sr-only" // ẩn input mặc định, dùng UI custom bên dưới
//                     />
   
//                     <div
//                       className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
//                         formData.requireHostToStart === option.value
//                           ? "border-purple-500"
//                           : "border-white/30 group-hover:border-white/50"
//                       }`}
//                     >
//                       {formData.requireHostToStart === option.value && (
//                         <div className="w-2 h-2 rounded-full bg-purple-500" />
//                       )}
//                     </div>
//                   </div>
//                   <span className="text-sm text-white/80 group-hover:text-white transition-colors">
//                     {option.label}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex gap-3 mt-1">
//             <button
//               onClick={handleClose}
//               className="flex-1 cursor-pointer py-3 rounded-lg text-sm text-white/70 border border-white/15 hover:border-white/30 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSubmit}
//               disabled={isLoading}
//               className="flex-[2] cursor-pointer py-3 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
//               style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
//             >
//               <Video size={16} />
//               {isLoading ? "Loading..." : "Create Meeting"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ScheduleMeetingModal;
import { useState, useEffect } from "react";
import { Video, X, Calendar, Clock, User, Pencil } from "lucide-react";
import { useScheduleMeetingMutation } from "../../redux/features/meetings/meetingsApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const optionsRequireHostToStart = [
  { value: true,  label: "Cần host để bắt đầu" },
  { value: false, label: "Không cần host" },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  scheduledDateTime: "",
  duration: 60,
  requireHostToStart: false,
};

/**
 * Props:
 *  isOpen        : boolean
 *  onClose       : () => void
 *  hostEmail     : string
 *  type          : "now" | "schedule" | "edit"
 *  meeting       : object | null   — required when type === "edit"
 *                  { id, title, description, scheduledDateTime, duration, requireHostToStart }
 */
const ScheduleMeetingModal = ({ isOpen, onClose, hostEmail, type, meeting }) => {
  const navigate = useNavigate();
  const isEdit = type === "edit";

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [scheduleMeeting, { isLoading: isCreating }] = useScheduleMeetingMutation();
  // const [updateMeeting,   { isLoading: isUpdating  }] = useUpdateMeetingMutation();
  const isLoading = isCreating 
  // || isUpdating;

  // Populate form whenever modal opens or meeting changes
  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && meeting) {
      const dt = meeting.scheduledDateTime
        ? new Date(meeting.scheduledDateTime).toISOString().slice(0, 16)
        : "";
      setFormData({
        title:               meeting.title               ?? "",
        description:         meeting.description         ?? "",
        scheduledDateTime:   dt,
        duration:            meeting.duration            ?? 60,
        requireHostToStart:  meeting.requireHostToStart  ?? false,
      });
    } else if (type === "now") {
      setFormData((prev) => ({
        ...EMPTY_FORM,
        scheduledDateTime: new Date().toISOString(),
      }));
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [isOpen, type, meeting]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || (!isEdit && !formData.scheduledDateTime && type !== "now")) return;

    const payload = {
      hostEmail,
      title:              formData.title,
      description:        formData.description,
      scheduledDateTime:  new Date(formData.scheduledDateTime).toISOString(),
      duration:           Number(formData.duration),
      requireHostToStart: formData.requireHostToStart,
    };

    try {
      if (isEdit) {
        // await updateMeeting({ id: meeting.id, ...payload }).unwrap();
        toast.success("Cập nhật cuộc họp thành công");
        onClose();
      } else {
        const res = await scheduleMeeting(payload).unwrap();
        if (type === "now") navigate(`${res.data.meetingLink}`);
        toast.success("Lên lịch thành công");
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi");
    }
  };

  const handleClose = () => {
    onClose();
    setFormData(EMPTY_FORM);
  };

  if (!isOpen) return null;

  // Header label
  const headerTitle =
    isEdit       ? "Edit Meeting"      :
    type === "now" ? "Start Meeting Now" :
                   "Schedule New Meeting";
  const headerSub =
    isEdit ? "Update meeting details" : "Start New Meeting";

  // Submit button label
  const submitLabel =
    isLoading ? "Loading..." :
    isEdit    ? "Save " :
               "Create Meeting";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden border border-white/8"
        style={{ background: "#1a1d2e" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              {isEdit ? <Pencil size={18} color="white" /> : <Video size={18} color="white" />}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{headerTitle}</p>
              <p className="text-white/70 text-xs">{headerSub}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-6">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-white/50">Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter meeting title..."
              className="w-full rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/30 border border-white/10 outline-none focus:border-purple-500 transition-colors"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-white/50">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description..."
              rows={3}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/30 border border-white/10 outline-none focus:border-purple-500 transition-colors resize-none"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          </div>

          {/* Date & Duration */}
          <div className="flex gap-3">
            {(type === "schedule" || isEdit) && (
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                  <Calendar size={11} />
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="scheduledDateTime"
                  value={formData.scheduledDateTime}
                  onChange={handleChange}
                  className="w-full rounded-lg px-3.5 py-2.5 text-xs text-white border border-white/10 outline-none focus:border-purple-500 transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", colorScheme: "dark" }}
                />
              </div>
            )}
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                <Clock size={11} />
                Duration
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm text-white border border-white/10 outline-none focus:border-purple-500 transition-colors cursor-pointer"
                style={{ background: "#1e2235" }}
              >
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>
          </div>

          {/* Host */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-white/50 flex items-center gap-1.5">
              <User size={11} />
              Host
            </label>
            <div
              className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 border border-white/10"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0"
                style={{ background: "linear-gradient(135deg, #f97316, #ef4444)" }}
              >
                {hostEmail?.charAt(0).toUpperCase()}
              </div>
              <span className="text-white text-sm flex-1 truncate">{hostEmail}</span>
              <span
                className="text-white/40 text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                Host
              </span>
            </div>
          </div>

          {/* Require Host To Start */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-white/50">
              Require Host To Start
            </label>
            <div
              className="flex flex-col gap-2 rounded-lg px-3.5 py-3 border border-white/10"
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
                          ? "border-purple-500"
                          : "border-white/30 group-hover:border-white/50"
                      }`}
                    >
                      {formData.requireHostToStart === option.value && (
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-1">
            <button
              onClick={handleClose}
              className="flex-1 cursor-pointer py-3 rounded-lg text-sm text-white/70 border border-white/15 hover:border-white/30 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-[2] cursor-pointer py-3 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
            >
              {isEdit ? <Pencil size={16} /> : <Video size={16} />}
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeetingModal;