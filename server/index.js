import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function safeBoolean(value?: string) {
  return Boolean(value && value.trim() && value !== 'replace-with-real-key');
}

app.get('/api/health', (_, res) => {
  const configured = safeBoolean(process.env.OPENAI_API_KEY) || safeBoolean(process.env.VITE_SUPABASE_URL);
  res.json({
    configured,
    demoMode: !configured,
    message: configured
      ? 'AI backends configured and ready for secure requests.'
      : 'No external AI credentials detected. App is running in demo-safe mode.',
  });
});

app.post('/api/chat', async (req, res) => {
  const { message = '', language = 'ms', style = 'Balanced play' } = req.body || {};
  const lower = String(message).toLowerCase();

  if (!safeBoolean(process.env.OPENAI_API_KEY)) {
    let fallback = 'Bos, aku JEBAT. Dalam mod demo ni, fokus utama ialah jaga ruang di belakang, mantapkan pemain tengah, dan pastikan fullback tidak naik terlalu tinggi.';

    if (lower.includes('counter') || lower.includes('haziq')) {
      fallback = 'Kalau lawan suka counter attack, kita kena jaga ruang belakang. Cuba formasi dengan dua pemain tengah bertahan, dan pastikan fullback tidak naik terlalu tinggi.';
    }
    if (lower.includes('striker') || lower.includes('penyerang')) {
      fallback = 'Untuk striker, cari pemain dengan momentum, finishing, dan timing masuk ruang. Kalau squad kau banyak pemain tengah, pilih striker yang boleh tarik defender dan buka ruang untuk winger.';
    }
    if (lower.includes('formation') || lower.includes('formasi')) {
      fallback = `Berdasarkan gaya ${style.toLowerCase()}, aku galakkan 4-3-3 atau 4-2-3-1. Pilih satu yang paling sesuai dengan kestabilan tengah dan kelajuan sayap.`;
    }

    return res.json({ message: fallback });
  }

  const systemPrompt = `You are JEBAT, a football coaching AI for EAFC 27. Always identify yourself as JEBAT. Use Bahasa Melayu Malaysia by default, but support English when requested. Give practical tactical advice, never claim access to internal EA SPORTS systems, and clearly distinguish between verified game information, general football tactics, and AI recommendation. Current style: ${style}.`;

  const payload = {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${language === 'en' ? 'English' : 'Bahasa Melayu Malaysia'}: ${message}` },
    ],
    temperature: 0.7,
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: { message: 'OpenAI request failed' } }));
      throw new Error(errorBody.error?.message || 'OpenAI request failed');
    }

    const json = await response.json();
    const messageText = json.choices?.[0]?.message?.content || 'Aku JEBAT, bos. Aku perlu jawapan lanjut untuk bantu anda dengan lebih tepat.';
    return res.json({ message: messageText });
  } catch (error) {
    return res.status(500).json({
      error: 'OpenAI authentication or request failed. Please verify API key and network access.',
    });
  }
});

app.post('/api/squad/analyze', async (req, res) => {
  const { formation = '4-3-3', style = 'Balanced play', screenshot } = req.body || {};

  if (!safeBoolean(process.env.OPENAI_API_KEY) && !screenshot) {
    return res.json({
      overall: 'Kekuatan utama squad ini ialah keseimbangan ruang tengah dan kecergasan benteng sayap. Walau bagaimanapun, anda memerlukan lebih banyak kestabilan di bahagian tengah untuk menahan counter attack yang laju.',
      strengths: ['Penyerang berpotensi untuk menekan tinggi', 'Lebar sayap yang cukup jelas', 'Kecenderungan serangan pantas'],
      weaknesses: ['Ruang tengah mudah terbuka', 'Fullback memerlukan sokongan lebih baik', 'Penyerang kedua masih perlu lebih kuat di udara'],
      formation,
      upgrades: ['Upgrade pemain tengah bertahan', 'Tambah penyerang yang lebih sempurna dalam ruang sempit', 'Tingkatkan sokongan kepada fullback'],
      tactics: ['Gunakan press dari hadapan', 'Jaga lorong tengah', 'Gunakan satu winger untuk masuk ke ruang dalam'],
      score: 84,
      notes: 'Ini adalah laporan AI generatif demo. Ia bukan rating rasmi EA SPORTS FC dan memerlukan konfigurasi API sebenar untuk keputusan yang lebih tepat.',
    });
  }

  if (safeBoolean(process.env.OPENAI_API_KEY)) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are JEBAT, a football coach. Analyze the squad screenshot or user description. Return JSON with fields: overall, strengths, weaknesses, formation, upgrades, tactics, score, notes. Use English or Bahasa Melayu depending on the user input. Clearly mark AI assessment only, not official EA FC rating.',
            },
            {
              role: 'user',
              content: `Analyze this EAFC squad. Formation: ${formation}. Style: ${style}. Screenshot present: ${Boolean(screenshot)}`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error('OpenAI squad analysis failed');
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return res.json(parsed);
      }
    } catch (error) {
      // graceful fallback below
    }
  }

  return res.json({
    overall: 'Squad ini mempunyai potensi serangan yang baik tetapi memerlukan kestabilan lebih dalam transit ke pertahanan. Cadangan utama ialah memperbaiki ruang tengah dan menambahkan kelajuan ritma permainan.',
    strengths: ['Serangan melalui sayap', 'Kebolehan menekan awal', 'Kelinearan dalam formasi'],
    weaknesses: ['Ruang di belakang', 'Penglibatan pemain tengah', 'Lack of central reinforcement'],
    formation,
    upgrades: ['Upgrade pemain tengah bertahan', 'Cari winger dengan kelajuan tinggi', 'Pastikan fullback lebih stabil dalam transisi'],
    tactics: ['Gunakan pressing dari depan', 'Kawalan ruang tengah', 'Kunci permainan dengan dua pemain tengah bertahan'],
    score: 86,
    notes: 'Cadangan ini berdasarkan data demo dan peraturan taktikal umum. Ia bukan rating rasmi EA SPORTS FC 27.',
  });
});

app.post('/api/formation/recommend', (req, res) => {
  const { style = 'Balanced play' } = req.body || {};
  const lower = String(style).toLowerCase();

  if (lower.includes('counter')) {
    return res.json([{ formation: '4-4-2', reason: 'Mengutamakan ruang dan serangan pantas di depan.' }, { formation: '4-3-3', reason: 'Membantu mendesak dengan lebih banyak tekanan dari sayap.' }]);
  }

  if (lower.includes('possession')) {
    return res.json([{ formation: '4-2-3-1', reason: 'Membina kawalan tengah dan memperkukuh ruang antara defence dan attack.' }, { formation: '4-1-2-1-2', reason: 'Memberi ruang kepada kelab tengah untuk mengawal tempo.' }]);
  }

  if (lower.includes('press')) {
    return res.json([{ formation: '3-5-2', reason: 'Membiarkan wing-back menekan jauh ke depan.' }, { formation: '4-3-3', reason: 'Membantu menutup ruang di bahagian sayap dan menahan balas serangan.' }]);
  }

  if (lower.includes('wing')) {
    return res.json([{ formation: '3-5-2', reason: 'Lebih banyak lebar dan ruang untuk membina serangan.' }, { formation: '4-3-3', reason: 'Membantu anda mengekalkan lebar dengan pemain sayap yang agresif.' }]);
  }

  return res.json([{ formation: '4-3-3', reason: 'Keseimbangan terbaik antara serangan, Pemain tengah dan kestabilan pertahanan.' }, { formation: '4-2-3-1', reason: 'Sesuai untuk mengawal tengah dengan dua pemain bertahan.' }]);
});

app.post('/api/player/recommend', (req, res) => {
  const { budget = 100000, style = 'Balanced play' } = req.body || {};
  const budgetValue = Number(budget) || 100000;

  const players = [
    { name: 'Victor Osimhen', position: 'ST', attribute: 'Finishing, acceleration, movement', reason: 'Excellent for transition and direct goals.', chemistry: 'Strong link with wing play and quick midfielders.', price: 'Approx. 90K-125K', verified: false },
    { name: 'Achraf Hakimi', position: 'RB', attribute: 'Pace, dribbling, recovery', reason: 'Adds width to your side and supports progressive runs.', chemistry: 'Great for a balanced system with a strong pivot.', price: 'Approx. 78K-103K', verified: false },
    { name: 'Rodri', position: 'CDM', attribute: 'Passing, interceptions, composure', reason: 'Stabilizes midfield and protects the back line.', chemistry: 'Ideal for possession or controlled pressing.', price: 'Approx. 100K-150K', verified: false },
    { name: 'Bukayo Saka', position: 'RW', attribute: 'Dribbling, tempo, final-third creativity', reason: 'Adds width and direct threat in a 4-3-3 or 4-2-3-1.', chemistry: 'works well with a central striker who can attack the box.', price: 'Approx. 85K-110K', verified: false },
    { name: 'Ruben Dias', position: 'CB', attribute: 'Aerial dominance, concentration, composure', reason: 'Reduces risk when defending against direct forward play.', chemistry: 'Strong partner for aggressive wing-back or pacy fullback.', price: 'Approx. 70K-95K', verified: false },
  ];

  const filtered = players.filter((item) => {
    const priceNumber = Number(String(item.price).replace(/[^\d-]/g, '').split('-')[0]) || 0;
    return budgetValue >= priceNumber;
  });

  if (filtered.length === 0) {
    return res.json(players.slice(0, 5));
  }

  const prioritized = filtered.slice(0, 5);
  const styleAdjusted = prioritized.map((player, index) => ({
    ...player,
    reason: index === 0 && String(style).toLowerCase().includes('counter') ? `${player.reason} The profile works especially well in direct, counter-attacking patterns.` : player.reason,
  }));

  return res.json(styleAdjusted);
});

app.listen(port, () => {
  console.log(`EAFC27 JEBAT API listening on http://localhost:${port}`);
});
