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
  const locked = useRef(false);

  useEffect(() => {
    // Restore only the pending address, never infer success from browser storage.
    try { const pending = sessionStorage.getItem('gos-bonus-pending'); if (pending) { setEmail(pending); setNotice('Welcome back. Confirm your email to finish claiming your voucher.'); } } catch {}
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); } }), { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    document.documentElement.classList.add('has-motion');
    return () => { observer.disconnect(); document.documentElement.classList.remove('has-motion'); };
  }, []);

  useEffect(() => { if (status === 'success') successRef.current?.focus(); }, [status]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    const form = new FormData(event.currentTarget);
    const submitted = email.trim();
    setStatus('loading'); setNotice('Saving your spot…');
    try { sessionStorage.setItem('gos-bonus-pending', submitted); } catch {}
    try {
      const result = await claimVoucher({ email: submitted, consent, website: String(form.get('website') || '') }, (message: string) => setNotice(message));
      setClaim(result); setStatus('success'); setNotice('');
      try { sessionStorage.removeItem('gos-bonus-pending'); } catch {}
    } catch (error) {
      setStatus('error'); setNotice(error instanceof Error ? error.message : 'We could not confirm your voucher. Please try again.');
    } finally { locked.current = false; }
  }

  async function copyVoucher() {
    if (!claim) return;
    try { await navigator.clipboard.writeText(claim.voucherCode); setCopied(true); }
    catch { setNotice('Select the voucher code above to copy it.'); }
  }

  return <main className={motionPaused ? 'motion-paused' : ''}>
    <a className="skip-link" href="#claim">Skip to claim your voucher</a>
    <nav className="nav" aria-label="Main navigation">
      <a className="brand" href={original}>go <span>offscript</span><b>✳</b></a>
      <div className="nav-links"><a href="#how-it-works">how it works</a><a href="#features">the good stuff</a></div>
      <a className="nav-cta" href="#claim">get my bonus <span>↗</span></a>
    </nav>

    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> a little thank-you for being early</div>
          <h1 id="hero-title">your next chapter.<br /><span>now with</span><br /><em>a little extra.</em><span className="headline-star" aria-hidden="true">✳</span></h1>
          <p className="intro">Same offscript energy. An extra perk for you.</p>
          <p className="hero-description">Already joined our waitlist? Your early-bird perks just got sweeter. Confirm your email to claim an extra tokens voucher for when Go Offscript opens.</p>
          <div className="hero-chips"><span>✦ more possibilities</span><span>↗ your own direction</span><span>♡ a thank-you from us</span></div>
          <div className="nova-note"><span className="nova-icon">✦</span><p><strong>bestie, your degree doesn&apos;t define you.</strong><br />let&apos;s find what does. — Nova</p></div>
        </div>

        <div className="claim-wrap" id="claim">
          <span className="bonus-sticker" aria-hidden="true">a little<br /><b>EXTRA</b><br />for you ↗</span>
          <div className="ticket">
            <div className="ticket-top"><span>GO OFFSCRIPT PERKS</span><span>✳</span></div>
            <div className="ticket-offer"><span className="mini-label">THE EARLY BIRD BONUS</span><h2>extra tokens.<br /><i>extra possibilities.</i></h2><p>Your next move comes with a little more room to explore.</p><span className="ticket-pill">✦ your extra tokens voucher</span></div>
            <div className="ticket-divider" aria-hidden="true"><span /><b /><span /></div>
            <div className="ticket-form">
              {status === 'success' && claim ? <div className="success" ref={successRef} tabIndex={-1}>
                <Confetti /><span className="success-check" aria-hidden="true">✓</span><p className="mini-label">YOU&apos;RE IN. THIS ONE&apos;S YOURS.</p><h2>congratulations!</h2><p>Your email is saved and your extra tokens voucher is reserved.</p>
                <div className="voucher-code"><small>YOUR VOUCHER CODE</small><code>{claim.voucherCode}</code><button type="button" onClick={copyVoucher}>{copied ? 'copied ✓' : 'copy my code ↗'}</button></div>
                <p className="fine-print">Keep this code. We&apos;ll contact you at <strong>{email.trim()}</strong> with the token amount and redemption details when access opens.</p><p role="status" className="status-text">{notice || (copied ? 'Voucher code copied.' : '')}</p>
              </div> : <form onSubmit={submit}>
                <h3>let&apos;s make it yours.</h3><p>Use the email you joined the waitlist with.</p>
                <label htmlFor="email">Your email</label>
                <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required maxLength={254} placeholder="you@your-next-chapter.com" value={email} onChange={e=>setEmail(e.target.value)} disabled={status==='loading'} aria-describedby="claim-status" />
                <div className="honeypot" aria-hidden="true"><label htmlFor="website">Leave this empty</label><input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
                <label className="consent"><input name="consent" type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)} disabled={status==='loading'} /><span>Email me my voucher details and Go Offscript early-access updates. <a href="#privacy">Privacy details</a></span></label>
                <button className="claim-button" type="submit" disabled={status==='loading'}>{status==='loading' ? <><span className="spinner" /> securing your bonus…</> : <>claim my extra tokens <span>↗</span></>}</button>
                <p id="claim-status" role={status==='error'?'alert':'status'} className={`status-text ${status==='error'?'error':''}`}>{notice}</p>
                <p className="fine-print centered">Already confirmed? Submit again to retrieve your voucher.<br />One voucher per email. No payment required.</p>
              </form>}
            </div>
            <div className="ticket-bottom"><span>YOUR FUTURE ISN&apos;T ONE-SIZE-FITS-ALL.</span><div className="barcode" aria-hidden="true" /></div>
          </div>
          <p className="offer-note">Extra tokens are in addition to your original early-access offer.<br />Amount and redemption details will be announced at launch.</p>
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

    <section className="final-cta section reveal"><span className="final-star" aria-hidden="true">✳</span><p className="eyebrow">YOU WERE EARLY. WE NOTICED.</p><h2>your future called.<br /><em>there&apos;s a bonus.</em></h2><p>More room to explore. More ways to go offscript.</p><a href="#claim" className="dark-button">claim my extra tokens ↗</a></section>
    <section className="privacy-note section" id="privacy"><h2>your email, thoughtfully handled.</h2><p>We save your email, voucher code, consent and claim time to reserve your bonus and send early-access updates. Your voucher is linked to this email; keep access to it for redemption. A pending email stays in this browser tab only until your claim succeeds or the tab closes. To request deletion or stop updates, visit <a href={`${original}/support`}>support</a>. See our <a href={`${original}/privacy`}>Privacy Policy</a> and <a href={`${original}/terms`}>Terms</a>.</p></section>
    <footer className="footer"><a className="brand" href={original}>go <span>offscript</span><b>✳</b></a><p>your life. your script.</p><div><button type="button" onClick={()=>setMotionPaused(!motionPaused)}>{motionPaused ? 'play animations' : 'pause animations'}</button><a href={`${original}/support`}>say hello ↗</a></div></footer>
  </main>;
}
