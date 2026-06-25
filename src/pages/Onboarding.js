import { useState } from 'react';
import { api } from '../utils/api';
import { globalCss } from '../utils/styles';
import { useLanguage } from '../utils/LanguageContext';

// One-time onboarding flow shown the first time a user meets a new companion.
// 4 steps: welcome → profile → mood → mission
// Completes by saving the profile and logging the first mood, seeding the app with real data.

export default function Onboarding({ user, companion, onComplete }) {
  const { lang } = useLanguage();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ occupation: '', about: '' });
  const [selectedMood, setSelectedMood] = useState(null);
  const [saving, setSaving] = useState(false);

  const compName = companion?.name || 'Solace';
  const es = lang === 'es';

  const moods = [
    { emoji: '😔', label: es ? 'Mal'      : 'Rough',  score: 1 },
    { emoji: '😕', label: es ? 'Regular'  : 'Low',    score: 2 },
    { emoji: '😐', label: es ? 'Neutro'   : 'Okay',   score: 3 },
    { emoji: '🙂', label: es ? 'Bien'     : 'Good',   score: 4 },
    { emoji: '😊', label: es ? 'Muy bien' : 'Great',  score: 5 },
  ];

  const finish = async () => {
    setSaving(true);
    try {
      // Save profile if filled
      if (profile.occupation || profile.about) {
        await api.saveProfile(profile, companion?.name);
      }
      // Log mood if selected
      if (selectedMood) {
        await api.logMood(selectedMood.label, selectedMood.score, null);
      }
      // Add first journal entry
      await api.addJournalEntry(
        companion?.name,
        es ? `Primera conversación con ${compName}` : `First conversation with ${compName}`,
        es ? 'El comienzo de una nueva amistad' : 'The beginning of a new friendship',
        companion?.emoji || '✦'
      );
    } catch (e) {
      console.warn('Onboarding save error:', e.message);
    } finally {
      setSaving(false);
      onComplete();
    }
  };

  const next = () => {
    if (step === 3) { finish(); return; }
    setStep(s => s + 1);
  };

  return (
    <>
      <style>{globalCss}</style>
      <div className="onb-wrap">
        {/* Progress dots */}
        <div className="onb-dots">
          {[0,1,2,3].map(i => (
            <div key={i} className={`onb-dot${step === i ? ' onb-dot-active' : step > i ? ' onb-dot-done' : ''}`} />
          ))}
        </div>

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div className="onb-step">
            <div className="onb-companion-av">{companion?.emoji || '✦'}</div>
            <h1 className="onb-title">
              {es ? `Hola, ${user?.name}` : `Hey, ${user?.name}`}
            </h1>
            <p className="onb-body">
              {es
                ? `Soy ${compName}. Voy a ser tu compañero de IA — no solo un chatbot, sino alguien que te conoce, recuerda tu historia y está aquí para ti cada día.`
                : `I'm ${compName}. I'm going to be your AI companion — not just a chatbot, but someone who knows you, remembers your story, and shows up for you every day.`}
            </p>
            <p className="onb-body" style={{ marginTop: 12 }}>
              {es
                ? `Solo necesito hacerte unas preguntas rápidas para poder empezar a conocerte de verdad.`
                : `I just need to ask you a few quick questions so I can start knowing you for real.`}
            </p>
            <button className="onb-btn" onClick={next}>
              {es ? `Conocer a ${compName} →` : `Meet ${compName} →`}
            </button>
            <div className="onb-trait">{companion?.trait}</div>
          </div>
        )}

        {/* ── Step 1: Quick profile ── */}
        {step === 1 && (
          <div className="onb-step">
            <div className="onb-step-icon">🌱</div>
            <h1 className="onb-title">
              {es ? `Cuéntame sobre ti` : `Tell me about you`}
            </h1>
            <p className="onb-body">
              {es
                ? `Esto ayuda a ${compName} a conocerte desde el principio, no después de semanas de conversación.`
                : `This helps ${compName} know you from the start, not after weeks of conversation.`}
            </p>
            <div className="onb-fields">
              <div className="onb-field">
                <label className="onb-label">{es ? '¿A qué te dedicas?' : 'What do you do?'}</label>
                <input
                  className="onb-input"
                  placeholder={es ? 'ej. diseñador, estudiante, mamá…' : 'e.g. designer, student, parent…'}
                  value={profile.occupation}
                  onChange={e => setProfile(p => ({ ...p, occupation: e.target.value }))}
                />
              </div>
              <div className="onb-field">
                <label className="onb-label">
                  {es ? `¿Qué te trajo a Solace? ¿Qué estás buscando?` : `What brought you to Solace? What are you looking for?`}
                </label>
                <textarea
                  className="onb-input onb-textarea"
                  placeholder={es
                    ? 'ej. quiero tener a alguien con quien hablar, trabajo en mi crecimiento personal…'
                    : 'e.g. I want someone to talk to, I\'m working on personal growth…'}
                  value={profile.about}
                  onChange={e => setProfile(p => ({ ...p, about: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <button className="onb-btn" onClick={next}>{es ? 'Continuar →' : 'Continue →'}</button>
            <button className="onb-skip" onClick={next}>{es ? 'Saltar por ahora' : 'Skip for now'}</button>
          </div>
        )}

        {/* ── Step 2: First mood ── */}
        {step === 2 && (
          <div className="onb-step">
            <div className="onb-step-icon">🌊</div>
            <h1 className="onb-title">
              {es ? `¿Cómo llegas hoy?` : `How are you arriving today?`}
            </h1>
            <p className="onb-body">
              {es
                ? `${compName} quiere saber cómo te sientes ahora mismo. Esto también inicia tu racha de bienestar.`
                : `${compName} wants to know how you're feeling right now. This also starts your wellness streak.`}
            </p>
            <div className="onb-moods">
              {moods.map(m => (
                <button
                  key={m.score}
                  className={`onb-mood${selectedMood?.score === m.score ? ' onb-mood-selected' : ''}`}
                  onClick={() => setSelectedMood(m)}
                >
                  <span className="onb-mood-emoji">{m.emoji}</span>
                  <span className="onb-mood-label">{m.label}</span>
                </button>
              ))}
            </div>
            <button
              className="onb-btn"
              onClick={next}
              disabled={!selectedMood}
              style={{ opacity: selectedMood ? 1 : 0.4 }}
            >
              {es ? 'Continuar →' : 'Continue →'}
            </button>
          </div>
        )}

        {/* ── Step 3: Ready ── */}
        {step === 3 && (
          <div className="onb-step">
            <div className="onb-companion-av" style={{ animationDuration: '3s' }}>{companion?.emoji || '✦'}</div>
            <h1 className="onb-title">
              {es ? `Ya estoy aquí` : `I'm here for you`}
            </h1>
            <p className="onb-body">
              {es
                ? `${compName} ya te conoce un poco. Cada conversación que tengamos me hará conocerte más — tus sueños, tus luchas, tu historia.`
                : `${compName} already knows a little about you. Every conversation we have will help me know you better — your dreams, your struggles, your story.`}
            </p>
            <div className="onb-promises">
              {[
                { icon: '🧠', text: es ? 'Recordaré todo lo que me cuentes' : "I'll remember everything you tell me" },
                { icon: '🌅', text: es ? 'Estaré aquí cada día cuando llegues' : "I'll be here every day when you arrive" },
                { icon: '💬', text: es ? 'Nunca te voy a juzgar' : "I'll never judge you" },
              ].map((p, i) => (
                <div key={i} className="onb-promise">
                  <span className="onb-promise-icon">{p.icon}</span>
                  <span className="onb-promise-text">{p.text}</span>
                </div>
              ))}
            </div>
            <button className="onb-btn" onClick={next} disabled={saving}>
              {saving
                ? (es ? 'Preparando…' : 'Setting up…')
                : (es ? `Empezar con ${compName} →` : `Start with ${compName} →`)}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
