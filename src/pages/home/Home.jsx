import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, ConfigProvider, theme } from "antd";
import { Video, LogIn, UserPlus, ArrowRight } from "lucide-react";
import { useCheckRoomCodeQuery, useJoinMeetingMutation, useLazyCheckRoomCodeQuery } from "../../redux/features/meetings/meetingsApi";
import WaitingRoom from "../meetings/WaitingRoom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";


export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [trigger,setTrigger]=useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkRoomCode]=useLazyCheckRoomCodeQuery();
  const [joinMeeting,{error}]=useJoinMeetingMutation()
  const [showWaitingRoom,setShowWaitingRoom]=useState(false)
  const [roomCode,setRoomCode]=useState()
  const [userName,setUserName]=useState()

  const handleCancel = () => {
    setShowWaitingRoom(false);
  };
  const handleJoinMeeting = async ({ roomCode, guestName }) => {
    try {
      const resCheckRoomCode=await checkRoomCode(roomCode).unwrap()
      if (!resCheckRoomCode?.data) {
        toast.error(t('home.joinCard.roomNotFound'));
        form.setFields([{ name: "roomCode", errors: [t('home.joinCard.roomNotFound')] }]);
        return;
      }
      setRoomCode(roomCode);
      setUserName(guestName)
      setShowWaitingRoom(true)
      const formJoin={
        roomCode:roomCode ,userEmail:null, guestName:guestName
      }
      console.log(formJoin," fj");
      
      const res=await joinMeeting(formJoin).unwrap()
      console.log(res,"res join can thiet");
      if(error){console.log(error)}
      
      sessionStorage.setItem("guestName", guestName.trim());
      sessionStorage.setItem("joinToken", res?.data?.joinToken);
    } catch(err) {
      console.log(err);
      toast.error(err?.data?.message || t('home.joinCard.connectError'));
      form.setFields([{ name: "roomCode", errors: [err?.data?.message || t('home.joinCard.connectError')] }]);
    } finally {
      setIsLoading(false);
    }
  };
  const onHostJoined=async()=>{
    setShowWaitingRoom(false)
    navigate(`/meet/${roomCode}`);    
  }
  return (
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
          controlHeight: 44,
          colorBgElevated: "#1a1535",
        },
        components: {
          Input: {
            activeBorderColor: "#7c3aed",
            hoverBorderColor: "#4a3a8a",
            paddingInline: 16,
          },
          Form: {
            labelColor: "#5a5478",
            labelFontSize: 11,
          },
        },
      }}
    >
      <div className="min-h-screen bg-[#0b0919] flex flex-col font-sans">
        {/* Header */}
        <header className="w-full">
          <div className="flex items-center justify-between px-6 py-5 mx-auto max-w-7xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-br from-violet-600 to-purple-500 rounded-xl">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">TLU Meeting</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#9b8fc0] border border-[#2a2245] rounded-xl hover:bg-[#1a1535] hover:text-white transition-colors"
              >
                <LogIn size={15} />
                <span className="hidden sm:inline">{t('home.header.signIn')}</span>
              </button>
              <button
                onClick={() => navigate("/register")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-opacity bg-gradient-to-r from-violet-600 to-purple-500 rounded-xl hover:opacity-90"
              >
                <UserPlus size={15} />
                <span className="hidden sm:inline">{t('home.header.signUp')}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex items-center justify-center flex-1 px-4 py-12">
          <div className="flex flex-col items-center w-full max-w-4xl">
            {/* Hero */}
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-5xl font-bold leading-tight text-white md:text-6xl">
                {t('home.hero.title1')}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
                  {t('home.hero.title2')}
                </span>
              </h1>
              <p className="text-lg text-[#5a5478] max-w-2xl mx-auto">
                {t('home.hero.subtitle')}
              </p>
            </div>

            {/* Card */}
            <div className="w-full max-w-xl bg-[#150f2a] border border-[#2a2245] rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-center text-white mb-7">
                {t('home.joinCard.title')}
              </h2>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleJoinMeeting}
                requiredMark={false}
              >
                <Form.Item
                  label={
                    <span className="text-[11px] tracking-widest text-[#5a5478] font-medium">
                      {t('home.joinCard.roomCodeLabel')}
                    </span>
                  }
                  name="roomCode"
                  rules={[
                    { required: true, message: t('home.joinCard.roomCodeRequired') },
                    { min: 6, message: t('home.joinCard.roomCodeInvalid') },
                  ]}
                  normalize={(val) => val.toUpperCase()}
                >
                  <Input
                    placeholder={t('home.joinCard.roomCodePlaceholder')}
                    className="!font-mono"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-[11px] tracking-widest text-[#5a5478] font-medium">
                      {t('home.joinCard.nameLabel')}
                    </span>
                  }
                  name="guestName"
                  rules={[
                    { required: true, message: t('home.joinCard.nameRequired') },
                    { min: 2, message: t('home.joinCard.nameMin') },
                  ]}
                >
                  <Input placeholder={t('home.joinCard.namePlaceholder')} />
                </Form.Item>

                <Form.Item className="!mb-0 !mt-2">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    block
                    className="!h-11 !rounded-xl !font-medium !text-sm !bg-gradient-to-r !from-violet-600 !to-purple-500 !border-0 group"
                    icon={
                      !isLoading && (
                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      )
                    }
                    iconPlacement="end"
                  >
                    {isLoading ? t('home.joinCard.checking') : t('home.joinCard.joinButton')}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-5 text-center text-[#3d3860] text-xs border-t border-[#1a1535]">
          {t('home.footer')}
        </footer>
        {showWaitingRoom&&(
          <WaitingRoom onCancel={handleCancel} onHostJoined={onHostJoined} roomCode={roomCode} userName={userName}/>
        )}
      </div>
    </ConfigProvider>
  );
}