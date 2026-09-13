'use client';

import { useEffect, useRef, useState } from 'react';
import { claimVoucher } from '../lib/claim-client.mjs';

type Claim = { voucherCode: string; savedAt: string; campaign: string };
const original = 'https://go-offscript.vercel.app';
const features = [
  ['↗', 'CV skill extraction', 'Upload a PDF — Nova pulls real skills automatically. Works with any format.', 'powered by AI'],
  ['✦', 'Nova chat', 'A short, personalised convo that builds your career profile — not a generic quiz.', 'adaptive'],
  ['⌁', 'career path matching', 'Swipe cards for AI-generated paths with match rate, skills you have, and gaps to close.', 'swipe to decide'],
  ['◎', 'real opportunities', 'Jobs, projects & events from the live web — filtered to your exact paths.', 'live search'],
  ['☻', 'mentor matching', 'Find real LinkedIn pros and draft personalised cold messages in seconds.', 'real people'],
  ['▤', 'application dashboard', 'Track saved opps, pending & completed apps — with Nova one tap away.', 'stay on track'],
];
const steps = [
  ['01', 'upload your CV', 'Nova pulls your real skills in seconds — no manual tagging, no vibes-only guesswork.', 'step-1-cv.gif?v=af92bfa5'],
  ['02', 'chat with Nova', 'A short convo about values, style & ambitions. Less quiz, more smart bestie energy.', 'step2.gif'],
  ['03', 'get paths + make moves', 'Swipe career paths, then unlock real jobs, events & mentors filtered to what you liked.', 'step3.gif'],
];

function Confetti() {
  return <div className="confetti" aria-hidden="true">{Array.from({ length: 52 }, (_, i) => <i key={i} style={{ '--x': `${(i * 37) % 100}%`, '--delay': `${(i % 9) * .07}s`, '--drift': `${((i * 19) % 240) - 120}px`, '--turn': `${(i % 2 ? 1 : -1) * (250 + i * 17)}deg`, background: ['#ff682c', '#a98bff', '#c8ef76', '#ff8dcc', '#ffd863'][i % 5] } as React.CSSProperties} />)}</div>;
}

export default function Home() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [notice, setNotice] = useState('');
  const [claim, setClaim] = useState<Claim | null>(null);
  const [copied, setCopied] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const locked = useRef(false);

  useEffect(() => {
    // Restore only the pending address, never infer success from browser storage.
    try { const pending = sessionStorage.getItem('gos-bonus-pending'); if (pending) { setEmail(pending); setNotice('Welcome back. Confirm your email to finish reserving your 1 week free trial.'); } } catch {}
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); } }), { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    document.documentElement.classList.add('has-motion');
    return () => { observer.disconnect(); document.documentElement.classList.remove('has-motion'); };
  }, []);

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
    if (status === 'error') {
      errorRef.current?.focus({ preventScroll: true });
      const reduceMotion = motionPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      errorRef.current?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'instant' : 'smooth' });
    }
  }, [status, motionPaused]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    const form = new FormData(event.currentTarget);
    const submitted = email.trim();
    setStatus('loading'); setNotice('Saving your reservation. Please keep this page open until it is confirmed.');
    try { sessionStorage.setItem('gos-bonus-pending', submitted); } catch {}
    try {
      const result = await claimVoucher({ email: submitted, consent, website: String(form.get('website') || '') }, (message: string) => setNotice(message));
      setClaim(result); setStatus('success'); setNotice('');
      try { sessionStorage.removeItem('gos-bonus-pending'); } catch {}
    } catch (error) {
      setStatus('error'); setNotice(error instanceof Error ? error.message : 'We could not confirm your free trial reservation. Please try again.');
    } finally { locked.current = false; }
  }

  async function copyVoucher() {
    if (!claim) return;
    try { await navigator.clipboard.writeText(claim.voucherCode); setCopied(true); }
    catch { setNotice('Select the reservation code above to copy it.'); }
  }

  return <main className={motionPaused ? 'motion-paused' : ''}>
    <a className="skip-link" href="#claim">Skip to reserve your free trial</a>
    <nav className="nav" aria-label="Main navigation">
      <a className="brand" href={original}>go <span>offscript</span><b>✳</b></a>
      <div className="nav-links"><a href="#how-it-works">how it works</a><a href="#features">the good stuff</a></div>
      <a className="nav-cta" href="#claim">get my free trial <span>↗</span></a>
    </nav>

    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> a little thank-you for being early</div>
          <h1 id="hero-title">your next chapter.<br /><span>1 week</span><br /><em>free trial.</em><span className="headline-star" aria-hidden="true">✳</span></h1>
          <p className="intro">Same offscript energy. A whole week to explore.</p>
          <p className="hero-description">Your early-bird perk: 1 week free trial. Leave your email to reserve a week with Go Offscript when the app launches.</p>
          <div className="hero-chips"><span>✦ 1 week free trial</span><span>↗ your own direction</span><span>♡ a thank-you from us</span></div>
          <div className="nova-note"><span className="nova-icon">✦</span><p><strong>bestie, your degree doesn&apos;t define you.</strong><br />let&apos;s find what does. — Nova</p></div>
        </div>

        <div className="claim-wrap" id="claim">
          <span className="bonus-sticker" aria-hidden="true">your first<br /><b>WEEK</b><br />on us ↗</span>
          <div className="ticket">
            <div className="ticket-top"><span>GO OFFSCRIPT FREE TRIAL</span><span>✳</span></div>
            <div className="ticket-offer"><span className="mini-label">YOUR EARLY BIRD OFFER</span><h2>1 week<br /><i>free trial.</i></h2><p>A week to explore your next chapter with Nova.</p><span className="ticket-pill">✦ 1 week free trial</span></div>
            <div className="ticket-divider" aria-hidden="true"><span /><b /><span /></div>
            <div className="ticket-form">
              {status === 'success' && claim ? <div className="success" ref={successRef} tabIndex={-1}>
                <Confetti /><span className="success-check" aria-hidden="true">✓</span><p className="mini-label">YOU&apos;RE IN. THIS ONE&apos;S YOURS.</p><h2>congratulations!</h2><p>Your email is saved and your 1 week free trial is reserved for launch.</p>
                <div className="voucher-code"><small>YOUR RESERVATION CODE</small><code>{claim.voucherCode}</code><button type="button" onClick={copyVoucher}>{copied ? 'copied ✓' : 'copy my code ↗'}</button></div>
                <p className="fine-print">Keep this code and use <strong>{email.trim()}</strong> when you sign up at launch. Trial activation details will be announced when the app opens.</p><p className="fine-print voucher-hint">Forgot your reservation code? No worries. Enter your email again here to see your existing code, or when the app launches, sign up with the email you registered on this page — we&apos;ll fill in your free trial reservation automatically.</p><p role="status" className="status-text">{notice || (copied ? 'Reservation code copied.' : '')}</p>
              </div> : <form onSubmit={submit}>
                <h3>let&apos;s make it yours.</h3><p>Leave your email to reserve your 1 week free trial.</p>
                <label htmlFor="email">Your email</label>
                <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required maxLength={254} placeholder="you@your-next-chapter.com" value={email} onChange={e=>setEmail(e.target.value)} disabled={status==='loading'} aria-describedby="claim-status" />
                {status === 'error' ? <div id="claim-status" className="email-save-alert" role="alert" aria-labelledby="save-error-title" ref={errorRef} tabIndex={-1}>
                  <span className="email-save-alert-icon" aria-hidden="true">!</span>
                  <div><h4 id="save-error-title">Your reservation is not confirmed yet</h4><p>We couldn&apos;t confirm that your email was saved. Your free trial reservation is not complete until you see confirmation.</p><p className="email-save-alert-detail">{notice}</p><p>Your email is still here. You can safely try again.</p><button type="submit" className="email-save-retry">Try again <span aria-hidden="true">↻</span></button></div>
                </div> : <p id="claim-status" role="status" className={`status-text email-save-status ${status === 'loading' ? 'saving' : ''}`}>{status === 'loading' && <span className="spinner" aria-hidden="true" />}{notice}</p>}
                <div className="honeypot" aria-hidden="true"><label htmlFor="website">Leave this empty</label><input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
                <label className="consent"><input name="consent" type="checkbox" required checked={consent} onInvalid={e=>e.currentTarget.setCustomValidity('Please check this box to continue.')} onChange={e=>{ e.currentTarget.setCustomValidity(''); setConsent(e.target.checked); }} disabled={status==='loading'} /><span>Email me my free trial details after the Go Offscript app launches. <a href="#privacy">Privacy details</a></span></label>
                <button className="claim-button" type="submit" disabled={status==='loading'}>{status==='loading' ? <><span className="spinner" /> reserving your free trial…</> : <>reserve my free trial <span>↗</span></>}</button>
                <p className="fine-print centered">Already reserved? Submit again to retrieve your code.<br />One free trial per email. No payment required to reserve.</p><p className="fine-print centered voucher-hint">Forgot your reservation code? No worries. Enter your email again here to see your existing code, or when the app launches, sign up with the email you registered on this page — we&apos;ll fill in your free trial reservation automatically.</p>
              </form>}
            </div>
            <div className="ticket-bottom"><span>YOUR FUTURE ISN&apos;T ONE-SIZE-FITS-ALL.</span><div className="barcode" aria-hidden="true" /></div>
          </div>
          <p className="offer-note">Reserve your 1 week free trial for launch.<br />Activation details will be announced when the app opens.</p>
        </div>
      </div>
      <div className="hero-foot"><span>BIG POSSIBILITIES. ZERO DEFAULT SCRIPT.</span><a href="#how-it-works">meet your next chapter ↓</a></div>
    </section>

    <div className="marquee" aria-hidden="true"><div>{Array.from({length:4},(_,i)=><span key={i}>less &quot;what now?&quot; <b>✳</b> more &quot;why not?&quot; <b>✳</b> go offscript <b>✳</b> </span>)}</div></div>

    <section className="how section" id="how-it-works">
      <div className="section-heading reveal"><p className="eyebrow">THE SAME NOVA. YOUR OWN POSSIBILITIES.</p><h2>three steps<br />to <em>&quot;that&apos;s so me.&quot;</em></h2><p>From zero to a concrete plan in under 10 minutes.</p></div>
      <div className="steps">{steps.map(([number,title,description,media],i)=><article className={`step reveal step-${i}`} key={number}><div className="step-heading"><span>{number}</span><span aria-hidden="true">↗</span></div><h3>{title}</h3><p>{description}</p><div className="step-media"><img src={`/how-it-works/${media}`} alt={`Go Offscript app: ${title}`} loading="lazy" width="400" height="866" /></div></article>)}</div>
    </section>

    <section className="features-section" id="features"><div className="section">
      <div className="section-heading reveal"><p className="eyebrow">ALL THE GOOD STUFF</p><h2>a career that fits you.<br /><em>not the other way round.</em></h2><p>From CV to career path to first conversation — Nova handles the heavy lifting.</p></div>
      <div className="features">{features.map(([icon,title,description,tag],i)=><article className={`feature reveal color-${i%3}`} key={title}><div className="feature-top"><span className="feature-icon" aria-hidden="true">{icon}</span><span className="feature-tag">{tag}</span></div><h3>{title}</h3><p>{description}</p></article>)}</div>
    </div></section>

    <section className="final-cta section reveal"><span className="final-star" aria-hidden="true">✳</span><p className="eyebrow">YOUR FIRST WEEK STARTS HERE.</p><h2>your next chapter.<br /><em>1 week free trial.</em></h2><p>One week to explore. Your own way to go offscript.</p><a href="#claim" className="dark-button">reserve my free trial ↗</a></section>
    <section className="privacy-note section" id="privacy"><h2>your email, thoughtfully handled.</h2><p>We save your email, reservation code, consent and reservation time to reserve your 1 week free trial and email your trial details after the app launches. Your reservation is linked to this email; keep access to it for activation. A pending email stays in this browser tab only until your claim succeeds or the tab closes. To request deletion or stop updates, visit <a href={`${original}/support`}>support</a>. See our <a href={`${original}/privacy`}>Privacy Policy</a> and <a href={`${original}/terms`}>Terms</a>.</p></section>
    <footer className="footer"><a className="brand" href={original}>go <span>offscript</span><b>✳</b></a><p>your life. your script.</p><div><button type="button" onClick={()=>setMotionPaused(!motionPaused)}>{motionPaused ? 'play animations' : 'pause animations'}</button><a href={`${original}/support`}>say hello ↗</a></div></footer>
  </main>;
}
