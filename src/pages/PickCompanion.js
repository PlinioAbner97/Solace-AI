import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { globalCss } from '../utils/styles';
import { FEMALE_COMPANIONS, MALE_COMPANIONS } from '../utils/companions';

export default function PickCompanion({ onCompanionPicked }) {
  const [gender, setGender] = useState('female');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const pool = gender === 'female' ? FEMALE_COMPANIONS : MALE_COMPANIONS;

  const confirm = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      // Save companion choice to profile
      await api.saveProfile({
        companionName: selected.name,
        companionGender: gender,
        companionEmoji: selected.emoji,
        companionTrait: selected.trait,
        companionAccent: selected.accent,
      });
      onCompanionPicked(selected, gender);
      navigate('/app');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{globalCss}</style>
      <div className="picker-page">
        <div className="picker-title">
          Choose your <em>companion</em>
        </div>
        <p className="picker-sub">
          This is the friend who will be here for you — every day, every conversation.
          Pick the one whose energy feels right.
        </p>

        {/* Gender tabs */}
        <div className="gender-tabs">
          <button
            className={`gender-tab${gender === 'female' ? ' active-f' : ''}`}
            onClick={() => { setGender('female'); setSelected(null); }}
          >
            ♀ Female Companions
          </button>
          <button
            className={`gender-tab${gender === 'male' ? ' active-m' : ''}`}
            onClick={() => { setGender('male'); setSelected(null); }}
          >
            ♂ Male Companions
          </button>
        </div>

        {/* Companion grid */}
        <div className="picker-grid">
          {pool.map((c, i) => {
            const isSelected = selected?.name === c.name;
            return (
              <div
                key={i}
                className={`picker-card${isSelected ? ' selected' : ''}`}
                style={isSelected ? { borderColor: c.accent, boxShadow: `0 16px 40px ${c.accent}22` } : {}}
                onClick={() => setSelected(c)}
              >
                <span className="picker-emoji">{c.emoji}</span>
                <div className="picker-name">{c.name}</div>
                <div className="picker-trait">{c.trait}</div>
                <span className="picker-check">{isSelected ? '✦' : ''}</span>
              </div>
            );
          })}
        </div>

        <button className="picker-btn" onClick={confirm} disabled={!selected || loading}>
          {loading ? 'Setting up your companion…' : selected ? `Start with ${selected.name} →` : 'Select a companion'}
        </button>
      </div>
    </>
  );
}
