import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell, Video, Mic, Globe, Moon, Shield, ChevronRight, KeyRound } from 'lucide-react'
import {
  US,
  VN,
  JP,
  KR,
  CN,
  FR,
} from "country-flag-icons/react/3x2";
// const LANGUAGES = [
//   { code: 'en', flag: '🇺🇸', native: 'English', label: 'English' },
//   { code: 'vi', flag: '🇻🇳', native: 'Tiếng Việt', label: 'Vietnamese' },
//   { code: 'ja', flag: '🇯🇵', native: '日本語', label: 'Japanese' },
//   { code: 'ko', flag: '🇰🇷', native: '한국어', label: 'Korean' },
//   { code: 'zh', flag: '🇨🇳', native: '中文', label: 'Chinese' },
//   { code: 'fr', flag: '🇫🇷', native: 'Français', label: 'French' },
// ]
const LANGUAGES = [
  {
    code: "en",
    Flag: US,
    native: "English",
    label: "English",
  },
  {
    code: "vi",
    Flag: VN,
    native: "Tiếng Việt",
    label: "Vietnamese",
  },
  {
    code: "ja",
    Flag: JP,
    native: "日本語",
    label: "Japanese",
  },
  {
    code: "ko",
    Flag: KR,
    native: "한국어",
    label: "Korean",
  },
  {
    code: "zh",
    Flag: CN,
    native: "中文",
    label: "Chinese",
  },
  {
    code: "fr",
    Flag: FR,
    native: "Français",
    label: "French",
  },
];

// ─── Toggle ───────────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full border transition-all duration-200 flex-shrink-0 ${
      checked
        ? 'bg-gradient-to-r from-violet-600 to-purple-500 border-transparent'
        : 'bg-[#1e2139] border-purple-900/40'
    }`}
  >
    <span
      className={`absolute top-[3px] w-[18px] h-[18px] rounded-full transition-all duration-200 shadow-sm ${
        checked ? 'left-[22px] bg-white' : 'left-[3px] bg-[#3d3d5c]'
      }`}
    />
  </button>
)

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-[#13162a] border border-purple-900/20 rounded-2xl p-5 mb-4">
    <div className="flex items-center gap-2 mb-4">
      <Icon size={14} className="text-purple-400" />
      <span className="text-[11px] tracking-widest font-semibold text-[#5a5478] uppercase">
        {title}
      </span>
    </div>
    {children}
  </div>
)

// ─── Setting row ─────────────────────────────────────────────────────────────
const SettingRow = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
    <div>
      <p className="text-sm font-medium text-slate-200">{label}</p>
      {desc && <p className="text-xs text-[#5a5478] mt-0.5">{desc}</p>}
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
)

// ─── Settings ────────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [selectedLang, setSelectedLang] = useState(i18n.language?.slice(0, 2) || 'en')
  const [saved, setSaved] = useState(false)

  const [notifications, setNotifications] = useState({
    reminder: true,
    email: false,
    sound: true,
  })
  const [video, setVideo] = useState({
    camera: true,
    mic: false,
  })
  const [appearance, setAppearance] = useState({
    darkMode: true,
  })

  const handleSelectLang = (code) => {
    setSelectedLang(code)
    i18n.changeLanguage(code)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const currentLang = LANGUAGES.find((l) => l.code === selectedLang)

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 mx-auto max-w-3xl">

        <h1 className="mb-8 text-3xl font-bold text-white">{t('settings.title', 'Settings')}</h1>

        {/* Language */}
        <Section icon={Globe} title={t('settings.language.sectionTitle', 'Language')}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-200">
                {t('settings.language.label', 'Display Language')}
              </p>
              <p className="text-xs text-[#5a5478] mt-0.5">
                {t('settings.language.desc', 'Change the interface language')}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-900/20 border border-purple-500/30 rounded-full px-3 py-1">
              <span className="text-sm">{currentLang?.flag}</span>
              <span className="text-xs font-medium text-purple-300">{currentLang?.native}</span>
            </div>
          </div>

          {/* <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => {(
                const Flag = lang.Flag;
                return(
              <button
                key={lang.code}
                onClick={() => handleSelectLang(lang.code)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 ${
                  selectedLang === lang.code
                    ? 'border-purple-500/60 bg-purple-900/25 shadow-[0_0_0_1px_rgba(139,92,246,0.25)]'
                    : 'border-purple-900/20 bg-[#0d0f1c] hover:border-purple-500/40 hover:bg-purple-900/10'
                }`}
              >
                <span className="text-lg leading-none">{lang.flag}</span>
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-sm font-semibold truncate ${
                      selectedLang === lang.code ? 'text-purple-200' : 'text-slate-300'
                    }`}
                  >
                    {lang.native}
                  </span>
                  <span className="text-[10px] text-[#5a5478] truncate">{lang.label}</span>
                </div>
                {selectedLang === lang.code && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                )}
              </button>
            )))}}
          </div> */}
        <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => {
                const Flag = lang.Flag;

                return (
                    <button
                        key={lang.code}
                        onClick={() => handleSelectLang(lang.code)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 ${
                        selectedLang === lang.code
                            ? "border-purple-500/60 bg-purple-900/25 shadow-[0_0_0_1px_rgba(139,92,246,0.25)]"
                            : "border-purple-900/20 bg-[#0d0f1c] hover:border-purple-500/40 hover:bg-purple-900/10"
                        }`}
                    >
                    <Flag className="w-6 h-4 rounded-sm flex-shrink-0" />

                    <div className="flex flex-col min-w-0">
                    <span
                        className={`text-sm font-semibold truncate ${
                        selectedLang === lang.code
                            ? "text-purple-200"
                            : "text-slate-300"
                        }`}
                    >
                        {lang.native}
                    </span>

                    <span className="text-[10px] text-[#5a5478] truncate">
                        {lang.label}
                    </span>
        </div>

                {selectedLang === lang.code && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                )}
            </button>
            );
            })}
        </div>
    </Section>

        {/* Notifications */}
        <Section icon={Bell} title={t('settings.notifications.sectionTitle', 'Notifications')}>
          <SettingRow
            label={t('settings.notifications.reminder', 'Meeting reminders')}
            desc={t('settings.notifications.reminderDesc', 'Notify before meetings start')}
            checked={notifications.reminder}
            onChange={(v) => setNotifications((p) => ({ ...p, reminder: v }))}
          />
          <SettingRow
            label={t('settings.notifications.email', 'Email notifications')}
            desc={t('settings.notifications.emailDesc', 'Send recap to your inbox')}
            checked={notifications.email}
            onChange={(v) => setNotifications((p) => ({ ...p, email: v }))}
          />
          <SettingRow
            label={t('settings.notifications.sound', 'Sound alerts')}
            desc={t('settings.notifications.soundDesc', 'Play audio when host joins')}
            checked={notifications.sound}
            onChange={(v) => setNotifications((p) => ({ ...p, sound: v }))}
          />
        </Section>

        {/* Video & Audio */}
        <Section icon={Video} title={t('settings.video.sectionTitle', 'Video & Audio')}>
          <SettingRow
            label={t('settings.video.camera', 'Camera on by default')}
            desc={t('settings.video.cameraDesc', 'Enable camera when joining')}
            checked={video.camera}
            onChange={(v) => setVideo((p) => ({ ...p, camera: v }))}
          />
          <SettingRow
            label={t('settings.video.mic', 'Mic on by default')}
            desc={t('settings.video.micDesc', 'Unmute microphone on join')}
            checked={video.mic}
            onChange={(v) => setVideo((p) => ({ ...p, mic: v }))}
          />
        </Section>

        {/* Appearance */}
        <Section icon={Moon} title={t('settings.appearance.sectionTitle', 'Appearance')}>
          <SettingRow
            label={t('settings.appearance.darkMode', 'Dark mode')}
            desc={t('settings.appearance.darkModeDesc', 'Use dark theme across the app')}
            checked={appearance.darkMode}
            onChange={(v) => setAppearance((p) => ({ ...p, darkMode: v }))}
          />
        </Section>

        {/* Security */}
        <Section icon={Shield} title={t('settingsSecurity.sectionTitle')}>
          <button
            onClick={() => navigate('/change-password')}
            className="flex items-center justify-between w-full py-3 border-b border-white/5 last:border-0 text-left hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(168,85,247,.15)' }}>
                <KeyRound size={15} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {t('settingsSecurity.changePassword')}
                </p>
                <p className="text-xs text-[#5a5478] mt-0.5">
                  {t('settingsSecurity.changePasswordDesc')}
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-500" />
          </button>
        </Section>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
            saved
              ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white'
              : 'bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 text-white hover:scale-[1.01]'
          }`}
        >
          {saved
            ? `✓ ${t('settings.savedButton', 'Saved!')}`
            : t('settings.saveButton', 'Save Changes')}
        </button>

        {saved && (
          <p className="text-center text-xs text-emerald-400 mt-2 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            {t('settings.savedMessage', 'Your preferences have been updated')}
          </p>
        )}
      </div>
    </div>
  )
}

export default SettingsPage