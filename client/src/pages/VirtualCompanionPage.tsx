import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowDown, ArrowLeft, ArrowRight, Check, ChevronDown, CircleHelp, Heart,
  HeartHandshake, LockKeyhole, MessageCircle, Moon, MoreHorizontal, Search,
  Send, ShieldCheck, SlidersHorizontal, Sparkles, X
} from 'lucide-react';
import './VirtualCompanionPage.css';

type Companion = {
  id: string;
  name: string;
  age: number;
  role: string;
  image: string;
  color: string;
  tags: string[];
  description: string;
  greeting: string;
};

type ChatMessage = {
  id: number;
  from: 'companion' | 'you';
  text: string;
  time: string;
};

const COMPANIONS: Companion[] = [
  {
    id: 'leo',
    name: 'Leo',
    age: 29,
    role: 'The soft-spoken artist',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=760&q=85',
    color: 'sage',
    tags: ['Thoughtful', 'Slow burn'],
    description: 'A little reserved at first, Leo notices the small things and makes them feel important.',
    greeting: 'Hey, you made it. I was just making tea. Tell me how your day really went?',
  },
  {
    id: 'maya',
    name: 'Maya',
    age: 27,
    role: 'The effortlessly charming one',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=760&q=85',
    color: 'rose',
    tags: ['Playful', 'Confident'],
    description: 'Quick with a grin and even quicker with a clever comeback. Maya keeps things light.',
    greeting: 'There you are. I was starting to think you were keeping me waiting on purpose. How are you?',
  },
  {
    id: 'jules',
    name: 'Jules',
    age: 31,
    role: 'Your favorite bookshop regular',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=760&q=85',
    color: 'amber',
    tags: ['Curious', 'Bookish'],
    description: 'A curious mind, a warm laugh, and a talent for turning an ordinary evening into a story.',
    greeting: 'I saved you the window seat. What are we in the mood for tonight: stories, daydreams, or just a little company?',
  },
  {
    id: 'noah',
    name: 'Noah',
    age: 30,
    role: 'The warm-hearted night owl',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=760&q=85',
    color: 'blue',
    tags: ['Easygoing', 'Good listener'],
    description: 'For late-night talks, gentle teasing, and someone who remembers what you tell him.',
    greeting: 'Still up? Good. I was hoping we could steal a little time for ourselves. What’s on your mind?',
  },
];

const STARTERS = ['Make me smile', 'Let’s get to know each other', 'Set a cozy scene'];

const timeNow = () => new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date());

const companionReply = (text: string, tone: string) => {
  const normalized = text.toLowerCase();
  if (normalized.includes('scene') || normalized.includes('imagine') || normalized.includes('cozy')) {
    return 'Picture a quiet little corner table, soft music in the background, and nowhere else you need to be. I’m glad we found this moment.';
  }
  if (normalized.includes('smile') || normalized.includes('joke')) {
    return 'All right, here goes: I tried to write a love song about the moon, but it was mostly just a phase. Your turn to pretend that was charming.';
  }
  if (normalized.includes('day') || normalized.includes('feel') || normalized.includes('mind')) {
    return 'I’m glad you told me. We can take this at whatever pace feels right for you. Want to tell me a little more, or should I distract you with something sweet?';
  }
  if (tone === 'Playful') return 'I like where your mind is going. Keep talking like that and I might have to make this conversation my favorite part of the day.';
  if (tone === 'Romantic') return 'There’s something lovely about having your attention right now. No rush, no expectations—just the two of us enjoying the moment.';
  return 'I like hearing what’s on your mind. We can take our time and keep this exactly as comfortable as you want.';
};

export const VirtualCompanionPage: React.FC = () => {
  const [ageConfirmed, setAgeConfirmed] = useState(() => sessionStorage.getItem('velvet-age-confirmed') === 'yes');
  const [activeCompanion, setActiveCompanion] = useState<Companion | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [tone, setTone] = useState('Sweet');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showBoundaries, setShowBoundaries] = useState(false);
  const [boundaries, setBoundaries] = useState<string[]>(['Keep it romantic', 'No pressure']);
  const [showMore, setShowMore] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filters = ['All', 'Thoughtful', 'Playful', 'Romantic'];
  const visibleCompanions = useMemo(() => COMPANIONS.filter((companion) => {
    const matchesSearch = `${companion.name} ${companion.role} ${companion.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || companion.tags.includes(activeFilter) ||
      (activeFilter === 'Romantic' && companion.tags.includes('Slow burn'));
    return matchesSearch && matchesFilter;
  }), [activeFilter, search]);

  const confirmAge = () => {
    sessionStorage.setItem('velvet-age-confirmed', 'yes');
    setAgeConfirmed(true);
  };

  const openChat = (companion: Companion) => {
    setActiveCompanion(companion);
    setMessages([{ id: Date.now(), from: 'companion', text: companion.greeting, time: timeNow() }]);
    setDraft('');
    setShowBoundaries(false);
  };

  const sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !activeCompanion) return;
    const now = Date.now();
    setMessages((current) => [
      ...current,
      { id: now, from: 'you', text, time: timeNow() },
      { id: now + 1, from: 'companion', text: companionReply(text, tone), time: timeNow() },
    ]);
    setDraft('');
  };

  const addStarter = (starter: string) => {
    setDraft(starter);
    inputRef.current?.focus();
  };

  const toggleBoundary = (boundary: string) => {
    setBoundaries((current) => current.includes(boundary)
      ? current.filter((item) => item !== boundary)
      : [...current, boundary]);
  };

  return (
    <div className="velvet-app">
      <header className="velvet-nav">
        <a className="velvet-brand" href="#home" aria-label="Velvet home">
          <span className="velvet-brand-mark"><Heart fill="currentColor" /></span>
          <span>velvet<span className="velvet-brand-dot">.</span></span>
        </a>
        <nav className="velvet-nav-links" aria-label="Main navigation">
          <a className="is-current" href="#companions">Discover</a>
          <a href="#how-it-works">How it works</a>
          <button type="button" onClick={() => setShowBoundaries(true)}>My boundaries</button>
        </nav>
        <div className="velvet-nav-actions">
          <span className="velvet-private"><LockKeyhole size={13} /> Private by design</span>
          <button className="velvet-avatar-button" type="button" aria-label="Open your boundaries" onClick={() => setShowBoundaries(true)}>
            <span>Y</span>
          </button>
        </div>
      </header>

      <main id="home">
        <section className="velvet-hero">
          <div className="velvet-hero-glow" />
          <div className="velvet-hero-inner">
            <div className="velvet-hero-copy">
              <p className="velvet-eyebrow"><span className="velvet-eyebrow-line" /> YOUR SPACE. YOUR PACE.</p>
              <h1>A little closer.<br /><em>Entirely your pace.</em></h1>
              <p className="velvet-hero-description">
                Meet someone new, share a moment, and see where a good conversation takes you.
                No pressure. Just the feeling of being understood.
              </p>
              <div className="velvet-hero-actions">
                <a className="velvet-button velvet-button-primary" href="#companions">Meet your person <ArrowRight size={16} /></a>
                <span className="velvet-online"><span /> A quiet corner, just for you</span>
              </div>
              <div className="velvet-hero-note"><ShieldCheck size={15} /> Adults only · Fictional companions · Your boundaries come first</div>
            </div>
            <div className="velvet-hero-art" aria-label="A selection of fictional companion portraits">
              <div className="velvet-orbit velvet-orbit-one" />
              <div className="velvet-orbit velvet-orbit-two" />
              <div className="velvet-art-card velvet-art-main">
                <img src={COMPANIONS[1].image} alt="Portrait of Maya, a fictional companion" />
                <div className="velvet-art-caption"><span><i /> Here with you</span><Sparkles size={15} /></div>
              </div>
              <div className="velvet-art-card velvet-art-small">
                <img src={COMPANIONS[0].image} alt="Portrait of Leo, a fictional companion" />
              </div>
              <div className="velvet-note-card"><span className="velvet-note-heart"><Heart fill="currentColor" size={15} /></span><span>Somewhere to<br />feel a little closer.</span></div>
              <span className="velvet-art-sparkle sparkle-one">✳</span>
              <span className="velvet-art-sparkle sparkle-two">✦</span>
            </div>
          </div>
          <div className="velvet-hero-foot">
            <span>AN EXPERIENCE BUILT AROUND YOU</span>
            <span>SCROLL TO EXPLORE <ArrowDown size={13} /></span>
          </div>
        </section>

        <section className="velvet-trust-strip" aria-label="Experience principles">
          <div><LockKeyhole /><span><strong>Your conversations stay yours</strong><small>Private, always by design</small></span></div>
          <i />
          <div><HeartHandshake /><span><strong>Comfort comes first</strong><small>Set the tone, change it anytime</small></span></div>
          <i />
          <div><Moon /><span><strong>No rush, no expectations</strong><small>Leave or restart whenever you like</small></span></div>
        </section>

        <section className="velvet-discover" id="companions">
          <div className="velvet-section-heading">
            <div>
              <p className="velvet-eyebrow"><span className="velvet-eyebrow-line" /> A GOOD PLACE TO BEGIN</p>
              <h2>Who feels like <em>your kind of person?</em></h2>
              <p>Every connection starts somewhere. Pick a personality that feels right.</p>
            </div>
            <div className="velvet-search">
              <Search size={16} />
              <input aria-label="Search companions" placeholder="Find your kind of person" value={search} onChange={(event) => setSearch(event.target.value)} />
              <SlidersHorizontal size={15} />
            </div>
          </div>

          <div className="velvet-filter-row" role="group" aria-label="Filter companions">
            <div className="velvet-filters">
              {filters.map((filter) => (
                <button key={filter} type="button" className={filter === activeFilter ? 'is-active' : ''} onClick={() => setActiveFilter(filter)}>
                  {filter === 'All' && <SlidersHorizontal size={13} />}{filter}
                </button>
              ))}
            </div>
            <span className="velvet-fiction-label"><span /> All companions are fictional</span>
          </div>

          <div className="velvet-companion-grid">
            {visibleCompanions.map((companion) => (
              <article className={`velvet-companion-card velvet-card-${companion.color}`} key={companion.id}>
                <button type="button" className="velvet-card-image" onClick={() => openChat(companion)} aria-label={`Meet ${companion.name}`}>
                  <img src={companion.image} alt={`${companion.name}, ${companion.age}, ${companion.role}`} loading="lazy" />
                  <span className="velvet-card-status"><i /> Available to chat</span>
                  <span className="velvet-card-heart"><Heart size={15} /></span>
                </button>
                <div className="velvet-card-content">
                  <div className="velvet-card-title">
                    <div><h3>{companion.name}<span>, {companion.age}</span></h3><p>{companion.role}</p></div>
                    <span className="velvet-card-sparkle"><Sparkles size={16} /></span>
                  </div>
                  <p className="velvet-card-description">{companion.description}</p>
                  <div className="velvet-card-tags">{companion.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                  <button className="velvet-card-cta" type="button" onClick={() => openChat(companion)}>
                    Say hello <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            ))}
            {visibleCompanions.length === 0 && (
              <div className="velvet-empty-state"><Search size={22} /><strong>No one by that name just yet.</strong><span>Try a different search or personality.</span></div>
            )}
          </div>
        </section>

        <section className="velvet-how" id="how-it-works">
          <div className="velvet-how-heading">
            <p className="velvet-eyebrow"><span className="velvet-eyebrow-line" /> ALWAYS YOUR CHOICE</p>
            <h2>Closeness, on <em>your terms.</em></h2>
            <p>You’re in control from the very first hello.</p>
          </div>
          <div className="velvet-how-grid">
            <article><span className="velvet-how-number">01</span><span className="velvet-how-icon"><Heart size={19} /></span><h3>Choose your connection</h3><p>Find a fictional companion whose personality feels like your kind of company.</p></article>
            <article><span className="velvet-how-number">02</span><span className="velvet-how-icon"><SlidersHorizontal size={19} /></span><h3>Set the mood</h3><p>Keep it sweet, playful, or romantic. Set boundaries that feel comfortable.</p></article>
            <article><span className="velvet-how-number">03</span><span className="velvet-how-icon"><MessageCircle size={19} /></span><h3>Enjoy the moment</h3><p>Share a conversation at your pace. You can pause or leave whenever you want.</p></article>
          </div>
          <div className="velvet-how-footer"><ShieldCheck size={15} /> A fictional, scripted demo—no real people, no pressure, no explicit content.</div>
        </section>

        <section className="velvet-bottom-cta">
          <div className="velvet-bottom-glow" />
          <span className="velvet-cta-icon"><Heart fill="currentColor" size={17} /></span>
          <p className="velvet-eyebrow">YOUR NEXT GOOD CONVERSATION</p>
          <h2>Whenever you’re <em>ready.</em></h2>
          <a href="#companions" className="velvet-button velvet-button-light">Find your person <ArrowRight size={16} /></a>
          <p className="velvet-bottom-note"><LockKeyhole size={12} /> Take your time. This space is yours.</p>
        </section>
      </main>

      <footer className="velvet-footer">
        <a className="velvet-brand" href="#home"><span className="velvet-brand-mark"><Heart fill="currentColor" /></span><span>velvet<span className="velvet-brand-dot">.</span></span></a>
        <p>Made for good conversations and gentle butterflies.</p>
        <div><span>18+ only</span><i /> <span>Fictional companions</span><i /> <button type="button" onClick={() => setShowBoundaries(true)}>Your boundaries</button></div>
        <small>Demo experience · Companion replies are scripted and do not connect to an AI service.</small>
      </footer>

      {!ageConfirmed && (
        <div className="velvet-age-overlay" role="dialog" aria-modal="true" aria-labelledby="velvet-age-title">
          <div className="velvet-age-card">
            <span className="velvet-age-mark"><Heart fill="currentColor" /></span>
            <p className="velvet-eyebrow">A PRIVATE LITTLE CORNER</p>
            <h2 id="velvet-age-title">A space for <em>adults only.</em></h2>
            <p>Velvet is designed for adults 18 and over. The experience is fictional, romantic, and non-explicit.</p>
            <button type="button" className="velvet-button velvet-button-primary" onClick={confirmAge}>I’m 18 or older <ArrowRight size={16} /></button>
            <span className="velvet-age-privacy"><LockKeyhole size={12} /> Your age confirmation stays on this device for this session.</span>
          </div>
        </div>
      )}

      {activeCompanion && (
        <div className="velvet-chat-overlay" role="dialog" aria-modal="true" aria-labelledby="velvet-chat-title">
          <div className="velvet-chat-panel">
            <div className="velvet-chat-topbar">
              <button type="button" className="velvet-icon-button velvet-back-button" onClick={() => setActiveCompanion(null)} aria-label="Close conversation"><ArrowLeft size={18} /></button>
              <div className="velvet-chat-person">
                <img src={activeCompanion.image} alt="" />
                <span><strong id="velvet-chat-title">{activeCompanion.name}</strong><small><i /> Here with you</small></span>
              </div>
              <div className="velvet-chat-actions">
                <button type="button" className="velvet-icon-button" aria-label="Conversation settings" onClick={() => setShowBoundaries(true)}><SlidersHorizontal size={17} /></button>
                <div className="velvet-more-wrap">
                  <button type="button" className="velvet-icon-button" aria-label="More conversation options" onClick={() => setShowMore((open) => !open)}><MoreHorizontal size={19} /></button>
                  {showMore && <div className="velvet-more-menu"><button type="button" onClick={() => { setMessages([{ id: Date.now(), from: 'companion', text: activeCompanion.greeting, time: timeNow() }]); setShowMore(false); }}>Start fresh</button><button type="button" onClick={() => { setActiveCompanion(null); setShowMore(false); }}>End conversation</button></div>}
                </div>
                <button type="button" className="velvet-icon-button velvet-close-chat" onClick={() => setActiveCompanion(null)} aria-label="Close conversation"><X size={18} /></button>
              </div>
            </div>
            <div className="velvet-chat-context"><ShieldCheck size={13} /> Fictional companion · Take a break or leave whenever you like</div>
            <div className="velvet-chat-body">
              <div className="velvet-chat-date"><span /> TODAY <span /></div>
              <div className="velvet-chat-welcome"><span className="velvet-chat-welcome-icon"><Heart fill="currentColor" size={16} /></span><strong>A moment with {activeCompanion.name}</strong><span>Just the two of you. Take it at your pace.</span></div>
              <div className="velvet-messages" aria-live="polite">
                {messages.map((message) => (
                  <div className={`velvet-message velvet-message-${message.from}`} key={message.id}>
                    {message.from === 'companion' && <img src={activeCompanion.image} alt="" />}
                    <div><p>{message.text}</p><time>{message.time}</time></div>
                  </div>
                ))}
              </div>
              {messages.length < 2 && <div className="velvet-starters"><span>TRY SAYING</span>{STARTERS.map((starter) => <button type="button" key={starter} onClick={() => addStarter(starter)}>{starter} <ArrowRight size={12} /></button>)}</div>}
            </div>
            <div className="velvet-chat-compose">
              <div className="velvet-tone-row">
                <label htmlFor="velvet-tone">Conversation tone</label>
                <span className="velvet-tone-select"><select id="velvet-tone" value={tone} onChange={(event) => setTone(event.target.value)}><option>Sweet</option><option>Playful</option><option>Romantic</option></select><ChevronDown size={13} /></span>
                <button type="button" className="velvet-boundary-shortcut" onClick={() => setShowBoundaries(true)}><ShieldCheck size={13} /> Your boundaries</button>
              </div>
              <form className="velvet-message-form" onSubmit={sendMessage}>
                <input ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Message ${activeCompanion.name}...`} aria-label={`Message ${activeCompanion.name}`} />
                <button type="submit" disabled={!draft.trim()} aria-label="Send message"><Send size={17} /></button>
              </form>
              <p className="velvet-compose-foot"><span><LockKeyhole size={11} /> Private demo conversation</span><span>Keep it kind, keep it comfortable</span></p>
            </div>
          </div>
        </div>
      )}

      {showBoundaries && (
        <div className="velvet-boundary-overlay" role="dialog" aria-modal="true" aria-labelledby="velvet-boundary-title">
          <div className="velvet-boundary-panel">
            <div className="velvet-boundary-heading">
              <span className="velvet-boundary-icon"><ShieldCheck size={20} /></span>
              <button type="button" className="velvet-icon-button" onClick={() => setShowBoundaries(false)} aria-label="Close boundaries"><X size={18} /></button>
            </div>
            <p className="velvet-eyebrow">YOUR COMFORT, ALWAYS</p>
            <h2 id="velvet-boundary-title">Set your <em>boundaries.</em></h2>
            <p className="velvet-boundary-intro">Choose what feels right for you. You can change these at any time.</p>
            {['Keep it romantic', 'Keep it playful', 'No pressure', 'Take things slowly', 'Keep it non-explicit'].map((boundary) => {
              const checked = boundaries.includes(boundary);
              return <button type="button" className={`velvet-boundary-option ${checked ? 'is-checked' : ''}`} key={boundary} onClick={() => toggleBoundary(boundary)} aria-pressed={checked}><span>{boundary}</span><span className="velvet-checkbox">{checked && <Check size={13} />}</span></button>;
            })}
            <div className="velvet-boundary-assurance"><LockKeyhole size={13} /> Your selections stay in this session only.</div>
            <button type="button" className="velvet-button velvet-button-primary velvet-boundary-done" onClick={() => setShowBoundaries(false)}>Done <Check size={15} /></button>
          </div>
        </div>
      )}

      <button type="button" className="velvet-help-button" aria-label="View experience information" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
        <CircleHelp size={17} />
      </button>
    </div>
  );
};
