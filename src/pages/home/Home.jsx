import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, ConfigProvider, theme } from "antd";
import { Video, LogIn, UserPlus, ArrowRight } from "lucide-react";
import { useCheckRoomCodeQuery, useJoinMeetingMutation, useLazyCheckRoomCodeQuery } from "../../redux/features/meetings/meetingsApi";
import WaitingRoom from "../meetings/WaitingRoom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";


export default function Home() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
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
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: isDark ? "#7c3aed" : "#0284c7",
          borderRadius: 12,
          fontSize: 14,
          controlHeight: 44,
        },
        components: {
          Input: {
            activeBorderColor: isDark ? "#7c3aed" : "#0284c7",
            paddingInline: 16,
          },
          Form: {
            labelFontSize: 11,
          },
        },
      }}
    >
      <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans">
        {/* Header */}
        <header className="w-full">
          <div className="flex items-center justify-between px-6 py-5 mx-auto max-w-7xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-br from-[var(--accent)] to-[var(--accent)] rounded-xl">
                <Video className="w-6 h-6 text-[var(--content)]" />
              </div>
              <span className="text-xl font-semibold text-[var(--content)]">TLU Meeting</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--muted)] border border-[var(--line)] rounded-xl hover:bg-[var(--surface)] hover:text-[var(--content)] transition-colors"
              >
                <LogIn size={15} />
                <span className="hidden sm:inline">{t('home.header.signIn')}</span>
              </button>
              <button
                onClick={() => navigate("/register")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--content)] transition-opacity bg-gradient-to-r from-[var(--accent)] to-[var(--accent)] rounded-xl hover:opacity-90"
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
              <h1 className="mb-4 text-5xl font-bold leading-tight text-[var(--content)] md:text-6xl">
                {t('home.hero.title1')}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-fg)] to-pink-400">
                  {t('home.hero.title2')}
                </span>
              </h1>
              <p className="text-lg text-[var(--faint)] max-w-2xl mx-auto">
                {t('home.hero.subtitle')}
              </p>
            </div>

            {/* Card */}
            <div className="w-full max-w-xl bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-center text-[var(--content)] mb-7">
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
                    <span className="text-[11px] tracking-widest text-[var(--faint)] font-medium">
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
                    <span className="text-[11px] tracking-widest text-[var(--faint)] font-medium">
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
                    className="!h-11 !rounded-xl !font-medium !text-sm !bg-gradient-to-r !from-[var(--accent)] !to-[var(--accent)] !border-0 group"
                    icon={
                      !isLoading && (
                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      )
                    }
                    iconPosition="end"
                  >
                    {isLoading ? t('home.joinCard.checking') : t('home.joinCard.joinButton')}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-5 text-center text-[var(--line)] text-xs border-t border-[var(--surface)]">
          {t('home.footer')}
        </footer>
        {showWaitingRoom&&(
          <WaitingRoom onCancel={handleCancel} onHostJoined={onHostJoined} roomCode={roomCode} userName={userName}/>
        )}
      </div>
    </ConfigProvider>
  );
}