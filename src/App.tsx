import { useEffect, useMemo, useState } from 'react';

type SectionKey =
  | 'dashboard'
  | 'analyze'
  | 'chat'
  | 'formation'
  | 'players'
  | 'builder'
  | 'matches'
  | 'profile';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type FormationOption = {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  style: string;
  positions: { left: number; top: number; label: string }[];
};

type Recommendation = {
  name: string;
  position: string;
  attribute: string;
  reason: string;
  chemistry: string;
  price?: string;
};

type MatchRecord = {
  opponent: string;
  score: string;
  formation: string;
  result: 'Win' | 'Draw' | 'Loss';
  notes: string;
};

type AnalysisReport = {
  overall: string;
  strengths: string[];
  weaknesses: string[];
  formation: string;
  upgrades: string[];
  tactics: string[];
  score: number;
  notes: string;
};

const navItems: { key: SectionKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'analyze', label: 'Analyze My Squad' },
  { key: 'chat', label: 'JEBAT AI Chat' },
  { key: 'formation', label: 'Formation Advisor' },
  { key: 'players', label: 'Player Recommendations' },
  { key: 'builder', label: 'Squad Builder' },
  { key: 'matches', label: 'Match Analysis' },
  { key: 'profile', label: 'My Profile' },
];

const formations: FormationOption[] = [
  {
    name: '4-3-3',
    description: 'Balanced width with aggressive press and front three.',
    strengths: ['High width', 'Fast breaks', 'Strong central overload'],
    weaknesses: ['Can be exposed on the flanks', 'Requires energetic fullbacks'],
    style: 'Balanced play',
    positions: [
      { left: 10, top: 47, label: 'LB' },
      { left: 30, top: 24, label: 'CB' },
      { left: 30, top: 72, label: 'CB' },
      { left: 52, top: 47, label: 'RB' },
      { left: 28, top: 47, label: 'CM' },
      { left: 49, top: 30, label: 'CAM' },
      { left: 49, top: 66, label: 'CAM' },
      { left: 70, top: 47, label: 'RW' },
      { left: 79, top: 26, label: 'ST' },
      { left: 79, top: 70, label: 'ST' },
      { left: 90, top: 47, label: 'LW' },
    ],
  },
  {
    name: '4-2-3-1',
    description: 'Compact structure that supports possession and central control.',
    strengths: ['Strong midfield shield', 'Good through balls', 'Easy to defend transitions'],
    weaknesses: ['Less width', 'Needs quality wing play'],
    style: 'Possession play',
    positions: [
      { left: 10, top: 47, label: 'LB' },
      { left: 28, top: 22, label: 'CB' },
      { left: 28, top: 72, label: 'CB' },
      { left: 50, top: 47, label: 'RB' },
      { left: 33, top: 47, label: 'CDM' },
      { left: 67, top: 47, label: 'CDM' },
      { left: 49, top: 22, label: 'CAM' },
      { left: 49, top: 72, label: 'RW' },
      { left: 74, top: 47, label: 'LW' },
      { left: 84, top: 47, label: 'ST' },
    ],
  },
  {
    name: '4-4-2',
    description: 'Classic shape for direct transitions and efficient defensive compactness.',
    strengths: ['Solid lines', 'Wide support', 'Strong set-piece threat'],
    weaknesses: ['Less central creativity', 'Can be pinned back by press'],
    style: 'Counter attack',
    positions: [
      { left: 10, top: 47, label: 'LB' },
      { left: 28, top: 22, label: 'CB' },
      { left: 28, top: 72, label: 'CB' },
      { left: 52, top: 47, label: 'RB' },
      { left: 32, top: 26, label: 'LM' },
      { left: 32, top: 68, label: 'CM' },
      { left: 67, top: 26, label: 'RM' },
      { left: 67, top: 68, label: 'CM' },
      { left: 82, top: 47, label: 'ST' },
      { left: 90, top: 47, label: 'ST' },
    ],
  },
  {
    name: '3-5-2',
    description: 'Wing-back system that stretches the pitch and attacks the half spaces.',
    strengths: ['Superb width', 'Strong overloads', 'High pressing'],
    weaknesses: [' Vulnerable to central counters', 'Needs disciplined wing-backs'],
    style: 'High pressing',
    positions: [
      { left: 18, top: 50, label: 'CB' },
      { left: 38, top: 26, label: 'CB' },
      { left: 38, top: 75, label: 'CB' },
      { left: 25, top: 15, label: 'LWB' },
      { left: 25, top: 85, label: 'RWB' },
      { left: 46, top: 47, label: 'CM' },
      { left: 60, top: 47, label: 'CM' },
      { left: 70, top: 18, label: 'LW' },
      { left: 70, top: 82, label: 'RW' },
      { left: 87, top: 47, label: 'ST' },
    ],
  },
];

const samplePlayers = [
  'Hakimi',
  'Ramos',
  'Van Dijk',
  'Kimmich',
  'Pedri',
  'De Bruyne',
  'Salah',
  'Lewandowski',
  'Haaland',
  'Aimar',
  'Zubimendi',
  'Tchouameni',
  'Foden',
  'Gakpo',
  'Gimenez',
  'Martinez',
  'Guendouzi',
  'Mubama',
];

const recommendations: Recommendation[] = [
  {
    name: 'Victor Osimhen',
    position: 'ST',
    attribute: 'Finishing, acceleration, movement',
    reason: 'Perfect for quick transition attacks and a direct line to goal.',
    chemistry: 'High chemistry with pacy wide creators and high-tempo midfielders.',
    price: 'Approx. 90K-125K',
  },
  {
    name: 'Achraf Hakimi',
    position: 'RB',
    attribute: 'Pace, dribbling, recovery',
    reason: 'Adds width to a 4-3-3 and helps with underlapping runs.',
    chemistry: 'Strong fit in a balanced side with a central midfielder shield.',
    price: 'Approx. 78K-103K',
  },
  {
    name: 'Rodri',
    position: 'CDM',
    attribute: 'Passing, interceptions, composure',
    reason: 'Improves midfield control and protects the back line against transitions.',
    chemistry: 'Ideal for possession and compact 4-2-3-1 setups.',
    price: 'Approx. 100K-150K',
  },
  {
    name: 'Bukayo Saka',
    position: 'RW',
    attribute: 'Dribbling, tempo, final third creativity',
    reason: 'Delivers direct threat and width when you want to attack the box.',
    chemistry: 'Works best with a central striker and a creative playmaker behind him.',
    price: 'Approx. 85K-110K',
  },
  {
    name: 'Ruben Dias',
    position: 'CB',
    attribute: 'Aerial dominance, concentration, composure',
    reason: 'Reduces defensive risk when your side is defending wide areas.',
    chemistry: 'Strong partner for a pacy fullback or aggressive wing-back system.',
    price: 'Approx. 70K-95K',
  },
];

const defaultChat: ChatMessage[] = [
  {
    role: 'assistant',
    content:
      'Selamat datang, bos! Aku JEBAT. Upload squad kau atau tanya formasi, dan aku akan bantu susun taktikal dengan jelas.',
  },
];

const initialProfile = {
  name: 'Aiman Rahman',
  rank: 'Elite Coach',
  preferredStyle: 'Balanced play',
  language: 'BM',
};

const initialMatchHistory: MatchRecord[] = [
  { opponent: 'Haziq', score: '2-1', formation: '4-3-3', result: 'Win', notes: 'Good press and quick switches.' },
  { opponent: 'Nabil', score: '0-2', formation: '4-2-3-1', result: 'Loss', notes: 'Need wider midfield support and stronger transitions.' },
  { opponent: 'Adib', score: '1-1', formation: '4-4-2', result: 'Draw', notes: 'Solid shape but lacked finishing.' },
];

const getFormationsByStyle = (style: string) => {
  const lower = style.toLowerCase();
  if (lower.includes('counter')) return ['4-4-2', '4-3-3'];
  if (lower.includes('possession')) return ['4-2-3-1', '4-1-2-1-2'];
  if (lower.includes('press')) return ['3-5-2', '4-3-3'];
  if (lower.includes('wing')) return ['3-5-2', '4-3-3'];
  return ['4-3-3', '4-2-3-1', '4-4-2'];
};

function App() {
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard');
  const [profile, setProfile] = useState(initialProfile);
  const [selectedFormation, setSelectedFormation] = useState('4-3-3');
  const [teamStyle, setTeamStyle] = useState('Balanced play');
  const [budget, setBudget] = useState(100000);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(defaultChat);
  const [inputValue, setInputValue] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>(initialMatchHistory);
  const [savedSquads, setSavedSquads] = useState<string[]>(['Main 4-3-3', 'Counter 4-4-2']);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const saved = localStorage.getItem('jebat-squad');
    if (saved) {
      const parsed = JSON.parse(saved) as { report: AnalysisReport };
      if (parsed.report) setAnalysisReport(parsed.report);
    }
  }, []);

  useEffect(() => {
    if (analysisReport) {
      localStorage.setItem('jebat-squad', JSON.stringify({ report: analysisReport }));
    }
  }, [analysisReport]);

  const recommendedFormationList = useMemo(() => getFormationsByStyle(teamStyle), [teamStyle]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const runAnalysis = () => {
    const visiblePlayers = samplePlayers.slice(0, 8);
    const score = Math.min(96, 74 + visiblePlayers.length);

    const report: AnalysisReport = {
      overall:
        'Kekuatan utama squad ini adalah pressing tinggi, kadar pergerakan dan serangan dari sayap. Namun, anda masih perlu lebih kuat di ruang tengah dan menambah ketegasan di belakang jika mahu menahan counter attack yang pantas.',
      strengths: [
        'Kebolehan serangan mengecut dari sayap dan kombinasi akhir yang cepat.',
        'Terdapat pemain dengan kadar intensiti tinggi untuk menekan tinggi.',
        'Pembahagian tugas dalam midfield cukup jelas walaupun tidak sepenuhnya stabil.',
      ],
      weaknesses: [
        'Sisi kanan dan kiri memerlukan sokongan lebih banyak untuk menutup ruang.',
        'Pusat padang masih agak mudah dibebani jika lawan menekan pantas.',
        'Cadangan upgrade putuskan game, terutama penyerang kedua yang lebih kuat di udara.',
      ],
      formation: selectedFormation,
      upgrades: [
        'Tambahkan pemain tengah bertahan yang kuat dalam pergerakan dan penyelesaian.',
        'Dapatkan penyerang yang lebih berani di ruang depan jika mahu lebih banyak peluang.',
        'Upgrade fullback yang lebih cekap ketika melindungi ruang dalam.',
      ],
      tactics: [
        'Gunakan pressing yang dimulakan dari penyerang supaya pemain tengah tidak dipaksa ke belakang.',
        'Pastikan ruang antara CB dan fullback sentiasa bercantum.',
        'Jadikan salah satu winger menyerang dalam dan satu lagi menunggu ruang untuk counter.',
      ],
      score,
      notes:
        'Ini adalah penilaian AI secara umum, bukan rating rasmi EA SPORTS FC. Nilainya berdasarkan visual squad, formasi, keseimbangan dan kecenderungan taktikal yang kelihatan.',
    };

    setAnalysisReport(report);
    setActiveSection('analyze');
  };

  const handleChatSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const lower = trimmed.toLowerCase();

    let answer =
      'Bos, aktik utama ialah jaga ruang di belakang dan pastikan tiada longkang besar antara line. Aku boleh bantu susun taktikal ikut squad kau. Upload gambar pasukan dulu kalau mahu aku review secara lebih tepat.';

    if (lower.includes('counter') || lower.includes('haziq')) {
      answer =
        'Kalau lawan suka counter attack, kita kena jaga ruang belakang. Cuba formasi yang ada dua pemain tengah bertahan dan pastikan fullback tidak naik terlalu tinggi. Aku boleh susun taktikal ikut squad kau. Upload gambar pasukan dulu supaya aku baca struktur sebenar.';
    }

    if (lower.includes('striker') || lower.includes('penyerang')) {
      answer =
        'Untuk striker, cari pemain yang kuat dalam ruang terhad, pecutan, dan finishing. Kalau squad kau ramai tengah, pilih striker yang ready untuk disorong kepada ruang depan dan boleh buka ruang untuk winger.';
    }

    if (lower.includes('budget') || lower.includes('100k') || lower.includes('100k')) {
      answer =
        'Dengan budget 100K, fokus pada dua atau tiga upgrade penting: pemain tengah bertahan, penyerang yang cepat atau winger yang membantu serangan. Jangan beli terlalu banyak pemain yang tidak jelas fungsi mereka dalam formasi.';
    }

    if (lower.includes('formation') || lower.includes('formasi')) {
      answer = `Berdasarkan gaya ${teamStyle.toLowerCase()}, aku galakkan ${recommendedFormationList[0]} atau ${recommendedFormationList[1]}. Cari keseimbangan antara ruang di tengah dan kelajuan sayap.`;
    }

    setChatMessages((prev) => [...prev, userMessage, { role: 'assistant', content: answer }]);
    setInputValue('');
  };

  const handleAddMatch = () => {
    const newRecord: MatchRecord = {
      opponent: 'Friend Match',
      score: '3-2',
      formation: selectedFormation,
      result: 'Win',
      notes: 'Strong pressing and excellent late-game control.',
    };
    setMatchHistory((prev) => [newRecord, ...prev]);
  };

  const handleSaveSquad = () => {
    const next = `Squad ${savedSquads.length + 1} - ${selectedFormation}`;
    setSavedSquads((prev) => [next, ...prev]);
  };

  const stats = useMemo(() => {
    const wins = matchHistory.filter((match) => match.result === 'Win').length;
    const draws = matchHistory.filter((match) => match.result === 'Draw').length;
    const losses = matchHistory.filter((match) => match.result === 'Loss').length;
    return { wins, draws, losses };
  }, [matchHistory]);

  return (
    <div className="app-shell text-white">
      <div className="mx-auto max-w-7xl px-3 pb-28 pt-6 sm:px-5 lg:px-8">
        <header className="glass-panel sticky top-4 z-30 mb-6 rounded-[24px] border border-white/10 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-greenGlow/80">EAFC27 JEBAT</p>
              <h1 className="mt-1 text-xl font-black sm:text-2xl">BUILD YOUR SQUAD. MASTER YOUR TACTICS.</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="rounded-full border border-greenGlow/40 bg-greenGlow/10 px-4 py-2 text-xs font-semibold text-greenGlow"
                onClick={() => setAuthMode('login')}
              >
                {isLoggedIn ? 'Profile' : 'Login'}
              </button>
              <button
                className="rounded-full bg-[#A3FF69] px-4 py-2 text-xs font-black text-[#071B13] shadow-neon"
                onClick={() => setIsLoggedIn((prev) => !prev)}
              >
                {isLoggedIn ? 'Logout' : 'Register'}
              </button>
            </div>
          </div>
        </header>

        {!isLoggedIn ? (
          <section className="glass-panel mb-6 rounded-[26px] p-5 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="mb-4 text-xs uppercase tracking-[0.35em] text-greenGlow">AI FOOTBALL COACH & SQUAD ANALYZER</p>
                <h2 className="max-w-xl text-3xl font-black sm:text-5xl">EAFC27 JEBAT</h2>
                <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
                  Selamat datang, bos! Aku JEBAT, jurulatih AI peribadi kau. Upload squad, tanya formasi atau cari pemain terbaik. Jom kita bina pasukan yang susah dikalahkan!
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="rounded-full bg-[#A3FF69] px-5 py-3 font-black text-[#071B13] shadow-neon">
                    Upload Squad
                  </button>
                  <button className="rounded-full border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white">
                    Explore Features
                  </button>
                </div>
              </div>

              <div className="rounded-[24px] border border-greenGlow/25 bg-[#0d2a1d]/80 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">{authMode === 'login' ? 'Masuk ke JEBAT' : 'Daftar akaun baru'}</h3>
                  <button
                    className="text-xs uppercase tracking-[0.2em] text-greenGlow"
                    onClick={() => setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'))}
                  >
                    {authMode === 'login' ? 'Register' : 'Login'}
                  </button>
                </div>
                <div className="space-y-3">
                  <input className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none" placeholder="Email" />
                  <input className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none" placeholder="Password" type="password" />
                  {authMode === 'register' && (
                    <input className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none" placeholder="Nama penuh" />
                  )}
                  <button
                    className="w-full rounded-xl bg-[#A3FF69] px-4 py-3 font-black text-[#071B13]"
                    onClick={() => setIsLoggedIn(true)}
                  >
                    {authMode === 'login' ? 'Masuk' : 'Daftar'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <nav className="mb-6 flex flex-wrap gap-3">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`rounded-full px-4 py-2 text-[12px] font-semibold transition ${
                activeSection === item.key
                  ? 'bg-[#A3FF69] text-[#071B13] shadow-neon'
                  : 'border border-white/10 bg-white/5 text-white/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {activeSection === 'dashboard' && (
          <section className="grid gap-5 lg:grid-cols-3">
            <div className="glass-panel rounded-[28px] p-5 lg:col-span-2">
              <p className="text-xs uppercase tracking-[0.3em] text-greenGlow">Dashboard</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-white/60">Squad score</p>
                  <p className="mt-2 text-3xl font-black text-greenGlow">{analysisReport?.score ?? 82}</p>
                  <p className="mt-1 text-xs text-white/60">AI assessment</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-white/60">Win rate</p>
                  <p className="mt-2 text-3xl font-black text-gold">{Math.max(1, stats.wins + stats.draws + stats.losses) > 0 ? Math.round((stats.wins / (stats.wins + stats.draws + stats.losses)) * 100) : 0}%</p>
                  <p className="mt-1 text-xs text-white/60">Recent matches</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-white/60">Saved squads</p>
                  <p className="mt-2 text-3xl font-black text-white">{savedSquads.length}</p>
                  <p className="mt-1 text-xs text-white/60">Live in profile</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-bold">Recommended direction</h3>
                <div className="mt-3 rounded-2xl border border-greenGlow/25 bg-[#133a28]/70 p-4 text-sm text-white/80">
                  <p>
                    {analysisReport?.overall ?? 'Gunakan formasi 4-3-3 untuk keseimbangan serangan dan pertahanan. Pastikan winger memegang lebar dan satu pemain tengah bertahan sentiasa menutup ruang.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-greenGlow">Quick actions</p>
              <div className="mt-4 space-y-3">
                <button onClick={() => setActiveSection('analyze')} className="w-full rounded-2xl bg-[#A3FF69] px-4 py-3 font-black text-[#071B13]">
                  Analyze My Squad
                </button>
                <button onClick={() => setActiveSection('chat')} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white">
                  Open JEBAT Coach
                </button>
                <button onClick={() => setActiveSection('formation')} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white">
                  Formation Advisor
                </button>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'analyze' && (
          <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="glass-panel rounded-[28px] p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-greenGlow">AI Squad Image Analyzer</p>
              <div className="mt-4 rounded-[22px] border border-dashed border-greenGlow/50 bg-[#0c221b] p-4">
                <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[18px] border border-white/10 bg-white/5 p-8 text-center">
                  <span className="text-greenGlow">Upload squad screenshot</span>
                  <span className="text-sm text-white/70">PNG, JPG, WEBP</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              <div className="mt-4 flex gap-3">
                <button className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold">
                  Camera capture
                </button>
                <button onClick={runAnalysis} className="flex-1 rounded-xl bg-[#A3FF69] px-4 py-3 font-black text-[#071B13]">
                  Analyze now
                </button>
              </div>

              {imagePreview && (
                <div className="mt-5 overflow-hidden rounded-[22px] border border-greenGlow/25">
                  <img src={imagePreview} alt="Squad preview" className="h-64 w-full object-cover" />
                </div>
              )}
            </div>

            <div className="glass-panel rounded-[28px] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.3em] text-greenGlow">JEBAT AI SQUAD REPORT</p>
                <span className="rounded-full border border-greenGlow/25 bg-greenGlow/10 px-3 py-1 text-xs font-bold text-greenGlow">
                  AI assessment
                </span>
              </div>

              {analysisReport ? (
                <div className="mt-5 space-y-5">
                  <div className="rounded-2xl border border-white/10 bg-[#0f2a20]/80 p-4">
                    <p className="text-sm text-white/60">Overall squad</p>
                    <p className="mt-2 text-xl font-bold text-white">{analysisReport.overall}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-white/60">Strengths</p>
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/80">
                        {analysisReport.strengths.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-white/60">Weaknesses</p>
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/80">
                        {analysisReport.weaknesses.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-white/60">Recommended formation</p>
                      <p className="mt-2 text-2xl font-black text-[#A3FF69]">{analysisReport.formation}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-white/60">Estimated squad score</p>
                      <p className="mt-2 text-3xl font-black text-gold">{analysisReport.score}/100</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-white/60">Suggested upgrades</p>
                    <ul className="mt-3 space-y-2 text-sm text-white/80">
                      {analysisReport.upgrades.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-white/60">Tactical improvements</p>
                    <ul className="mt-3 space-y-2 text-sm text-white/80">
                      {analysisReport.tactics.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  </div>

                  <p className="text-xs text-white/60">{analysisReport.notes}</p>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-black/10 p-10 text-center text-white/60">
                  Upload screenshot and klik Analyze now untuk dapatkan laporan JEBAT.
                </div>
              )}
            </div>
          </section>
        )}

        {activeSection === 'chat' && (
          <section className="glass-panel rounded-[28px] p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-greenGlow">JEBAT AI Chat</p>
                <h3 className="mt-2 text-2xl font-black">Coach conversation</h3>
              </div>
              <div className="rounded-full border border-greenGlow/20 bg-greenGlow/10 px-3 py-1 text-xs text-greenGlow">
                Bahasa Melayu / English
              </div>
            </div>

            <div className="chat-scroll max-h-[480px] space-y-3 overflow-y-auto rounded-[22px] border border-white/10 bg-black/15 p-4">
              {chatMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    message.role === 'assistant'
                      ? 'bg-[#0f2a20] text-white'
                      : 'ml-auto bg-[#A3FF69] text-[#071B13]'
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleChatSend();
                }}
                className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none"
                placeholder="Tanya JEBAT, contoh: JEBAT, aku selalu kalah dengan Haziq..."
              />
              <button onClick={handleChatSend} className="rounded-2xl bg-[#A3FF69] px-5 py-3 font-black text-[#071B13]">
                Send
              </button>
            </div>
          </section>
        )}

        {activeSection === 'formation' && (
          <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="glass-panel rounded-[28px] p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-greenGlow">AI Formation Advisor</p>
              <div className="mt-4 space-y-3">
                <label className="block text-sm text-white/70">Attack style</label>
                <select value={teamStyle} onChange={(event) => setTeamStyle(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 outline-none">
                  <option>Balanced play</option>
                  <option>Possession play</option>
                  <option>Counter attack</option>
                  <option>High pressing</option>
                  <option>Wing play</option>
                </select>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/60">JEBAT recommendation</p>
                  <p className="mt-2 text-lg font-bold text-[#A3FF69]">
                    {recommendedFormationList[0]} or {recommendedFormationList[1]}
                  </p>
                  <p className="mt-2 text-sm text-white/75">
                    {teamStyle === 'Counter attack' && 'Buat ruang untuk pemain cepat dan pastikan pemain tengah menutup lorong tengah.'}
                    {teamStyle === 'Possession play' && 'Gunakan permainan centric dan pilih dua midfielders yang boleh menerima bola di bawah tekanan.'}
                    {teamStyle === 'High pressing' && 'Pastikan ruang belakang tidak terdedah dan tiada longkang besar di bawah fullback.'}
                    {teamStyle === 'Wing play' && 'Minta fullback menampung lewat kedalaman dan gunakan winger untuk cutback.'}
                    {teamStyle === 'Balanced play' && 'Gunakan struktur 4-3-3 dengan ruang dalam yang seimbang dan ruang yang dimanage dengan baik.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-black">Visual pitch</h3>
                <button className="rounded-full border border-greenGlow/20 bg-greenGlow/10 px-3 py-1 text-xs font-semibold text-greenGlow">
                  {selectedFormation}
                </button>
              </div>

              <div className="pitch-visual h-[430px] p-4">
                <div className="field-line absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 border-l"></div>
                <div className="field-line absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full border"></div>
                <div className="field-line absolute left-0 top-1/2 h-[200px] w-[200px] -translate-y-1/2 rounded-full border"></div>
                <div className="field-line absolute right-0 top-1/2 h-[200px] w-[200px] -translate-y-1/2 rounded-full border"></div>

                {formations
                  .filter((formation) => formation.name === selectedFormation)
                  .map((formation) =>
                    formation.positions.map((position) => (
                      <div
                        key={`${formation.name}-${position.label}`}
                        className="player-node"
                        style={{ left: `${position.left}%`, top: `${position.top}%` }}
                      >
                        {position.label}
                      </div>
                    )),
                  )}
              </div>

              {formations
                .filter((formation) => formation.name === selectedFormation)
                .map((formation) => (
                  <div key={formation.name} className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-white/60">Strengths</p>
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/80">
                        {formation.strengths.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-white/60">Weaknesses</p>
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/80">
                        {formation.weaknesses.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {activeSection === 'players' && (
          <section className="glass-panel rounded-[28px] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-greenGlow">AI Player Recommendation</p>
                <h3 className="mt-2 text-2xl font-black">Best picks for your squad</h3>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
                Budget: <span className="font-bold text-greenGlow">{budget.toLocaleString()} coins</span>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommendations.map((player) => (
                <div key={player.name} className="rounded-[22px] border border-white/10 bg-[#0d231a]/90 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-black">{player.name}</h4>
                      <p className="text-sm text-white/60">{player.position}</p>
                    </div>
                    <span className="rounded-full bg-greenGlow/10 px-2 py-1 text-[10px] font-bold text-greenGlow">
                      {player.price ?? 'Price needs verification'}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-white/70">
                    <span className="font-semibold text-white">Attributes:</span> {player.attribute}
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    <span className="font-semibold text-white">Reason:</span> {player.reason}
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    <span className="font-semibold text-white">Chemistry:</span> {player.chemistry}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'builder' && (
          <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="glass-panel rounded-[28px] p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-greenGlow">AI Squad Builder</p>
              <div className="mt-4 space-y-4">
                <select value={selectedFormation} onChange={(event) => setSelectedFormation(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 outline-none">
                  {formations.map((formation) => (
                    <option key={formation.name}>{formation.name}</option>
                  ))}
                </select>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/60">Available squad spots</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {samplePlayers.slice(0, 8).map((player) => (
                      <button key={player} className="rounded-full border border-greenGlow/25 bg-greenGlow/10 px-3 py-1 text-xs text-greenGlow">
                        {player}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleSaveSquad} className="w-full rounded-xl bg-[#A3FF69] px-4 py-3 font-black text-[#071B13]">
                  Save squad version
                </button>
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-5 sm:p-6">
              <div className="pitch-visual h-[420px] p-4">
                <div className="field-line absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 border-l"></div>
                <div className="field-line absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full border"></div>

                {formations
                  .filter((formation) => formation.name === selectedFormation)
                  .map((formation) =>
                    formation.positions.map((position, index) => (
                      <div
                        key={`${formation.name}-${position.label}`}
                        className="player-node"
                        style={{ left: `${position.left}%`, top: `${position.top}%` }}
                      >
                        {samplePlayers[index % samplePlayers.length].slice(0, 2).toUpperCase()}
                      </div>
                    )),
                  )}
              </div>
            </div>
          </section>
        )}

        {activeSection === 'matches' && (
          <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="glass-panel rounded-[28px] p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-greenGlow">AI Match Analyzer</p>
              <div className="mt-4 space-y-3">
                <input className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 outline-none" placeholder="Opponent name" />
                <input className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 outline-none" placeholder="Final score" />
                <select value={selectedFormation} onChange={(event) => setSelectedFormation(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 outline-none">
                  {formations.map((formation) => <option key={formation.name}>{formation.name}</option>)}
                </select>
                <textarea className="min-h-[110px] w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 outline-none" placeholder="Notes about opponent tactics" />
                <button onClick={handleAddMatch} className="w-full rounded-xl bg-[#A3FF69] px-4 py-3 font-black text-[#071B13]">
                  Save match result
                </button>
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-black">Performance trends</h3>
                <span className="rounded-full border border-greenGlow/20 bg-greenGlow/10 px-3 py-1 text-[10px] font-bold text-greenGlow">
                  Head-to-head tracker
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-white/60">Wins</p>
                  <p className="mt-2 text-3xl font-black text-greenGlow">{stats.wins}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-white/60">Draws</p>
                  <p className="mt-2 text-3xl font-black text-gold">{stats.draws}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-white/60">Losses</p>
                  <p className="mt-2 text-3xl font-black text-red-400">{stats.losses}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {matchHistory.map((match) => (
                  <div key={`${match.opponent}-${match.score}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold">{match.opponent}</p>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                        match.result === 'Win'
                          ? 'bg-greenGlow/10 text-greenGlow'
                          : match.result === 'Draw'
                            ? 'bg-gold/10 text-gold'
                            : 'bg-red-500/10 text-red-300'
                      }`}>
                        {match.result}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-white/70">
                      Score: {match.score} • Formation: {match.formation}
                    </p>
                    <p className="mt-2 text-sm text-white/60">{match.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeSection === 'profile' && (
          <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="glass-panel rounded-[28px] p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-greenGlow">My Profile</p>
              <div className="mt-5 rounded-[22px] border border-white/10 bg-[#0f2b23] p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#A3FF69] text-lg font-black text-[#071B13]">
                    {profile.name.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{profile.name}</h3>
                    <p className="text-sm text-white/70">{profile.rank}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-4 text-sm text-white/80">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span>Preferred style</span>
                    <span className="font-semibold text-greenGlow">{profile.preferredStyle}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span>Language</span>
                    <span className="font-semibold text-white">{profile.language}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-greenGlow">Saved squad history</p>
              <div className="mt-5 space-y-3">
                {savedSquads.map((squad) => (
                  <div key={squad} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    <span>{squad}</span>
                    <button className="text-greenGlow">Open</button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#081d16]/90 px-4 py-3 backdrop-blur-md sm:hidden">
        <div className="mx-auto flex max-w-md justify-between gap-2 text-[11px] text-white/80">
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`flex-1 rounded-xl px-2 py-3 ${activeSection === item.key ? 'bg-[#A3FF69] text-[#071B13]' : 'bg-white/5'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
