'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


import { useState, type FormEvent } from 'react';
import { PublicShell, useSiteSettings } from '@/components/SiteChrome';
import { PageIntro } from '@/components/PublicPageParts';
import { submitContact } from '@/services/public-content';

export default function Contact() {
  const settings = useSiteSettings();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setSent(false);
    try {
      await submitContact(form);
      setForm({ name: '', email: '', phone: '', message: '' });
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not send your message. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PublicShell>
      <main className="contact-page">
        <PageIntro
          eyebrow="GET IN TOUCH"
          title="Let’s talk tractors."
          description="Have a question, a correction or an idea to share? Send a note to RJ Tractor Techs."
        />
        <section className="contact-grid">
          <article className="contact-intro">
            <LocalizedElement as="p" className="section-kicker">START A CONVERSATION</LocalizedElement>
            <LocalizedElement as="h2">What’s on your mind?</LocalizedElement>
            <LocalizedElement as="p">Tell us a little about what you need. For a question about a specific tractor or article, include the model name or page link so we can understand the context.</LocalizedElement>
            <LocalizedElement as="div" className="contact-reasons">
              {[
                ['Website questions', 'Help finding information or using the research tools.'],
                ['Content and corrections', 'A topic you would like covered, or a detail that needs checking.'],
                ['Business enquiries', 'Partnership, media and general business conversations.'],
              ].map(([title, text]) => (
                <LocalizedElement as="div" key={title}>
                  <LocalizedElement as="h3">{title}</LocalizedElement>
                  <LocalizedElement as="p">{text}</LocalizedElement>
                </LocalizedElement>
              ))}
            </LocalizedElement>
            {(settings.email || settings.phone) && (
              <LocalizedElement as="div" className="contact-direct">
                <LocalizedElement as="h3">Contact details</LocalizedElement>
                {settings.email && <LocalizedElement as="a" href={`mailto:${settings.email}`}>{settings.email}</LocalizedElement>}
                {settings.phone && <LocalizedElement as="a" href={`tel:${settings.phone}`}>{settings.phone}</LocalizedElement>}
              </LocalizedElement>
            )}
            <LocalizedElement as="a" className="text-action" href={settings.youtube || 'https://www.youtube.com/@Rjtractortechs'} target="_blank" rel="noreferrer">
              Find us on YouTube <LocalizedElement as="span">↗</LocalizedElement>
            </LocalizedElement>
          </article>
          <form id="contact-form" className="contact-form" onSubmit={submit}>
            <LocalizedElement as="h2">Send a message</LocalizedElement>
            <LocalizedElement as="p">Fields marked with * are required.</LocalizedElement>
            <LocalizedElement as="label">
              Your name *
              <LocalizedElement as="input"
                name="name"
                autoComplete="name"
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </LocalizedElement>
            <LocalizedElement as="label">
              Email address *
              <LocalizedElement as="input"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </LocalizedElement>
            <LocalizedElement as="label">
              Phone number <LocalizedElement as="span">(optional)</LocalizedElement>
              <LocalizedElement as="input"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </LocalizedElement>
            <LocalizedElement as="label">
              Your message *
              <LocalizedElement as="textarea"
                name="message"
                rows={5}
                required
                placeholder="How can we help?"
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
              />
            </LocalizedElement>
            <LocalizedElement as="small">Please do not include passwords, payment details or sensitive documents.</LocalizedElement>
            {error && <LocalizedElement as="p" className="form-error" role="alert">{error}</LocalizedElement>}
            {sent && <LocalizedElement as="p" className="contact-success" role="status">Your message has been received. Thank you for getting in touch.</LocalizedElement>}
            <LocalizedElement as="button" disabled={busy} className="cta-primary">{busy ? 'Sending…' : 'Send message →'}</LocalizedElement>
            <LocalizedElement as="a" className="contact-privacy" href="/privacy-policy">Read our privacy information</LocalizedElement>
          </form>
        </section>
      </main>
    </PublicShell>
  );
}
