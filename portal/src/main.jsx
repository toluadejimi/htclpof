import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard, FileText, CreditCard, UserRound, LifeBuoy, LogOut, Menu,
  CheckCircle2, Clock3, Upload, ChevronRight, ShieldCheck, Search,
  Users, Settings, BarChart3, Bell, Pencil, Globe2,
  FileCheck2, ChevronDown, AlertCircle
} from 'lucide-react';
import './styles.css';
import { api } from './api.js';
import { AuthProvider, useAuth, initials } from './auth-context.jsx';

const STEP_TITLES = ['Personal info', 'Application Details', 'Documents', 'Review & Pay'];
const PURPOSES = ['Study Abroad', 'Immigration', 'Business', 'Travel', 'Medical'];
const STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  needs_information: 'Needs Information',
  processing: 'Processing',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed'
};

function Logo({ small }) {
  return <div className={small ? 'logo sm' : 'logo'}>H</div>;
}

function Brand({ light }) {
  return (
    <div className="brand" style={light ? { color: '#fff' } : undefined}>
      <Logo />
      <div>
        <strong>Highlight Consulting</strong>
        <span style={light ? { color: '#9eb0c8' } : undefined}>Services Limited</span>
      </div>
    </div>
  );
}

function Status({ children }) {
  const label = STATUS_LABELS[children] || children;
  const cls = label.toLowerCase().replaceAll(' ', '-');
  return <span className={'status ' + cls}><i /> {label}</span>;
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return <div className="form-error"><AlertCircle size={16} /><span>{message}</span></div>;
}

function EmptyState({ text }) {
  return <div className="empty-state">{text}</div>;
}

function Field({ label, value, placeholder, wide, textarea, type = 'text', onChange, options, required }) {
  return (
    <label className={wide ? 'field wide' : 'field'}>
      <span>{label}</span>
      {textarea ? (
        <textarea placeholder={placeholder} value={value ?? ''} onChange={onChange} required={required} />
      ) : options ? (
        <select value={value || ''} onChange={onChange} required={required}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value ?? ''} placeholder={placeholder} onChange={onChange} required={required} />
      )}
    </label>
  );
}

function PublicHeader({ page, setPage }) {
  const [open, setOpen] = useState(false);
  const links = [['home', 'Home'], ['about', 'About'], ['services', 'Services'], ['faq', 'FAQ'], ['contact', 'Contact']];
  return (
    <header className="public-header">
      <button onClick={() => setPage('home')}><Brand /></button>
      <nav>
        {links.map(([id, label]) => (
          <button key={id} className={page === id ? 'active' : ''} onClick={() => setPage(id)}>{label}</button>
        ))}
      </nav>
      <div className="header-actions">
        <button className="btn link" onClick={() => setPage('login')}>Login</button>
        <button className="btn primary" onClick={() => setPage('signup')}>Apply Now</button>
        <button className="menu-btn" onClick={() => setOpen(!open)}><Menu size={20} /></button>
      </div>
    </header>
  );
}

function Footer({ setPage }) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <Brand light />
          <p>Secure Proof of Funds applications for study, travel, immigration, and business.</p>
        </div>
        <div>
          <h4>Company</h4>
          <button onClick={() => setPage('about')}>About</button>
          <button onClick={() => setPage('services')}>Services</button>
          <button onClick={() => setPage('contact')}>Contact</button>
        </div>
        <div>
          <h4>Portal</h4>
          <button onClick={() => setPage('signup')}>Create account</button>
          <button onClick={() => setPage('login')}>Customer login</button>
          <button onClick={() => setPage('verify')}>Verify a document</button>
        </div>
        <div>
          <h4>Support</h4>
          <button onClick={() => setPage('faq')}>FAQ</button>
          <button onClick={() => setPage('login')}>Admin access</button>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Highlight Consulting Services Limited</span>
      </div>
    </footer>
  );
}

function PublicShell({ page, setPage, children }) {
  return <>
    <PublicHeader page={page} setPage={setPage} />
    {children}
    <Footer setPage={setPage} />
  </>;
}

function Home({ setPage }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>Your Trusted Partner for Proof of Funds</h1>
          <p>Fast. Secure. Reliable. Apply for your Proof of Funds with confidence and track your application every step of the way.</p>
          <div className="hero-actions">
            <button className="btn primary" onClick={() => setPage('signup')}>Apply Now</button>
            <button className="btn ghost" onClick={() => setPage('about')}>Learn More</button>
          </div>
        </div>
        <div className="hero-media">
          <img src="images/hero-building.png" alt="Glass office tower at twilight" />
          <div className="hero-cards">
            <div className="glass-card"><div className="icon"><ShieldCheck size={18} /></div><div><b>Secure Application</b><span>Your information is protected</span></div></div>
            <div className="glass-card"><div className="icon"><Clock3 size={18} /></div><div><b>Track in Real Time</b><span>Get updates at every stage</span></div></div>
            <div className="glass-card"><div className="icon"><LifeBuoy size={18} /></div><div><b>Expert Support</b><span>We're here to help</span></div></div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <h2>How the portal works</h2>
          <p>A single secure path from application to verified documentation.</p>
        </div>
        <div className="steps-grid">
          <div className="step-card"><div className="step-num">1</div><h3>Create your account</h3><p>Join the portal and start a Proof of Funds request in minutes.</p></div>
          <div className="step-card"><div className="step-num">2</div><h3>Submit documents</h3><p>Upload identification, address proof, and supporting files securely.</p></div>
          <div className="step-card"><div className="step-num">3</div><h3>Track and receive</h3><p>Follow every review stage until your document is ready to share.</p></div>
        </div>
      </section>
      <section className="section alt">
        <div className="split-media">
          <img src="images/about-office.png" alt="Highlight consulting office" />
          <div className="split-copy">
            <h2>Built for global opportunities</h2>
            <p>Students, families, and businesses use Highlight Consulting to present trusted financial documentation for study, immigration, and institutional requests.</p>
            <ul className="checklist">
              <li><CheckCircle2 size={18} color="#1a6dff" /> Confidential document handling</li>
              <li><CheckCircle2 size={18} color="#1a6dff" /> Clear application timelines</li>
              <li><CheckCircle2 size={18} color="#1a6dff" /> Public verification for recipients</li>
            </ul>
            <button className="btn primary" onClick={() => setPage('about')}>About the firm</button>
          </div>
        </div>
      </section>
      <section className="cta-band">
        <img src="images/skyline.png" alt="City skyline at dusk" />
        <div>
          <h2>Ready to start your application?</h2>
          <p>Create an account and submit your Proof of Funds request with guided steps and live tracking.</p>
          <button className="btn primary" onClick={() => setPage('signup')}>Apply Now</button>
        </div>
      </section>
    </>
  );
}

function About({ setPage }) {
  return (
    <section className="section">
      <div className="split-media reverse">
        <div className="split-copy">
          <h2>About Highlight Consulting</h2>
          <p>Highlight Consulting Services Limited helps individuals and organisations prepare, submit, and track Proof of Funds documentation with a clear, professional process.</p>
          <button className="btn primary" onClick={() => setPage('signup')}>Start an application</button>
        </div>
        <img src="images/about-office.png" alt="Consulting office interior" />
      </div>
    </section>
  );
}

function Services({ setPage }) {
  return (
    <section className="section">
      <div className="section-head">
        <h2>Services</h2>
        <p>Everything you need to request, manage, and verify Proof of Funds documents.</p>
      </div>
      <div className="split-media" style={{ marginBottom: 48 }}>
        <img src="images/services-documents.png" alt="Financial documents on a desk" />
        <div className="split-copy">
          <h2>Trusted financial documentation</h2>
          <p>From first submission to recipient verification, the portal keeps every file and status in one place.</p>
        </div>
      </div>
      <div className="cards-3">
        <div className="info-card"><Globe2 size={22} color="#1a6dff" /><h3>Proof of Funds</h3><p>Request documentation for study, travel, immigration, or business use.</p></div>
        <div className="info-card"><FileCheck2 size={22} color="#1a6dff" /><h3>Document verification</h3><p>Recipients can confirm a reference number on a public verification page.</p></div>
        <div className="info-card"><BarChart3 size={22} color="#1a6dff" /><h3>Application tracking</h3><p>Customers and staff see the same timeline from submitted to completed.</p></div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 36 }}>
        <button className="btn primary" onClick={() => setPage('signup')}>Apply Now</button>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    ['Who can apply?', 'Individuals and businesses can start a Proof of Funds application from the customer portal.'],
    ['How long does review take?', 'Applications move through submitted, under review, and processing stages as our team completes verification.'],
    ['How do recipients verify a document?', 'They enter the reference number on the public verification page to confirm authenticity.'],
    ['Is my data secure?', 'Accounts are authenticated and passwords are never stored in plain text. Documents are only accessible to you and authorised staff.']
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="section">
      <div className="section-head">
        <h2>Frequently asked questions</h2>
        <p>Quick answers before you start an application.</p>
      </div>
      <div className="faq">
        {items.map(([q, a], i) => (
          <div className="faq-item" key={q}>
            <button onClick={() => setOpen(open === i ? -1 : i)}>{q} <ChevronDown size={16} /></button>
            {open === i && <p>{a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="section">
      <div className="section-head">
        <h2>Contact</h2>
        <p>Reach the team about an application, verification, or partnership enquiry.</p>
      </div>
      <div className="contact-grid">
        <div className="contact-side">
          <h2 style={{ marginTop: 0 }}>Highlight Consulting</h2>
          <p>We respond to portal enquiries during business hours.</p>
          <b>Phone</b>
          <p><a href="tel:+2348039434923">+234 803 943 4923</a></p>
          <b>Email</b>
          <p><a href="mailto:Naahmad@highlightconsult.com">Naahmad@highlightconsult.com</a></p>
        </div>
        <div className="card">
          <div className="form-grid">
            <Field label="Full name" placeholder="Your name" />
            <Field label="Email" placeholder="you@example.com" />
            <Field label="Message" placeholder="How can we help?" wide textarea />
          </div>
          <div className="form-actions">
            <button className="btn primary">Send message</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Signup({ setPage }) {
  const { setUser } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { user } = await api.register(form);
      setUser(user);
      setPage('apply');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-form" onSubmit={submit}>
        <h1>Create Your Account</h1>
        <p>Join our platform to apply for Proof of Funds and track your application.</p>
        <ErrorBanner message={error} />
        <div className="form-grid">
          <Field label="Full Name" placeholder="Your full name" wide value={form.fullName} onChange={update('fullName')} required />
          <Field label="Email Address" placeholder="you@example.com" wide value={form.email} onChange={update('email')} type="email" required />
          <Field label="Phone Number" placeholder="+234 801 234 5678" wide value={form.phone} onChange={update('phone')} />
          <Field label="Password" type="password" placeholder="At least 8 characters" wide value={form.password} onChange={update('password')} required />
        </div>
        <label className="check">
          <input type="checkbox" required />
          <span>I agree to the Terms & Conditions and Privacy Policy</span>
        </label>
        <button className="btn primary block" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create Account'}</button>
        <p className="muted-link">Already have an account? <button type="button" className="btn link" onClick={() => setPage('login')}>Login</button></p>
      </form>
      <aside className="auth-panel">
        <img src="images/signup-building.png" alt="Glass tower at night" />
        <div>
          <h2>Secure<br />Simple<br />Reliable</h2>
          <p>Supporting your global opportunities with trusted financial documentation.</p>
        </div>
      </aside>
    </div>
  );
}

function Login({ setPage }) {
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await api.login(form);
      if (data.mfaRequired) {
        setMfaToken(data.mfaToken);
        return;
      }
      setUser(data.user);
      setPage(data.user.role === 'admin' || data.user.role === 'staff' ? 'admin' : 'dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitMfa(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { user } = await api.verifyLoginMfa({ mfaToken, code: mfaCode });
      setUser(user);
      setPage(user.role === 'admin' || user.role === 'staff' ? 'admin' : 'dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (mfaToken) {
    return (
      <div className="auth-wrap">
        <form className="auth-form" onSubmit={submitMfa}>
          <h1>Two-factor verification</h1>
          <p>Enter the 6-digit code from your authenticator app.</p>
          <ErrorBanner message={error} />
          <div className="form-grid">
            <Field label="Verification code" placeholder="123456" wide value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} required />
          </div>
          <div style={{ height: 22 }} />
          <button className="btn primary block" type="submit" disabled={busy}>{busy ? 'Verifying…' : 'Verify'}</button>
          <p className="muted-link"><button type="button" className="btn link" onClick={() => setMfaToken('')}>Back to login</button></p>
        </form>
        <aside className="auth-panel">
          <img src="images/signup-building.png" alt="Glass tower at night" />
          <div>
            <h2>Track every<br />application<br />in one place</h2>
            <p>Review status, documents, and payment history from your dashboard.</p>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <form className="auth-form" onSubmit={submit}>
        <h1>Welcome back</h1>
        <p>Sign in to manage your Proof of Funds applications.</p>
        <ErrorBanner message={error} />
        <div className="form-grid">
          <Field label="Email Address" placeholder="you@example.com" wide value={form.email} onChange={update('email')} type="email" required />
          <Field label="Password" type="password" placeholder="Enter your password" wide value={form.password} onChange={update('password')} required />
        </div>
        <div style={{ height: 22 }} />
        <button className="btn primary block" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Login'}</button>
        <p className="muted-link">New here? <button type="button" className="btn link" onClick={() => setPage('signup')}>Create an account</button></p>
      </form>
      <aside className="auth-panel">
        <img src="images/signup-building.png" alt="Glass tower at night" />
        <div>
          <h2>Track every<br />application<br />in one place</h2>
          <p>Review status, documents, and payment history from your dashboard.</p>
        </div>
      </aside>
    </div>
  );
}

function FlowHeader({ setPage }) {
  const { user } = useAuth();
  return (
    <header className="flow-header">
      <button onClick={() => setPage('dashboard')}><Brand /></button>
      <button className="avatar" onClick={() => setPage('dashboard')}>{initials(user?.fullName)}</button>
    </header>
  );
}

function Stepper({ step }) {
  return (
    <div className="stepper">
      {STEP_TITLES.map((s, i) => (
        <React.Fragment key={s}>
          <div className={'step ' + (i < step ? 'done ' : '') + (i === step ? 'current' : '')}>
            <i>{i < step ? <CheckCircle2 size={14} /> : i + 1}</i>
            <span>{s}</span>
          </div>
          {i < STEP_TITLES.length - 1 && <div className={'step-line ' + (i < step ? 'done' : '')} />}
        </React.Fragment>
      ))}
    </div>
  );
}

const DOC_SLOTS = [
  ['passport', 'Passport Photograph', 'JPG, JPEG, PNG (Max 5MB)'],
  ['id', 'Valid ID (Passport / NIN / Driver’s License)', 'PDF, JPEG, PNG (Max 5MB)'],
  ['address', 'Proof of Address', 'PDF, JPEG, PNG (Max 5MB)'],
  ['extra', 'Additional Documents (Optional)', 'PDF, JPEG, PNG (Max 5MB)']
];

function Apply({ setPage }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState({});
  const [payment, setPayment] = useState(null);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    dateOfBirth: '',
    nationality: '',
    idType: '',
    idNumber: '',
    phone: user?.phone || '',
    email: user?.email || '',
    amount: '',
    currency: 'USD',
    purpose: '',
    destination: '',
    intendedUse: ''
  });

  useEffect(() => {
    api.getPaymentSettings().then(setPayment).catch(() => {});
  }, []);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  function onFileSelected(id) {
    return (e) => {
      const file = e.target.files?.[0];
      if (file) setFiles({ ...files, [id]: file });
    };
  }

  async function finalizeSubmit() {
    setError('');
    setBusy(true);
    try {
      const { application } = await api.createApplication({
        fullName: form.fullName,
        dateOfBirth: form.dateOfBirth || null,
        nationality: form.nationality || null,
        idType: form.idType || null,
        idNumber: form.idNumber || null,
        phone: form.phone || null,
        email: form.email || null,
        amount: form.amount.replaceAll(',', ''),
        currency: form.currency,
        purpose: form.purpose,
        destination: form.destination || null,
        intendedUse: form.intendedUse || null
      });
      for (const [docType, file] of Object.entries(files)) {
        const data = new FormData();
        data.append('file', file);
        data.append('docType', docType);
        await api.uploadDocument(application.id, data);
      }
      setSubmitted(application);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <>
        <FlowHeader setPage={setPage} />
        <div className="page narrow">
          <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div className="success-icon"><CheckCircle2 size={38} /></div>
            <h2>Application Submitted</h2>
            <p className="sub">Your application has been received and is now under review.</p>
            <div className="fee" style={{ justifyContent: 'center', gap: 24 }}>
              <div><span>Application Reference</span><b>{submitted.reference}</b></div>
            </div>
            <div className="form-actions" style={{ justifyContent: 'center', border: 0 }}>
              <button className="btn primary" onClick={() => setPage('track:' + submitted.id)}>Track Application</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const subs = [
    'Provide your personal details.',
    'Provide details of your proof of funds request',
    'Upload the required documents to complete your application.',
    'Confirm your details and pay to submit your application.'
  ];

  return (
    <>
      <FlowHeader setPage={setPage} />
      <div className="page narrow">
        <Stepper step={step} />
        <div className="card">
          <h2>{STEP_TITLES[step]}</h2>
          <p className="sub">{subs[step]}</p>
          <ErrorBanner message={error} />

          {step === 0 && (
            <div className="form-grid">
              <Field label="Full Name" value={form.fullName} onChange={update('fullName')} required />
              <Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={update('dateOfBirth')} />
              <Field label="Nationality" placeholder="Select nationality" options={['Nigerian', 'Ghanaian', 'Kenyan', 'British', 'Canadian']} value={form.nationality} onChange={update('nationality')} />
              <Field label="ID Type" placeholder="Select ID type" options={['Passport', 'NIN', 'Driver’s License']} value={form.idType} onChange={update('idType')} />
              <Field label="ID Number" placeholder="Enter ID number" value={form.idNumber} onChange={update('idNumber')} />
              <Field label="Phone Number" value={form.phone} onChange={update('phone')} />
              <Field label="Email Address" value={form.email} onChange={update('email')} wide type="email" />
            </div>
          )}

          {step === 1 && (
            <div className="form-grid">
              <Field label="Amount Required" placeholder="e.g. 100,000" value={form.amount} onChange={update('amount')} required />
              <Field label="Currency" value={form.currency} onChange={update('currency')} options={['USD', 'GBP', 'EUR', 'CAD', 'NGN']} />
              <Field label="Purpose of Funds" placeholder="Select purpose" options={PURPOSES} value={form.purpose} onChange={update('purpose')} wide required />
              <Field label="Destination Country / Institution" placeholder="e.g. Canada / University of Toronto" wide value={form.destination} onChange={update('destination')} />
              <Field label="Intended Use" placeholder="Briefly explain the purpose of the funds" wide textarea value={form.intendedUse} onChange={update('intendedUse')} />
            </div>
          )}

          {step === 2 && (
            <div className="uploads">
              {DOC_SLOTS.map(([id, title, hint]) => (
                <div className={'upload' + (files[id] ? ' done' : '')} key={id}>
                  <div className="upload-icon">{files[id] ? <CheckCircle2 size={19} /> : <FileText size={19} />}</div>
                  <div><b>{title}</b><span>{files[id] ? files[id].name : hint}</span></div>
                  <label className="btn ghost sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Upload size={14} /> {files[id] ? 'Replace' : 'Upload'}
                    <input type="file" accept="application/pdf,image/jpeg,image/png" style={{ display: 'none' }} onChange={onFileSelected(id)} />
                  </label>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="review-stack">
              <div className="review-box">
                <div className="top"><h3>Personal Information</h3><button className="btn link" onClick={() => setStep(0)}><Pencil size={14} /></button></div>
                <div className="review-grid">
                  <div><span>Full Name</span><b>{form.fullName || '—'}</b></div>
                  <div><span>Email</span><b>{form.email || '—'}</b></div>
                  <div><span>Phone</span><b>{form.phone || '—'}</b></div>
                </div>
              </div>
              <div className="review-box">
                <div className="top"><h3>Application Details</h3><button className="btn link" onClick={() => setStep(1)}><Pencil size={14} /></button></div>
                <div className="review-grid">
                  <div><span>Amount</span><b>{form.currency} {form.amount || '—'}</b></div>
                  <div><span>Purpose</span><b>{form.purpose || '—'}</b></div>
                  <div><span>Destination</span><b>{form.destination || '—'}</b></div>
                  <div><span>Intended Use</span><b>{form.intendedUse || '—'}</b></div>
                </div>
              </div>
              <div className="fee">
                <div><b>Application Fee</b><span>{payment?.bankName ? `Pay by transfer to ${payment.bankName}` : 'Payment details will be shared after submission'}</span></div>
                <strong>{payment ? `${payment.feeCurrency} ${Number(payment.feeAmount).toLocaleString()}` : '—'}</strong>
              </div>
              {payment?.accountNumber && (
                <div className="review-box">
                  <div className="top"><h3>Payment Details</h3></div>
                  <div className="review-grid">
                    <div><span>Account Name</span><b>{payment.accountName || '—'}</b></div>
                    <div><span>Account Number</span><b>{payment.accountNumber}</b></div>
                    <div><span>Bank</span><b>{payment.bankName || '—'}</b></div>
                  </div>
                  {payment.instructions && <p className="sub">{payment.instructions}</p>}
                </div>
              )}
            </div>
          )}

          <div className="form-actions">
            {step > 0 && <button className="btn ghost" onClick={() => setStep(step - 1)}>Back</button>}
            <button
              className="btn primary"
              disabled={busy || (step === 1 && (!form.amount || !form.purpose)) || (step === 0 && !form.fullName)}
              onClick={() => (step === 3 ? finalizeSubmit() : setStep(step + 1))}
            >
              {busy ? 'Submitting…' : step === 3 ? 'Submit Application' : 'Next Step'} {step < 3 && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function CustomerLayout({ active, setPage, children }) {
  const { user, logout } = useAuth();
  const items = [
    ['dashboard', 'Dashboard', LayoutDashboard],
    ['applications', 'My Applications', FileText],
    ['payments', 'Payments', CreditCard],
    ['documents', 'Documents', FileText],
    ['profile', 'Profile', UserRound],
    ['support', 'Support', LifeBuoy]
  ];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button onClick={() => setPage('dashboard')}><Brand light /></button>
        {items.map(([id, label, Icon]) => (
          <button key={id} className={active === id ? 'active' : ''} onClick={() => setPage(id)}>
            <Icon size={18} />{label}
          </button>
        ))}
        <button className="logout" onClick={async () => { await logout(); setPage('home'); }}><LogOut size={18} />Logout</button>
      </aside>
      <div className="app-main">
        <div className="app-top"><div className="avatar">{initials(user?.fullName)}</div></div>
        {children}
      </div>
    </div>
  );
}

function Dashboard({ setPage }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.myApplications()
      .then((data) => setApplications(data.applications))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const counts = applications.reduce(
    (acc, a) => {
      acc.total += 1;
      if (['submitted', 'under_review', 'needs_information', 'processing'].includes(a.status)) acc.inProgress += 1;
      if (a.status === 'approved' || a.status === 'completed') acc.approved += 1;
      if (a.status === 'rejected') acc.rejected += 1;
      return acc;
    },
    { total: 0, inProgress: 0, approved: 0, rejected: 0 }
  );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Welcome{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}</h1>
          <p>Track and manage your Proof of Funds applications.</p>
        </div>
        <button className="btn primary" onClick={() => setPage('apply')}>Apply Now</button>
      </div>
      <div className="stats">
        <div className="stat"><b>{counts.total}</b><span>Total Applications</span></div>
        <div className="stat warn"><b>{counts.inProgress}</b><span>In Progress</span></div>
        <div className="stat ok"><b>{counts.approved}</b><span>Approved</span></div>
        <div className="stat bad"><b>{counts.rejected}</b><span>Rejected</span></div>
      </div>
      <section className="card">
        <div className="card-head">
          <div><h2>Recent Applications</h2></div>
          <button className="btn link" onClick={() => setPage('applications')}>View All <ChevronRight size={15} /></button>
        </div>
        <ErrorBanner message={error} />
        {loading ? (
          <EmptyState text="Loading applications…" />
        ) : applications.length === 0 ? (
          <EmptyState text="You haven't submitted an application yet." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Ref. Number</th><th>Amount</th><th>Purpose</th><th>Status</th><th>Date</th><th /></tr></thead>
              <tbody>
                {applications.slice(0, 5).map((a) => (
                  <tr key={a.id}>
                    <td><b>{a.reference}</b></td><td>{a.currency} {a.amount.toLocaleString()}</td><td>{a.purpose}</td>
                    <td><Status>{a.status}</Status></td><td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn ghost sm" onClick={() => setPage('track:' + a.id)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Applications({ setPage }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.myApplications()
      .then((data) => setApplications(data.applications))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = applications.filter((a) => a.reference.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>My Applications</h1><p>All your Proof of Funds applications in one place.</p></div>
        <button className="btn primary" onClick={() => setPage('apply')}>New Application</button>
      </div>
      <div className="card">
        <div className="filters">
          <div className="search"><Search size={16} /><input placeholder="Search reference number..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        </div>
        <ErrorBanner message={error} />
        {loading ? (
          <EmptyState text="Loading applications…" />
        ) : filtered.length === 0 ? (
          <EmptyState text="No applications found." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Reference</th><th>Amount</th><th>Destination</th><th>Status</th><th>Submitted</th><th /></tr></thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td><b>{a.reference}</b></td><td>{a.currency} {a.amount.toLocaleString()}</td><td>{a.destination || '—'}</td>
                    <td><Status>{a.status}</Status></td><td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn ghost sm" onClick={() => setPage('track:' + a.id)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SimplePanel({ title, text }) {
  return (
    <div className="page">
      <div className="page-head"><div><h1>{title}</h1><p>{text}</p></div></div>
      <div className="card"><EmptyState text="Nothing here yet." /></div>
    </div>
  );
}

function ProfilePanel() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setBusy(true);
    try {
      await api.changePassword(form);
      setForm({ currentPassword: '', newPassword: '' });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="page-head"><div><h1>Profile</h1><p>Your contact and identity details.</p></div></div>
      <div className="card">
        <div className="detail-grid">
          <div><span>Full Name</span><b>{user?.fullName}</b></div>
          <div><span>Email</span><b>{user?.email}</b></div>
          <div><span>Phone</span><b>{user?.phone || '—'}</b></div>
          <div><span>Role</span><b>{user?.role}</b></div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-head"><div><h2>Change Password</h2></div></div>
        <ErrorBanner message={error} />
        {success && <p className="sub">Password updated.</p>}
        <form className="form-grid" onSubmit={submit}>
          <Field label="Current Password" type="password" wide value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required />
          <Field label="New Password" type="password" wide value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Track({ setPage, applicationId }) {
  const [application, setApplication] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!applicationId) return;
    api.getApplication(applicationId)
      .then((data) => { setApplication(data.application); setEvents(data.events); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [applicationId]);

  return (
    <>
      <FlowHeader setPage={setPage} />
      <div className="page narrow">
        <div className="page-head">
          <div><h1>Application Timeline</h1><p>{application?.reference || ''}</p></div>
          {application && <Status>{application.status}</Status>}
        </div>
        <ErrorBanner message={error} />
        {loading ? (
          <div className="card"><EmptyState text="Loading application…" /></div>
        ) : !application ? (
          <div className="card"><EmptyState text="Application not found." /></div>
        ) : (
          <div className="card timeline">
            {events.map((ev, i) => (
              <Timeline key={i} done title={STATUS_LABELS[ev.status] || ev.status} date={new Date(ev.created_at).toLocaleString()} text={ev.note || ''} />
            ))}
          </div>
        )}
        <div className="notice"><Bell size={18} /><span>You will be notified at every stage of your application.</span></div>
      </div>
    </>
  );
}

function Timeline({ done, current, title, date, text }) {
  return (
    <div className="timeline-row">
      <div className={'dot ' + (done ? 'done' : '') + (current ? ' current' : '')}>
        {(done || current) && <CheckCircle2 size={16} />}
      </div>
      <div><b>{title}</b>{date && <small>{date}</small>}<span>{text}</span></div>
    </div>
  );
}

function AdminLayout({ active, setPage, children }) {
  const { user, logout } = useAuth();
  const items = [
    ['admin', 'Dashboard', LayoutDashboard],
    ['admin-apps', 'Applications', FileText],
    ['admin-customers', 'Customers', Users],
    ['admin-payments', 'Payments', CreditCard],
    ['admin-docs', 'Documents', FileText],
    ['admin-staff', 'Staff', Users],
    ['admin-settings', 'Settings', Settings]
  ];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button onClick={() => setPage('admin')}><Brand light /></button>
        {items.map(([id, label, Icon]) => (
          <button key={id} className={active === id ? 'active' : ''} onClick={() => setPage(id === 'admin-apps' ? 'admin-review' : id)}>
            <Icon size={18} />{label}
          </button>
        ))}
        <button className="logout" onClick={async () => { await logout(); setPage('home'); }}><LogOut size={18} />Logout</button>
      </aside>
      <div className="app-main">
        <div className="app-top"><div className="avatar">{initials(user?.fullName)}</div></div>
        {children}
      </div>
    </div>
  );
}

function AdminHome({ setPage }) {
  const [stats, setStats] = useState({ byStatus: [], monthly: [] });
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.adminStats(), api.adminListApplications()])
      .then(([statsData, listData]) => { setStats(statsData); setApplications(listData.applications); })
      .catch((err) => setError(err.message));
  }, []);

  const countFor = (status) => stats.byStatus.find((s) => s.status === status)?.count || 0;
  const total = stats.byStatus.reduce((sum, s) => sum + s.count, 0);
  const maxMonthly = Math.max(1, ...stats.monthly.map((m) => m.count));

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Admin Dashboard</h1><p>Overview of applications and system activity.</p></div>
      </div>
      <ErrorBanner message={error} />
      <div className="stats">
        <div className="stat"><b>{total}</b><span>Total Applications</span></div>
        <div className="stat warn"><b>{countFor('under_review')}</b><span>Under Review</span></div>
        <div className="stat ok"><b>{countFor('approved') + countFor('completed')}</b><span>Approved</span></div>
        <div className="stat bad"><b>{countFor('rejected')}</b><span>Rejected</span></div>
      </div>
      <div className="admin-grid">
        <div className="card">
          <div className="card-head"><div><h2>Applications Overview</h2><p>Monthly application volume.</p></div><BarChart3 size={18} /></div>
          {stats.monthly.length === 0 ? (
            <EmptyState text="No application activity yet." />
          ) : (
            <div className="bars">
              {stats.monthly.map((m, i) => (
                <div key={i}><div style={{ height: (m.count / maxMonthly) * 100 + '%' }} /><span>{m.month}</span></div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-head"><div><h2>Recent Applications</h2></div></div>
          {applications.length === 0 ? (
            <EmptyState text="No applications submitted yet." />
          ) : (
            applications.slice(0, 6).map((a) => (
              <button className="mini-row" key={a.id} onClick={() => setPage('admin-review:' + a.id)} style={{ width: '100%' }}>
                <div><b>{a.reference}</b><span>{a.fullName} · {a.currency} {a.amount.toLocaleString()}</span></div>
                <Status>{a.status}</Status>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AdminApplicationsList({ setPage }) {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminListApplications()
      .then((data) => setApplications(data.applications))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = applications.filter((a) => a.reference.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page">
      <div className="page-head"><div><h1>Applications</h1><p>All Proof of Funds applications.</p></div></div>
      <div className="card">
        <div className="filters">
          <div className="search"><Search size={16} /><input placeholder="Search reference number..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        </div>
        <ErrorBanner message={error} />
        {loading ? (
          <EmptyState text="Loading applications…" />
        ) : filtered.length === 0 ? (
          <EmptyState text="No applications found." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Reference</th><th>Applicant</th><th>Amount</th><th>Status</th><th>Submitted</th><th /></tr></thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td><b>{a.reference}</b></td><td>{a.fullName}</td><td>{a.currency} {a.amount.toLocaleString()}</td>
                    <td><Status>{a.status}</Status></td><td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn ghost sm" onClick={() => setPage('admin-review:' + a.id)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const STATUS_OPTIONS = Object.keys(STATUS_LABELS);

function AdminReview({ applicationId, setPage }) {
  const [tab, setTab] = useState('Overview');
  const [application, setApplication] = useState(null);
  const [events, setEvents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [nextStatus, setNextStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function load() {
    if (!applicationId) return;
    api.getApplication(applicationId)
      .then((data) => { setApplication(data.application); setEvents(data.events); setNextStatus(data.application.status); })
      .catch((err) => setError(err.message));
    api.listDocuments(applicationId).then((data) => setDocuments(data.documents)).catch(() => {});
  }

  useEffect(load, [applicationId]);

  async function updateStatus() {
    setBusy(true);
    setError('');
    try {
      await api.adminUpdateStatus(applicationId, { status: nextStatus });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!applicationId) {
    return (
      <div className="page">
        <div className="page-head"><div><h1>Application Details</h1></div></div>
        <div className="card"><EmptyState text="Select an application from the list to review it." /></div>
        <button className="btn ghost" style={{ marginTop: 16 }} onClick={() => setPage('admin-review')}>Back to applications</button>
      </div>
    );
  }

  if (!application) {
    return <div className="page"><ErrorBanner message={error} /><EmptyState text="Loading application…" /></div>;
  }

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Application Details</h1><p>{application.reference}</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <button className="btn primary" disabled={busy || nextStatus === application.status} onClick={updateStatus}>Update Status</button>
        </div>
      </div>
      <ErrorBanner message={error} />
      <div className="card">
        <div className="tabs">
          {['Overview', 'Documents', 'Audit Log'].map((t) => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        {tab === 'Overview' && (
          <div className="detail-grid">
            <div><span>Reference Number</span><b>{application.reference}</b></div>
            <div><span>Applicant</span><b>{application.fullName}</b></div>
            <div><span>Email</span><b>{application.email || '—'}</b></div>
            <div><span>Phone</span><b>{application.phone || '—'}</b></div>
            <div><span>Amount</span><b>{application.currency} {application.amount.toLocaleString()}</b></div>
            <div><span>Purpose</span><b>{application.purpose}</b></div>
            <div><span>Destination</span><b>{application.destination || '—'}</b></div>
            <div><span>Status</span><b>{STATUS_LABELS[application.status]}</b></div>
          </div>
        )}
        {tab === 'Documents' && (
          documents.length === 0
            ? <EmptyState text="No documents uploaded yet." />
            : <ul>{documents.map((d) => <li key={d.id}>{d.doc_type}: {d.original_name}</li>)}</ul>
        )}
        {tab === 'Audit Log' && (
          events.length === 0
            ? <EmptyState text="No activity recorded yet." />
            : events.map((ev, i) => <p className="sub" key={i}>{new Date(ev.created_at).toLocaleString()} — {STATUS_LABELS[ev.status] || ev.status}{ev.note ? `: ${ev.note}` : ''}</p>)
        )}
      </div>
    </div>
  );
}

function Verify({ setPage }) {
  const [reference, setReference] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    setResult(null);
    try {
      const data = await api.verify(reference);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PublicHeader page="verify" setPage={setPage} />
      <div className="verify-page">
        <div className="verify-card card">
          {!result ? (
            <form onSubmit={submit}>
              <Brand />
              <h1>Verify Proof of Funds Document</h1>
              <p>Enter the reference number to verify the authenticity of a document.</p>
              <ErrorBanner message={error} />
              <div className="verify-input">
                <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. HCS-2026-000001" required />
                <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Checking…' : 'Verify'}</button>
              </div>
            </form>
          ) : (
            <>
              <div className="success-icon"><CheckCircle2 size={38} /></div>
              <h1>Document Verified</h1>
              <div className="verify-details">
                <div className="verify-row"><span>Reference Number</span><b>{result.reference}</b></div>
                <div className="verify-row"><span>Applicant Name</span><b>{result.applicantName}</b></div>
                <div className="verify-row"><span>Amount</span><b>{result.currency} {result.amount.toLocaleString()}</b></div>
                <div className="verify-row"><span>Purpose</span><b>{result.purpose}</b></div>
                <div className="verify-row"><span>Issue Date</span><b>{new Date(result.issueDate).toLocaleDateString()}</b></div>
                <div className="verify-row"><span>Status</span><Status>{result.status}</Status></div>
              </div>
              <p className="sub">This document is a genuine record from Highlight Consulting Services Limited.</p>
              <button className="btn ghost" onClick={() => setResult(null)}>Verify another</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function AdminTeam() {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ fullName: '', email: '', role: 'staff' });
  const [busy, setBusy] = useState(false);
  const [createdCredential, setCreatedCredential] = useState(null);

  function load() {
    setLoading(true);
    api.listTeam()
      .then((data) => setTeam(data.users))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  if (user?.role !== 'admin') {
    return <div className="page"><div className="page-head"><div><h1>Team</h1></div></div><div className="card"><EmptyState text="Only admins can manage team members." /></div></div>;
  }

  async function addMember(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    setCreatedCredential(null);
    try {
      const { user: newUser, tempPassword } = await api.addTeamMember(form);
      setCreatedCredential({ email: newUser.email, tempPassword });
      setForm({ fullName: '', email: '', role: 'staff' });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(member) {
    setError('');
    try {
      await api.updateTeamMember(member.id, { isActive: !member.isActive });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function changeRole(member, role) {
    setError('');
    try {
      await api.updateTeamMember(member.id, { role });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="page-head"><div><h1>Team</h1><p>Staff and admin accounts that can log into the admin dashboard.</p></div></div>
      <ErrorBanner message={error} />
      <div className="card">
        <div className="card-head"><div><h2>Add a team member</h2><p>A one-time temporary password is generated — share it securely; they should change it after logging in.</p></div></div>
        <form className="form-grid" onSubmit={addMember}>
          <Field label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <Field label="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Field label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={['staff', 'admin']} />
          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Adding…' : 'Add team member'}</button>
          </div>
        </form>
        {createdCredential && (
          <div className="form-error" style={{ background: '#eef7ff', borderColor: '#bcdcff', color: 'var(--ink)' }}>
            <span>Account created for <b>{createdCredential.email}</b>. Temporary password: <b>{createdCredential.tempPassword}</b> (shown once — share it securely).</span>
          </div>
        )}
      </div>
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-head"><div><h2>Team members</h2></div></div>
        {loading ? (
          <EmptyState text="Loading team…" />
        ) : team.length === 0 ? (
          <EmptyState text="No team members yet." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>2FA</th><th>Status</th><th /></tr></thead>
              <tbody>
                {team.map((m) => (
                  <tr key={m.id}>
                    <td><b>{m.fullName}</b></td>
                    <td>{m.email}</td>
                    <td>
                      <select value={m.role} onChange={(e) => changeRole(m, e.target.value)}>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{m.mfaEnabled ? 'Enabled' : 'Off'}</td>
                    <td>{m.isActive ? 'Active' : 'Disabled'}</td>
                    <td><button className="btn ghost sm" onClick={() => toggleActive(m)}>{m.isActive ? 'Disable' : 'Enable'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminSettings() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Security');
  const [error, setError] = useState('');
  const [setupData, setSetupData] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [payment, setPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getPaymentSettings().then((data) => { setPayment(data); setPaymentForm(data); }).catch((err) => setError(err.message));
  }, []);

  if (user?.role !== 'admin') {
    return <div className="page"><div className="page-head"><div><h1>Settings</h1></div></div><div className="card"><EmptyState text="Only admins can manage portal settings." /></div></div>;
  }

  async function startMfaSetup() {
    setError('');
    setBusy(true);
    try {
      const data = await api.mfaSetup();
      setSetupData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmEnable(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.mfaEnable(mfaCode);
      setSetupData(null);
      setMfaCode('');
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function disableMfa(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.mfaDisable(mfaCode);
      setMfaCode('');
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function savePayment(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    setSaved(false);
    try {
      const data = await api.updatePaymentSettings(paymentForm);
      setPayment(data);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="page-head"><div><h1>Settings</h1><p>Admin security and payment configuration.</p></div></div>
      <ErrorBanner message={error} />
      <div className="card">
        <div className="tabs">
          {['Security', 'Payment'].map((t) => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {tab === 'Security' && (
          <div>
            <p className="sub">Two-factor authentication (Google Authenticator compatible) for your own admin account.</p>
            {user.mfaEnabled ? (
              <form onSubmit={disableMfa} className="form-grid">
                <Field label="Enter a current code to disable 2FA" wide value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} placeholder="123456" required />
                <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
                  <button className="btn ghost" type="submit" disabled={busy}>{busy ? 'Disabling…' : 'Disable 2FA'}</button>
                </div>
              </form>
            ) : setupData ? (
              <form onSubmit={confirmEnable} className="form-grid">
                <div style={{ gridColumn: '1 / -1' }}>
                  <img src={setupData.qrCode} alt="2FA QR code" style={{ width: 200, height: 200 }} />
                  <p className="sub">Scan with Google Authenticator (or any TOTP app), or enter this key manually: <b>{setupData.secret}</b></p>
                </div>
                <Field label="Enter the 6-digit code to confirm" wide value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} placeholder="123456" required />
                <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
                  <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Confirming…' : 'Enable 2FA'}</button>
                </div>
              </form>
            ) : (
              <button className="btn primary" onClick={startMfaSetup} disabled={busy}>{busy ? 'Starting…' : 'Set up 2FA'}</button>
            )}
          </div>
        )}

        {tab === 'Payment' && paymentForm && (
          <form className="form-grid" onSubmit={savePayment}>
            <Field label="Application Fee Amount" value={paymentForm.feeAmount} onChange={(e) => setPaymentForm({ ...paymentForm, feeAmount: e.target.value })} required />
            <Field label="Currency" value={paymentForm.feeCurrency} onChange={(e) => setPaymentForm({ ...paymentForm, feeCurrency: e.target.value })} options={['NGN', 'USD', 'GBP', 'EUR']} />
            <Field label="Bank Name" value={paymentForm.bankName} onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })} wide />
            <Field label="Account Name" value={paymentForm.accountName} onChange={(e) => setPaymentForm({ ...paymentForm, accountName: e.target.value })} wide />
            <Field label="Account Number" value={paymentForm.accountNumber} onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })} wide />
            <Field label="Payment Instructions" value={paymentForm.instructions} onChange={(e) => setPaymentForm({ ...paymentForm, instructions: e.target.value })} wide textarea />
            <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
              <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save payment settings'}</button>
              {saved && <span className="sub">Saved.</span>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function AppInner() {
  const { user, initializing } = useAuth();
  const [page, setPage] = useState('home');

  if (initializing) {
    return <div className="page"><EmptyState text="Loading…" /></div>;
  }

  const customerPages = ['dashboard', 'applications', 'payments', 'documents', 'profile', 'support'];
  const adminPageIds = ['admin', 'admin-customers', 'admin-payments', 'admin-docs', 'admin-staff', 'admin-settings'];

  const [base, param] = page.split(':');

  if (base === 'signup') return <><PublicHeader page={page} setPage={setPage} /><Signup setPage={setPage} /></>;
  if (base === 'login') return <><PublicHeader page={page} setPage={setPage} /><Login setPage={setPage} /></>;
  if (base === 'verify') return <Verify setPage={setPage} />;

  if (base === 'apply') {
    if (!user) return <><PublicHeader page={page} setPage={setPage} /><Login setPage={setPage} /></>;
    return <Apply setPage={setPage} />;
  }
  if (base === 'track') {
    if (!user) return <><PublicHeader page={page} setPage={setPage} /><Login setPage={setPage} /></>;
    return <Track setPage={setPage} applicationId={param} />;
  }

  if (customerPages.includes(base)) {
    if (!user) return <><PublicHeader page={page} setPage={setPage} /><Login setPage={setPage} /></>;
    return (
      <CustomerLayout active={base} setPage={setPage}>
        {base === 'dashboard' && <Dashboard setPage={setPage} />}
        {base === 'applications' && <Applications setPage={setPage} />}
        {base === 'payments' && <SimplePanel title="Payments" text="Application fees and receipts." />}
        {base === 'documents' && <SimplePanel title="Documents" text="Files attached to your applications." />}
        {base === 'profile' && <ProfilePanel />}
        {base === 'support' && <SimplePanel title="Support" text="Get help with an application." />}
      </CustomerLayout>
    );
  }

  if (base === 'admin-review' || adminPageIds.includes(base)) {
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) return <><PublicHeader page={page} setPage={setPage} /><Login setPage={setPage} /></>;
    return (
      <AdminLayout active={base === 'admin-review' ? 'admin-apps' : base} setPage={setPage}>
        {base === 'admin' && <AdminHome setPage={setPage} />}
        {base === 'admin-review' && !param && <AdminApplicationsList setPage={setPage} />}
        {base === 'admin-review' && param && <AdminReview applicationId={param} setPage={setPage} />}
        {base === 'admin-customers' && <SimplePanel title="Customers" text="Registered portal users." />}
        {base === 'admin-payments' && <SimplePanel title="Payments" text="Fee collection overview." />}
        {base === 'admin-docs' && <SimplePanel title="Documents" text="Files submitted for review." />}
        {base === 'admin-staff' && <AdminTeam />}
        {base === 'admin-settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  return (
    <PublicShell page={base} setPage={setPage}>
      {base === 'home' && <Home setPage={setPage} />}
      {base === 'about' && <About setPage={setPage} />}
      {base === 'services' && <Services setPage={setPage} />}
      {base === 'faq' && <FAQ />}
      {base === 'contact' && <Contact />}
    </PublicShell>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

createRoot(document.getElementById('root')).render(<App />);
