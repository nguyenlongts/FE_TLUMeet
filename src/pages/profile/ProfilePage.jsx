import { useEffect, useRef, useState } from "react";
import { Form, Input, DatePicker, Button, ConfigProvider, theme } from "antd";
import { Camera, Save, Mail, MapPin, CalendarDays, User } from "lucide-react";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import {
  useGetProfileQuery,
  useUpdateUserMutation,
  useUploadAvatarMutation,
} from "../../redux/features/user/userApi";
import { resizeImage } from "../../utils/resizeImage";
import toast from "react-hot-toast";
import Loading from "../../components/Loading";

const ProfilePage = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const currentUser = useSelector(selectCurrentUser);

  const { data: user, isLoading } = useGetProfileQuery(currentUser?.id, {
    skip: !currentUser?.id,
  });

  const [uploadAvatar, { isLoading: isUploadingAvatar }] =
    useUploadAvatarMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [pendingAvatar, setPendingAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      birthday: user.birthday ? dayjs(user.birthday) : null,
      address: user.address,
    });
  }, [user, form]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const resized = await resizeImage(file, 400, 400);
    const url = URL.createObjectURL(resized);
    setPreviewUrl(url);
    setPendingAvatar({ file: resized });
  };

  const handleSave = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      let avatarUrl = user?.avatarUrl;
      if (pendingAvatar) {
        const fd = new FormData();
        fd.append("avatar", pendingAvatar.file);
        const result = await uploadAvatar(fd).unwrap();
        avatarUrl = result?.avatarUrl ?? avatarUrl;
      }

      await updateProfile({
        userId: currentUser.id,
        ...values,
        birthday: values.birthday ? values.birthday.toISOString() : null,
        avatarUrl,
      }).unwrap();

      setPendingAvatar(null);
      toast.success(t("profile.toast.success"));
    } catch (error) {
      if (error?.errorFields) return;
      toast.error(error?.data?.message || t("profile.toast.error"));
    }
  };

  const handleReset = () => {
    form.resetFields();
    setPendingAvatar(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        birthday: user.birthday ? dayjs(user.birthday) : null,
        address: user.address,
      });
    }
  };

  const avatarSrc = previewUrl ?? user?.avatarUrl ?? null;
  const displayName = user?.name || currentUser?.name || t("profile.defaultUser");

  if (isLoading) return <Loading text={t("profile.loading")} />;

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#7c3aed",
          colorBgContainer: "#0e0c1e",
          colorBorder: "#2a2245",
          colorText: "#e2def5",
          colorTextPlaceholder: "#5a5478",
          borderRadius: 12,
          fontSize: 14,
          controlHeight: 44,
          colorBgElevated: "#1a1535",
        },
        components: {
          Input: {
            activeBorderColor: "#7c3aed",
            hoverBorderColor: "#4a3a8a",
            paddingInline: 14,
          },
          DatePicker: {
            activeBorderColor: "#7c3aed",
            hoverBorderColor: "#4a3a8a",
          },
          Form: {
            labelColor: "#8b7bb5",
            labelFontSize: 11,
          },
        },
      }}
    >
      <div className="min-h-full w-full bg-[#0b0919] overflow-y-auto">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-10 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">{t("profile.title")}</h1>
            <p className="mt-1 text-sm text-[#8b7bb5]">{t("profile.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <aside className="lg:col-span-1">
              <div className="bg-[#150f2a] border border-[#2a2245] rounded-2xl p-6 flex flex-col items-center text-center">
                <div className="relative">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#2a2245]"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-32 h-32 text-4xl font-semibold text-white rounded-full select-none bg-gradient-to-br from-violet-500 to-pink-500 border-4 border-[#2a2245]">
                      {displayName?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-violet-600 border-4 border-[#150f2a] flex items-center justify-center hover:bg-violet-500 transition-colors disabled:opacity-60"
                  >
                    <Camera size={14} className="text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <p className="mt-5 text-lg font-semibold text-white">
                  {displayName}
                </p>
                <p className="mt-1 text-xs text-[#8b7bb5] break-all">
                  {user?.email}
                </p>
                <span className="inline-block mt-3 text-[11px] bg-violet-900/40 text-violet-300 px-3 py-1 rounded-full border border-violet-700/40">
                  {t("profile.proMember")}
                </span>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-6 w-full text-xs text-violet-300 border border-[#3a2f6a] rounded-xl px-4 py-2.5 hover:bg-violet-900/30 transition-colors"
                >
                  {t("profile.changeAvatar")}
                </button>

                {pendingAvatar && (
                  <p className="mt-3 text-[11px] text-amber-400">
                    {t("profile.pendingAvatarHint")}
                  </p>
                )}
              </div>

              <div className="bg-[#150f2a] border border-[#2a2245] rounded-2xl p-6 mt-6 space-y-4">
                <h3 className="text-sm font-semibold text-white">
                  {t("profile.summary")}
                </h3>
                <InfoRow
                  icon={<Mail size={14} />}
                  label={t("profile.fields.email")}
                  value={user?.email || "—"}
                />
                <InfoRow
                  icon={<CalendarDays size={14} />}
                  label={t("profile.fields.birthday")}
                  value={
                    user?.birthday
                      ? dayjs(user.birthday).format("DD/MM/YYYY")
                      : t("common.notUpdated")
                  }
                />
                <InfoRow
                  icon={<MapPin size={14} />}
                  label={t("profile.fields.address")}
                  value={user?.address || t("common.notUpdated")}
                />
              </div>
            </aside>

            <section className="lg:col-span-2">
              <div className="bg-[#150f2a] border border-[#2a2245] rounded-2xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {t("profile.editTitle")}
                    </h2>
                    <p className="mt-1 text-xs text-[#8b7bb5]">
                      {t("profile.editSubtitle")}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-[#2a2245] mb-6" />

                <Form form={form} layout="vertical" requiredMark={false}>
                  <Form.Item
                    label={
                      <span className="text-[11px] tracking-widest text-white font-medium">
                        {t("profile.fields.name")}
                      </span>
                    }
                    name="name"
                    rules={[{ required: true, message: t("profile.validation.nameRequired") }]}
                  >
                    <Input
                      prefix={<User size={14} className="text-[#5a5478]" />}
                      placeholder={t("profile.placeholders.name")}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="text-[11px] tracking-widest text-white font-medium">
                        {t("profile.fields.email")}
                      </span>
                    }
                    name="email"
                    rules={[
                      { required: true, message: t("profile.validation.emailRequired") },
                      { type: "email", message: t("profile.validation.emailInvalid") },
                    ]}
                  >
                    <Input
                      prefix={<Mail size={14} className="text-[#5a5478]" />}
                      placeholder={t("profile.placeholders.email")}
                      disabled
                    />
                  </Form.Item>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                    <Form.Item
                      label={
                        <span className="text-[11px] tracking-widest text-white font-medium">
                          {t("profile.fields.birthday")}
                        </span>
                      }
                      name="birthday"
                    >
                      <DatePicker
                        format="DD/MM/YYYY"
                        placeholder={t("profile.placeholders.birthday")}
                        style={{ width: "100%" }}
                        suffixIcon={<CalendarDays size={14} className="text-[#5a5478]" />}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-[11px] tracking-widest text-white font-medium">
                          {t("profile.fields.address")}
                        </span>
                      }
                      name="address"
                    >
                      <Input
                        prefix={<MapPin size={14} className="text-[#5a5478]" />}
                        placeholder={t("profile.placeholders.address")}
                      />
                    </Form.Item>
                  </div>

                  <div className="h-px bg-[#2a2245] my-2" />

                  <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-3">
                      <Button
                        onClick={handleReset}
                        className="!h-[44px] !rounded-xl !border-[#2a2245] !text-[#8b7bb5] hover:!text-white"
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button
                        onClick={handleSave}
                        loading={isUpdating || isUploadingAvatar}
                        className="!flex !items-center !gap-2 !bg-gradient-to-r !from-violet-600 !to-purple-500 !border-0 !text-white !rounded-xl !px-6 !h-[44px] hover:!opacity-90"
                        icon={<Save size={15} />}
                      >
                        {t("common.save")}
                      </Button>
                    </div>
                  </Form.Item>
                </Form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-7 h-7 rounded-lg bg-[#0e0c1e] border border-[#2a2245] flex items-center justify-center text-violet-400 shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-widest text-[#5a5478]">
        {label}
      </p>
      <p className="text-sm text-white mt-0.5 break-words">{value}</p>
    </div>
  </div>
);

export default ProfilePage;
