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
import { useTheme } from "../../context/ThemeContext";

const ProfilePage = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
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
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: (isDark ? "#7c3aed" : "#0284c7"),
          borderRadius: 12,
          fontSize: 14,
          controlHeight: 44,
        },
        components: {
          Input: {
            activeBorderColor: (isDark ? "#7c3aed" : "#0284c7"),
            paddingInline: 14,
          },
          DatePicker: {
            activeBorderColor: (isDark ? "#7c3aed" : "#0284c7"),
          },
          Form: {
            labelFontSize: 11,
          },
        },
      }}
    >
      <div className="min-h-full w-full bg-[var(--bg)] overflow-y-auto">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-10 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--content)]">{t("profile.title")}</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">{t("profile.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <aside className="lg:col-span-1">
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 flex flex-col items-center text-center">
                <div className="relative">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-[var(--line)]"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-32 h-32 text-4xl font-semibold text-[var(--content)] rounded-full select-none bg-gradient-to-br from-[var(--accent)] to-pink-500 border-4 border-[var(--line)]">
                      {displayName?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[var(--accent)] border-4 border-[var(--surface)] flex items-center justify-center hover:bg-[var(--accent)] transition-colors disabled:opacity-60"
                  >
                    <Camera size={14} className="text-[var(--content)]" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <p className="mt-5 text-lg font-semibold text-[var(--content)]">
                  {displayName}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)] break-all">
                  {user?.email}
                </p>
                <span className="inline-block mt-3 text-[11px] bg-[var(--accent)]/40 text-[var(--accent-fg)] px-3 py-1 rounded-full border border-[var(--accent-hover)]/40">
                  {t("profile.proMember")}
                </span>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-6 w-full text-xs text-[var(--accent-fg)] border border-[var(--accent)]/40 rounded-xl px-4 py-2.5 hover:bg-[var(--accent)]/30 transition-colors"
                >
                  {t("profile.changeAvatar")}
                </button>

                {pendingAvatar && (
                  <p className="mt-3 text-[11px] text-amber-400">
                    {t("profile.pendingAvatarHint")}
                  </p>
                )}
              </div>

              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 mt-6 space-y-4">
                <h3 className="text-sm font-semibold text-[var(--content)]">
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
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--content)]">
                      {t("profile.editTitle")}
                    </h2>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {t("profile.editSubtitle")}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-[var(--line)] mb-6" />

                <Form form={form} layout="vertical" requiredMark={false}>
                  <Form.Item
                    label={
                      <span className="text-[11px] tracking-widest text-[var(--content)] font-medium">
                        {t("profile.fields.name")}
                      </span>
                    }
                    name="name"
                    rules={[{ required: true, message: t("profile.validation.nameRequired") }]}
                  >
                    <Input
                      prefix={<User size={14} className="text-[var(--faint)]" />}
                      placeholder={t("profile.placeholders.name")}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="text-[11px] tracking-widest text-[var(--content)] font-medium">
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
                      prefix={<Mail size={14} className="text-[var(--faint)]" />}
                      placeholder={t("profile.placeholders.email")}
                      disabled
                    />
                  </Form.Item>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                    <Form.Item
                      label={
                        <span className="text-[11px] tracking-widest text-[var(--content)] font-medium">
                          {t("profile.fields.birthday")}
                        </span>
                      }
                      name="birthday"
                    >
                      <DatePicker
                        format="DD/MM/YYYY"
                        placeholder={t("profile.placeholders.birthday")}
                        style={{ width: "100%" }}
                        suffixIcon={<CalendarDays size={14} className="text-[var(--faint)]" />}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-[11px] tracking-widest text-[var(--content)] font-medium">
                          {t("profile.fields.address")}
                        </span>
                      }
                      name="address"
                    >
                      <Input
                        prefix={<MapPin size={14} className="text-[var(--faint)]" />}
                        placeholder={t("profile.placeholders.address")}
                      />
                    </Form.Item>
                  </div>

                  <div className="h-px bg-[var(--line)] my-2" />

                  <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-3">
                      <Button
                        onClick={handleReset}
                        className="!h-[44px] !rounded-xl !border-[var(--line)] !text-[var(--muted)] hover:!text-[var(--content)]"
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button
                        onClick={handleSave}
                        loading={isUpdating || isUploadingAvatar}
                        className="!flex !items-center !gap-2 !bg-gradient-to-r !from-[var(--accent)] !to-[var(--accent)] !border-0 !text-[var(--content)] !rounded-xl !px-6 !h-[44px] hover:!opacity-90"
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
    <div className="w-7 h-7 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center text-[var(--accent-fg)] shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-widest text-[var(--faint)]">
        {label}
      </p>
      <p className="text-sm text-[var(--content)] mt-0.5 break-words">{value}</p>
    </div>
  </div>
);

export default ProfilePage;
