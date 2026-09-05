'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { languageCookie, readLanguage, type Language } from '@/lib/i18n/preference';
import '@/app/language.css';
import { subscribePublicRecords } from '@/services/site-data';
import { contentDictionary, translatedCollections } from '@/lib/i18n/content';

const LanguageContext = createContext<{ language: Language; content: Record<string,string>; openPicker: () => void }>({ language: 'en', content: {}, openPicker: () => {} });
export const useLanguage = () => useContext(LanguageContext);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<Record<string,string>>({});
  useEffect(() => {
    if (language !== 'te') return;
    const collections = new Map<string, Record<string, unknown>[]>();
    const subscriptions = translatedCollections.map(name => subscribePublicRecords(name, rows => {
      collections.set(name, rows);
      setContent(contentDictionary([...collections.values()].flat()));
    }, () => {}, 500));
    return () => subscriptions.forEach(unsubscribe => unsubscribe());
  }, [language]);
  const [required, setRequired] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const check = () => {
      const saved = readLanguage(document.cookie);
      if (saved) { setLanguage(saved); setRequired(false); }
      else { setRequired(true); setOpen(true); }
    };
    check();
    window.addEventListener('focus', check);
    const timer = window.setInterval(check, 60000);
    return () => { window.removeEventListener('focus', check); window.clearInterval(timer); };
  }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) { returnFocus.current = document.activeElement as HTMLElement; element.showModal(); }
    else if (!open && element.open) { element.close(); returnFocus.current?.focus(); }
  }, [open]);
  function choose(next: Language) {
    document.cookie = languageCookie(next);
    setLanguage(next); setRequired(false); setOpen(false);
  }
  return <LanguageContext.Provider value={{ language, content, openPicker: () => setOpen(true) }}>
    {children}
    <dialog ref={dialog} className="language-dialog" aria-labelledby="language-title" onClick={event => { if (event.target === event.currentTarget) setOpen(false); }} onCancel={event => { if (required) event.preventDefault(); else setOpen(false); }}>
      <div className="language-dialog-top"><span className="language-emblem" aria-hidden="true">అ<span>A</span></span><p className="language-brand">RJ TRACTOR TECHS</p></div>
      <h2 id="language-title">Choose your language</h2>
      <p lang="te">మీకు నచ్చిన భాషను ఎంచుకోండి</p>
      <div className="language-options">
        <button type="button" lang="en" onClick={() => choose('en')}><span className="language-letter" aria-hidden="true">A</span><span className="language-choice-copy"><strong>English</strong><span>Continue in English</span></span><span className="language-choice-arrow" aria-hidden="true">↗</span></button>
        <button type="button" lang="te" onClick={() => choose('te')}><span className="language-letter" aria-hidden="true">అ</span><span className="language-choice-copy"><strong>తెలుగు</strong><span>తెలుగులో కొనసాగించండి</span></span><span className="language-choice-arrow" aria-hidden="true">↗</span></button>
      </div>
    </dialog>
  </LanguageContext.Provider>;
}
export function LanguageButton() {
  const { language, openPicker } = useLanguage();
  return <button type="button" className="language-button" onClick={openPicker} aria-haspopup="dialog" aria-label={language === 'te' ? 'భాష మార్చండి' : 'Change language'}><span aria-hidden="true">అ / A</span><span className="language-button-label">{language === 'te' ? 'తెలుగు' : 'English'}</span></button>;
}
