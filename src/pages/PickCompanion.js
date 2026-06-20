import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { globalCss } from '../utils/styles';
import { FEMALE_COMPANIONS, MALE_COMPANIONS } from '../utils/companions';
import { useLanguage } from '../utils/LanguageContext';

export default function PickCompanion({ onCompanionPicked }) {
  const [gender, setGender] = useState('female');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();

  const pool = gender === 'female' ? FEMALE_COMPANIONS : MALE_COMPANIONS;

  const confirm = async () => {
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      await api.saveProfile({
        companionName:   selected.name,
        companionGender: gender,
        companionEmoji:  selected.emoji,
        companionTrait:  selected.trait,
        companionAccent: selected.accent,
      }, selected.name);
      onCompanionPicked(selected, gender);
      navigate('/app');
    } catch (e) {
      console.error('Companion pick failed:', e);
      setError(e.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{globalCss}</style>
      <div className="picker-page">
        <div className="lang-switch" style={{ marginBottom: 24 }}>
          <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
          <button className={`lang-btn${lang === 'es' ? ' active' : ''}`} onClick={() => setLang('es')}>ES</button>
        </div>

        <div className="picker-title">
          {t('picker_title_1')} <em>{t('picker_title_em')}</em>
        </div>
        <p className="picker-sub">{t('picker_sub')}</p>

        {/* Gender tabs */}
        <div className="gender-tabs">
          <button
            className={`gender-tab${gender === 'female' ? ' active-f' : ''}`}
            onClick={() => { setGender('female'); setSelected(null); }}
          >
            {t('picker_female')}
          </button>
          <button
            className={`gender-tab${gender === 'male' ? ' active-m' : ''}`}
            onClick={() => { setGender('male'); setSelected(null); }}
          >
            {t('picker_male')}
          </button>
        </div>

        {/* Companion grid */}
        <div className="picker-grid">
          {pool.map((c, i) => {
            const isSelected = selected?.name === c.name;
            const traitKey = `companion_${c.name.toLowerCase()}`;
            return (
              <div
                key={i}
                className={`picker-card${isSelected ? ' selected' : ''}`}
                style={isSelected ? { borderColor: c.accent, boxShadow: `0 16px 40px ${c.accent}22` } : {}}
                onClick={() => setSelected(c)}
              >
                <span className="picker-emoji">{c.emoji}</span>
                <div className="picker-name">{c.name}</div>
                <div className="picker-trait">{t(traitKey)}</div>
                <span className="picker-check">{isSelected ? '✦' : ''}</span>
              </div>
            );
          })}
        </div>

        {error && (
          <p style={{ color: 'var(--rose)', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</p>
        )}
        <button className="picker-btn" onClick={confirm} disabled={!selected || loading}>
          {loading ? t('picker_loading') : selected ? `${t('picker_start')} ${selected.name} →` : t('picker_select')}
        </button>
      </div>
    </>
  );
}
