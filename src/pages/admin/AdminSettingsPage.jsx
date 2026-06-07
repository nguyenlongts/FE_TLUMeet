import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { US, VN, JP, KR, CN, FR } from 'country-flag-icons/react/3x2'

const LANGUAGES = [
  { code: 'en', Flag: US, native: 'English',     label: 'English' },
  { code: 'vi', Flag: VN, native: 'Tiếng Việt',  label: 'Vietnamese' },
  { code: 'ja', Flag: JP, native: '日本語',        label: 'Japanese' },
  { code: 'ko', Flag: KR, native: '한국어',        label: 'Korean' },
  { code: 'zh', Flag: CN, native: '中文',          label: 'Chinese' },
  { code: 'fr', Flag: FR, native: 'Français',    label: 'French' },
]

const Section = ({ icon: Icon, title, children }) => (
  <div className="rounded-2xl p-5 mb-4 border border-[#2a2245]" style={{ background: '#150f2a' }}>
    <div className="flex items-center gap-2 mb-4">
      <Icon size={14} style={{ color: '#a855f7' }} />
      <span className="text-[11px] tracking-widest font-semibold uppercase" style={{ color: '#5a4d7a' }}>
        {title}
      </span>
    </div>
    {children}
  </div>
)

const AdminSettingsPage = () => {
  const { t, i18n } = useTranslation()
  const [selectedLang, setSelectedLang] = useState(i18n.language?.slice(0, 2) || 'vi')
  const [saved, setSaved] = useState(false)

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
    <div className="max-w-3xl mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <h1 className="mb-8 text-3xl font-bold text-white">{t('admin.settings.title')}</h1>

      <Section icon={Globe} title={t('admin.settings.language.sectionTitle')}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-200">
              {t('admin.settings.language.label')}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#5a4d7a' }}>
              {t('admin.settings.language.desc')}
            </p>
          </div>
          {currentLang && (
            <div className="flex items-center gap-1.5 border rounded-full px-3 py-1"
              style={{ background: 'rgba(168,85,247,.15)', borderColor: 'rgba(168,85,247,.3)' }}>
              <currentLang.Flag className="w-4 h-3 rounded-sm" />
              <span className="text-xs font-medium" style={{ color: '#c084fc' }}>
                {currentLang.native}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map((lang) => {
            const Flag = lang.Flag
            const active = selectedLang === lang.code
            return (
              <button
                key={lang.code}
                onClick={() => handleSelectLang(lang.code)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 ${
                  active
                    ? 'border-violet-500/60 shadow-[0_0_0_1px_rgba(139,92,246,0.25)]'
                    : 'border-[#2a2245] hover:border-violet-500/40'
                }`}
                style={{ background: active ? 'rgba(168,85,247,.15)' : '#0f0a1e' }}>
                <Flag className="w-6 h-4 rounded-sm flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className={`text-sm font-semibold truncate ${active ? 'text-violet-200' : 'text-slate-300'}`}>
                    {lang.native}
                  </span>
                  <span className="text-[10px] truncate" style={{ color: '#5a4d7a' }}>
                    {lang.label}
                  </span>
                </div>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#a855f7' }} />
                )}
              </button>
            )
          })}
        </div>
      </Section>

      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 text-white ${
          saved
            ? 'bg-gradient-to-r from-emerald-600 to-green-500'
            : 'bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 hover:scale-[1.01]'
        }`}>
        {saved ? `✓ ${t('admin.settings.savedButton')}` : t('admin.settings.saveButton')}
      </button>

      {saved && (
        <p className="text-center text-xs text-emerald-400 mt-2 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          {t('admin.settings.savedMessage')}
        </p>
      )}
    </div>
  )
}

export default AdminSettingsPage
