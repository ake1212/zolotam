import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { AppShell } from '../components/AppShell';
import { PillarGrid } from '../components/PillarGrid';
import { PillarIcon } from '../components/PillarIcon';
import { ImageSlot } from '../components/ImageSlot';
import {
  ArtTile,
  BackLink,
  Button,
  Field,
  FieldError,
  MarkFrame,
  TextAreaField,
  eyebrow,
} from '../components/primitives';
import { pillarName } from '../data/pillars';

interface Draft {
  name: string;
  title: string;
  description: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  services: string;
}

const EMPTY: Draft = {
  name: '',
  title: '',
  description: '',
  city: '',
  country: 'Cameroon',
  phone: '',
  email: '',
  website: '',
  services: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STEP_TITLE = ['Choose your pillar.', 'Listing details.', 'Photography.', 'Preview.'];

export function AddListing() {
  const navigate = useNavigate();
  const { currentUser, createListing } = useApp();

  const [step, setStep] = useState(1);
  const [pillarIdx, setPillarIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft>({
    ...EMPTY,
    name: currentUser?.org ?? '',
    phone: currentUser?.phone ?? '',
    email: currentUser?.email ?? '',
    country: currentUser?.country ?? 'Cameroon',
  });
  const [logo, setLogo] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Array<string | null>>([null, null, null]);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validateDetails(): boolean {
    const next: Partial<Record<keyof Draft, string>> = {};
    if (!draft.name.trim()) next.name = 'A business name is required.';
    if (!draft.title.trim()) next.title = 'Give the listing a short title.';
    if (draft.description.trim().length < 20) {
      next.description = 'Describe what you do in at least 20 characters.';
    }
    if (!draft.city.trim()) next.city = 'Which city?';
    if (!draft.phone.trim()) next.phone = 'Buyers need a number to call.';
    if (!EMAIL_RE.test(draft.email.trim())) next.email = 'Enter a valid email address.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function next() {
    if (step === 1 && pillarIdx === null) return;
    if (step === 2 && !validateDetails()) return;
    setStep((s) => Math.min(s + 1, 4));
  }

  function back() {
    if (step <= 1) navigate('/dashboard');
    else setStep((s) => s - 1);
  }

  function submit() {
    createListing({
      pillarIdx: pillarIdx ?? 0,
      name: draft.name,
      title: draft.title,
      description: draft.description,
      city: draft.city,
      country: draft.country,
      phone: draft.phone,
      email: draft.email,
      website: draft.website,
      services: draft.services
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      logo,
      cover,
      photos: photos.filter((p): p is string => !!p),
    });
    setStep(5);
  }

  if (step === 5) {
    return (
      <AppShell topSpacer>
        <div style={{ padding: '36px 24px 36px' }}>
          <div style={{ marginBottom: 28 }}>
            <MarkFrame />
          </div>
          <h1
            style={{
              fontSize: 27,
              fontWeight: 600,
              letterSpacing: '-0.032em',
              color: 'var(--ink)',
              margin: '0 0 14px',
              lineHeight: 1.15,
            }}
          >
            Sent for review.
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--ink-55)', margin: '0 0 36px' }}>
            An administrator will publish or return your listing shortly. Until then it sits under My
            Listings, marked pending.
          </p>
          <Button onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell topSpacer>
      <div style={{ padding: '0 24px 36px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <BackLink onClick={back} />
          <div style={{ ...eyebrow, letterSpacing: '0.18em' }}>STEP {step} / 4</div>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 32 }} aria-hidden="true">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 'var(--r-pill)',
                background: n <= step ? 'var(--ink)' : 'rgba(20,18,15,0.14)',
              }}
            />
          ))}
        </div>

        <h1
          style={{
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: '-0.032em',
            color: 'var(--ink)',
            margin: step === 2 ? '0 0 26px' : '0 0 8px',
          }}
        >
          {STEP_TITLE[step - 1]}
        </h1>

        {step === 1 ? (
          <>
            <p style={{ fontSize: 13, color: 'var(--ink-50)', margin: '0 0 26px' }}>
              One listing sits in one pillar. You can add more later.
            </p>
            <PillarGrid
              selectedIdx={pillarIdx}
              onSelect={(idx) => setPillarIdx(idx)}
              style={{ marginBottom: 32 }}
            />
            <Button onClick={next} disabled={pillarIdx === null}>
              Continue
            </Button>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <Field
                label="BUSINESS NAME"
                value={draft.name}
                onChange={(v) => set('name', v)}
                error={errors.name}
              />
              <Field
                label="LISTING TITLE"
                value={draft.title}
                onChange={(v) => set('title', v)}
                placeholder="Cement, roofing & site delivery"
                error={errors.title}
              />
              <TextAreaField
                label="DESCRIPTION"
                value={draft.description}
                onChange={(v) => set('description', v)}
                placeholder="What you supply, who you serve, since when."
                error={errors.description}
              />
              <div style={{ display: 'flex', gap: 20 }}>
                <Field
                  label="CITY"
                  value={draft.city}
                  onChange={(v) => set('city', v)}
                  error={errors.city}
                  style={{ flex: 1 }}
                />
                <Field
                  label="COUNTRY"
                  value={draft.country}
                  onChange={(v) => set('country', v)}
                  style={{ flex: 1 }}
                />
              </div>
              <Field
                label="PHONE"
                type="tel"
                value={draft.phone}
                onChange={(v) => set('phone', v)}
                error={errors.phone}
              />
              <Field
                label="EMAIL"
                type="email"
                value={draft.email}
                onChange={(v) => set('email', v)}
                error={errors.email}
              />
              <Field
                label="WEBSITE"
                type="url"
                value={draft.website}
                onChange={(v) => set('website', v)}
                placeholder="Optional"
              />
              <Field
                label="SERVICES"
                value={draft.services}
                onChange={(v) => set('services', v)}
                placeholder="Delivery, bulk orders, installation"
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 34 }}>
              <Button variant="outline" onClick={back}>
                Back
              </Button>
              <Button onClick={next}>Continue</Button>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <p style={{ fontSize: 13, color: 'var(--ink-50)', margin: '0 0 26px' }}>
              Strong imagery is what gets a listing opened. Drop files into any frame.
            </p>
            <div style={{ ...eyebrow, marginBottom: 10 }}>LOGO &amp; COVER</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', marginBottom: 26 }}>
              <ImageSlot
                value={logo}
                onChange={setLogo}
                placeholder="Logo"
                style={{ width: 78, height: 78, flexShrink: 0 }}
              />
              <ImageSlot
                value={cover}
                onChange={setCover}
                placeholder="Cover"
                style={{ flex: 1, height: 78 }}
              />
            </div>
            <div style={{ ...eyebrow, marginBottom: 10 }}>GALLERY</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                marginBottom: 34,
              }}
            >
              {photos.map((p, i) => (
                <ImageSlot
                  key={i}
                  value={p}
                  onChange={(v) => setPhotos((prev) => prev.map((old, j) => (j === i ? v : old)))}
                  placeholder="Photo"
                  style={{ width: '100%', height: 78 }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="outline" onClick={back}>
                Back
              </Button>
              <Button onClick={next}>Preview</Button>
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <p style={{ fontSize: 13, color: 'var(--ink-50)', margin: '0 0 24px' }}>
              This is how buyers will see you.
            </p>
            <div
              style={{
                border: '1px solid var(--surface-edge)',
                borderRadius: 'var(--r-md)',
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden',
                marginBottom: 30,
              }}
            >
              <ArtTile height={120} rule radius="13px 13px 0 0">
                {cover ? (
                  <img
                    src={cover}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <PillarIcon index={pillarIdx ?? 0} color="rgba(168,129,58,0.9)" size={32} />
                )}
              </ArtTile>
              <div style={{ padding: 20 }}>
                <div
                  style={{
                    fontSize: 8.5,
                    fontWeight: 600,
                    color: 'var(--gold)',
                    letterSpacing: '0.16em',
                    marginBottom: 8,
                  }}
                >
                  {(pillarIdx === null ? 'Pillar' : pillarName(pillarIdx)).toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--ink)',
                    letterSpacing: '-0.025em',
                    marginBottom: 5,
                  }}
                >
                  {draft.name || 'Your business name'}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--ink-55)',
                    lineHeight: 1.5,
                    marginBottom: 14,
                  }}
                >
                  {draft.title || 'Your listing title appears here'}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 14,
                    borderTop: '1px solid var(--rule)',
                  }}
                >
                  <span style={{ fontSize: 11.5, color: 'var(--ink-50)' }}>
                    {[draft.city, draft.country].filter(Boolean).join(', ') || 'City, Country'}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.14em',
                      color: 'var(--ink-45)',
                    }}
                  >
                    PENDING
                  </span>
                </div>
              </div>
            </div>
            {pillarIdx === null ? <FieldError>Choose a pillar before submitting.</FieldError> : null}
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="outline" onClick={back}>
                Back
              </Button>
              <Button variant="gold" onClick={submit} disabled={pillarIdx === null}>
                Submit
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
