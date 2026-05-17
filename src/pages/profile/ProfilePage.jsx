import { useEffect, useRef, useState } from "react";
import { Form, Input, DatePicker, Button, ConfigProvider, theme } from "antd";
import { Camera, CheckCircle2, Save } from "lucide-react";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import {useGetProfileQuery, useUpdateUserMutation, useUploadAvatarMutation} from '../../redux/features/user/userApi'
import { resizeImage } from "../../utils/resizeImage";
import toast from "react-hot-toast";
const  ProfilePage=()=> {
  const [form] = Form.useForm();
  const [saved, setSaved] = useState(false);
  const data=useSelector(selectCurrentUser)

  const {data:user,isLoading,isSuccess}=useGetProfileQuery(data.id)
  const [uploadAvatar, {isLoading:isUploadAvatarLoading}] = useUploadAvatarMutation()
  const [updateProfile] =useUpdateUserMutation()


  const [pendingAvatar, setPendingAvatar] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const resizedImage= await resizeImage(file,400,400)
    const previewUrl= URL.createObjectURL(resizedImage)
    setPreviewUrl(URL.createObjectURL(resizedImage))
    setPendingAvatar({file:resizedImage,previewUrl})

    // const formData = new FormData()
    // formData.append('avatar', resizedImage)

    // try {
    //   await uploadAvatar(formData).unwrap()
    //   toast.success('Cập nhật ảnh thành công!')
    // } catch (err) {
    //   toast.error(err?.data?.message || 'Upload thất bại')
    //   setPreviewUrl(null)
    // }
  }
  const handleSave =async () => {
    try {
      await form.validateFields()
      const values= form.getFieldsValue()
      let avatarUrlUp = user?.avatar;
      if (pendingAvatar) {
        const fd = new FormData();
        fd.append("avatar", pendingAvatar.file);
        const result = await uploadAvatar(fd).unwrap();
        avatarUrlUp = result?.avatarUrl;
      }
      await updateProfile({
        userId: data.id,
        ...values,
        avatarUrl: avatarUrlUp
      }).unwrap
      toast.success("Cập nhật thành công!")
    } catch (error) {
      toast.error(error?.data?.message || "Cập nhật thất bại")
    }
  };
  useEffect(() => {
  if (user) {
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      birthday: user.birthday ? dayjs(user.birthday) : null,
      address: user.address,
    })
  }
  }, [user])

  const avatarSrc = previewUrl ?? user?.avatarUrl ?? null  
  return(
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#7c3aed",
          colorBgContainer: "#0e0c1e",
          colorBorder: "#2a2245",
          colorText: "#ccc9e8",
          colorTextPlaceholder: "#3d3860",
          borderRadius: 12,
          fontSize: 14,
          controlHeight: 42,
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
            labelColor: "#5a5478",
            labelFontSize: 11,
          },
        },
      }}
    >
      {/* <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center p-6"> */}
        <div className="w-full max-h-2xl overflow-y-auto  bg-[#150f2a] border border-[#2a2245] rounded-2xl p-8 flex flex-col gap-7">

          {/* Header */}
          <div>
            <h1 className="text-xl font-semibold text-white">Thông tin cá nhân</h1>
            <p className="text-sm text-[#5a5478] mt-1">Cập nhật ảnh và thông tin của bạn</p>
          </div>


          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
                {avatarSrc ? (
                  <img
                      src={avatarSrc}
                      className="w-20 h-20 rounded-full object-cover"
                      alt="avatar"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-20 h-20 text-2xl font-semibold text-white rounded-full select-none bg-gradient-to-br from-violet-400 to-pink-500">
                      {user?.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
              <button
                onClick={()=> fileInputRef.current.click()}
               className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full bg-violet-600 border-2 border-[#150f2a] flex items-center justify-center hover:bg-violet-500 transition-colors">
                <Camera size={11} className="text-white" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-white">{user?.name}</p>
              {/* <p className="text-xs text-[#5a5478] mt-0.5">Product Designer</p> */}
              <span className="inline-block mt-2 text-[11px] bg-violet-900/50 text-violet-300 px-3 py-0.5 rounded-full border border-violet-700/40">
                Pro Member
              </span>
            </div>

            <button onClick={() => fileInputRef.current.click()} className="ml-auto text-xs text-violet-400 border border-[#3a2f6a] rounded-full px-4 py-1.5 hover:bg-violet-900/30 transition-colors">
              Đổi ảnh
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#2a2245]" />

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              name:user?.name,
              email: user?.email,
              birthday: dayjs("1998-03-15"),
              address: "Cầu Giấy, Hà Nội",
            }}
            requiredMark={false}
            style={{ gap: 0 }}
          >
              <Form.Item
                label={<span className="text-[11px] tracking-widest text-white font-medium">HỌ</span>}
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập họ" }]}
              >
                <Input placeholder="Họ" />
              </Form.Item>
            <Form.Item
              label={<span className="text-[11px] tracking-widest text-white font-medium">EMAIL</span>}
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input placeholder="Email" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-x-4">
              <Form.Item
                label={<span className="text-[11px] tracking-widest text-white font-medium">NGÀY SINH</span>}
                name="birthday"
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-[11px] tracking-widest text-white font-medium">ĐỊA CHỈ</span>}
                name="address"
              >
                <Input placeholder="Địa chỉ" />
              </Form.Item>
            </div>

            {/* Save */}
            <Form.Item style={{ marginBottom: 0, marginTop: 4 }}>
              <div className="flex items-center justify-end gap-3">
                <Button
                  onClick={handleSave}
                  className="flex items-center gap-2 !bg-violet-500 !border-0 !text-white !rounded-xl  !px-6 !h-[42px] hover:!opacity-90 hover:!scale-105"
                  icon={<Save size={15} />}
                >
                  Lưu thay đổi
                </Button>
              </div>
            </Form.Item>
          </Form>

        </div>

    </ConfigProvider>
  );
}
export default ProfilePage;