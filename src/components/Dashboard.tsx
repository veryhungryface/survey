'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  profileData, painPointsData, learningBarriers,
  teacherFatigue, aiExpectations, keyFeatures,
  impactData, teacherVoices, keyInsights, overview,
} from '@/data/surveyData';

/* ─── Palette ─── */
const COLORS = {
  indigo: '#4f46e5',
  sky: '#0ea5e9',
  emerald: '#10b981',
  amber: '#f59e0b',
  coral: '#f43f5e',
  violet: '#8b5cf6',
  slate: '#64748b',
  rose: '#fb7185',
};

const CHART_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#64748b'];
const DIFFICULTY_COLORS = { easy: '#10b981', normal: '#f59e0b', hard: '#f97316', veryHard: '#ef4444' };

/* ─── Intersection Observer Hook ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── Animated Number ─── */
function AnimatedNumber({ value, suffix = '', decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const { ref, inView } = useInView();
  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * ease);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, value]);
  return <span ref={ref}>{decimals > 0 ? display.toFixed(decimals) : Math.round(display)}{suffix}</span>;
}

/* ─── Section Wrapper ─── */
function Section({ id, children, className = '' }: { id: string; children: ReactNode; className?: string }) {
  const { ref, inView } = useInView(0.08);
  return (
    <section
      id={id}
      ref={ref}
      className={`section-enter ${inView ? 'visible' : ''} ${className}`}
    >
      {children}
    </section>
  );
}

/* ─── Section Title ─── */
function SectionTitle({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">{number}</span>
        <span className="text-sm font-semibold text-indigo-600 tracking-wide uppercase">{subtitle}</span>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{title}</h2>
    </div>
  );
}

/* ─── Card ─── */
function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

/* ─── Horizontal Bar ─── */
function HBar({ data, color = COLORS.indigo, maxValue }: { data: { name: string; value: number; percent?: number }[]; color?: string; maxValue?: number }) {
  const max = maxValue || Math.max(...data.map(d => d.value));
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i}>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-sm text-slate-700 font-medium leading-snug whitespace-pre-wrap">{item.name}</span>
            <span className="text-sm font-bold text-slate-900 ml-3 shrink-0">
              {item.percent !== undefined ? `${item.percent}%` : `${item.value}명`}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full progress-animated"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: `linear-gradient(90deg, ${color}, ${color}dd)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Stat Box ─── */
function StatBox({ label, value, suffix, color, decimals = 0 }: { label: string; value: number; suffix?: string; color: string; decimals?: number }) {
  return (
    <div className="stat-card bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
      <div className="text-4xl md:text-5xl font-extrabold mb-2" style={{ color }}>
        <AnimatedNumber value={value} suffix={suffix} decimals={decimals} />
      </div>
      <div className="text-sm text-slate-500 font-medium">{label}</div>
    </div>
  );
}

/* ─── Custom Tooltip ─── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-100 text-sm">
      <p className="font-medium text-slate-800 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-slate-600">{p.name}: <span className="font-bold text-slate-900">{p.value}명</span></p>
      ))}
    </div>
  );
}

/* ─── Navigation ─── */
function Navigation() {
  const [active, setActive] = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections = [
    { id: 'hero', label: '개요' },
    { id: 'profile', label: '응답자' },
    { id: 'reality', label: '교육 현실' },
    { id: 'fatigue', label: '교사 피로' },
    { id: 'ai-expect', label: 'AI 기대' },
    { id: 'features', label: '핵심 기능' },
    { id: 'impact', label: '임팩트' },
    { id: 'voices', label: '현장 목소리' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const sectionEls = sections.map(s => document.getElementById(s.id));
      const scrollPos = window.scrollY + 200;
      for (let i = sectionEls.length - 1; i >= 0; i--) {
        const el = sectionEls[i];
        if (el && el.offsetTop <= scrollPos) {
          setActive(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <a href="#hero" className={`font-bold text-lg transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
            <span className="gradient-text">MathAI</span> Survey
          </a>
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className={`w-6 h-6 ${scrolled ? 'text-slate-700' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <div className="hidden md:flex items-center gap-1">
            {sections.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`nav-link px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active === s.id
                    ? (scrolled ? 'text-indigo-600' : 'text-white')
                    : (scrolled ? 'text-slate-500 hover:text-slate-800' : 'text-white/70 hover:text-white')
                } ${active === s.id ? 'active' : ''}`}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {sections.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 text-sm font-medium rounded-lg ${
                  active === s.id ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const radarData = teacherFatigue.difficultyByArea.map(d => ({
    area: d.area,
    difficulty: (d.hard * 3 + d.veryHard * 4 + d.normal * 2 + d.easy * 1) / 24,
  }));

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* ═══ HERO ═══ */}
      <header id="hero" className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/10 text-sm text-white/80 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {overview.totalResponses}명의 현장 교사 참여 &middot; {overview.surveyPeriod}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6">
              수학 교육의 현실,<br />
              <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
                AI가 풀어야 할 과제
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed">
              경력 평균 10년 이상의 수학 교사 24명이 전하는<br className="hidden md:block" />
              교육 현장의 진짜 목소리와 AI 서비스에 거는 기대
            </p>
          </div>

          {/* Key Insight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {keyInsights.map((insight) => (
              <div
                key={insight.id}
                className="insight-card bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/15 transition-all duration-300 cursor-default"
              >
                <div className="text-3xl font-extrabold text-white mb-1">
                  {insight.stat}
                </div>
                <div className="text-sm font-semibold text-indigo-300 mb-2">
                  {insight.title}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8fafc] to-transparent" />
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-24">

        {/* ═══ SECTION 1: PROFILE ═══ */}
        <Section id="profile">
          <SectionTitle number="01" title="누가 응답했는가" subtitle="Respondent Profile" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatBox label="총 응답자" value={24} suffix="명" color={COLORS.indigo} />
            <StatBox label="초등 교사 비율" value={70.8} suffix="%" color={COLORS.sky} decimals={1} />
            <StatBox label="경력 13년 이상" value={62.5} suffix="%" color={COLORS.emerald} decimals={1} />
            <StatBox label="에듀테크 주 1회 이상" value={54.2} suffix="%" color={COLORS.violet} decimals={1} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-4">근무 형태</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={profileData.schoolType} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" nameKey="name">
                    {profileData.schoolType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                {profileData.schoolType.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i] }} />
                    <span className="text-xs text-slate-600">{d.name} ({d.ratio}%)</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-4">수학 지도 경력</h3>
              <HBar data={profileData.experience} color={COLORS.sky} />
              <div className="mt-4 p-3 bg-sky-50 rounded-xl">
                <p className="text-xs text-sky-700 font-medium">
                  응답자의 91.7%가 8년 이상의 경력을 보유한 베테랑 교사
                </p>
              </div>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-4">에듀테크 활용 빈도</h3>
              <HBar data={profileData.edtechFrequency} color={COLORS.emerald} />
              <div className="mt-4 p-3 bg-emerald-50 rounded-xl">
                <p className="text-xs text-emerald-700 font-medium">
                  91.7%가 에듀테크를 사용 중이나, 매 수업 활용은 25%에 불과
                </p>
              </div>
            </Card>
          </div>
        </Section>

        {/* ═══ SECTION 2: CLASSROOM REALITY ═══ */}
        <Section id="reality">
          <SectionTitle number="02" title="교육 현장의 민낯" subtitle="Classroom Reality" />

          {/* Pain Chain Visual */}
          <Card className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 border-none text-white">
            <h3 className="text-lg font-bold mb-6 text-center">학습 결손의 연쇄 반응</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-2">
              {[
                { text: '하위 학년\n개념 부족', stat: '67%', color: '#f43f5e' },
                { text: '문제 해석 불가\n풀이 시작 못함', stat: '42%', color: '#f97316' },
                { text: '조금만 어려워도\n바로 포기', stat: '71%', color: '#ef4444' },
                { text: '학력 격차\n심화', stat: '75%', color: '#dc2626' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 md:gap-2">
                  <div className="text-center">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl flex flex-col items-center justify-center border-2 transition-transform hover:scale-105" style={{ borderColor: step.color, background: `${step.color}15` }}>
                      <span className="text-2xl font-extrabold" style={{ color: step.color }}>{step.stat}</span>
                      <span className="text-xs text-slate-300 mt-1 whitespace-pre-wrap leading-tight text-center px-1">{step.text}</span>
                    </div>
                  </div>
                  {i < 3 && (
                    <svg className="w-6 h-6 text-slate-500 shrink-0 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  {i < 3 && (
                    <svg className="w-6 h-6 text-slate-500 shrink-0 md:hidden rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-1">학생의 학습 장벽</h3>
              <p className="text-xs text-slate-400 mb-4">복수 응답 (n=24)</p>
              <HBar data={learningBarriers.barriers} color={COLORS.coral} />
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-1">수학 지도 페인포인트</h3>
              <p className="text-xs text-slate-400 mb-4">단일 응답 (n=24)</p>
              <HBar data={learningBarriers.teachingPainPoints} color={COLORS.amber} />
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-1">맞춤 지도가 어려운 구조적 이유</h3>
              <p className="text-xs text-slate-400 mb-4">복수 응답</p>
              <HBar data={learningBarriers.structuralReasons} color={COLORS.violet} />
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-1">기존 에듀테크 앱의 아쉬움</h3>
              <p className="text-xs text-slate-400 mb-4">복수 응답</p>
              <HBar data={painPointsData.appFrustrations} color={COLORS.slate} />
            </Card>
          </div>
        </Section>

        {/* ═══ SECTION 3: TEACHER FATIGUE ═══ */}
        <Section id="fatigue">
          <SectionTitle number="03" title="피드백 딜레마 — 더 주고 싶지만, 더 줄 수 없는" subtitle="Teacher Fatigue" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatBox label="피드백 ↔ 피로도 상관" value={4.2} suffix="/5" color={COLORS.coral} decimals={1} />
            <StatBox label="난이도 판단 부담" value={4.0} suffix="/5" color={COLORS.amber} decimals={1} />
            <StatBox label="교사 업무부담 '어렵다'" value={79.2} suffix="%" color={COLORS.violet} decimals={1} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-4">기초학력보장 4대 영역별 어려움</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="area" tick={{ fontSize: 12, fill: '#475569' }} />
                  <PolarRadiusAxis domain={[0, 4]} tick={false} axisLine={false} />
                  <Radar name="어려움 정도" dataKey="difficulty" stroke={COLORS.indigo} fill={COLORS.indigo} fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-2 p-3 bg-indigo-50 rounded-xl">
                <p className="text-xs text-indigo-700 font-medium">
                  &lsquo;교사 업무 부담&rsquo;이 가장 높고, &lsquo;개별 피드백&rsquo;과 &lsquo;수준별 자료 제공&rsquo;이 공동 2위
                </p>
              </div>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-4">4대 영역 상세 응답 분포</h3>
              <div className="space-y-4">
                {teacherFatigue.difficultyByArea.map((area, i) => (
                  <div key={i}>
                    <div className="text-sm font-medium text-slate-700 mb-1.5">{area.area}</div>
                    <div className="flex h-7 rounded-lg overflow-hidden">
                      {[
                        { key: 'easy', val: area.easy, color: DIFFICULTY_COLORS.easy, label: '쉬움' },
                        { key: 'normal', val: area.normal, color: DIFFICULTY_COLORS.normal, label: '보통' },
                        { key: 'hard', val: area.hard, color: DIFFICULTY_COLORS.hard, label: '어려움' },
                        { key: 'veryHard', val: area.veryHard, color: DIFFICULTY_COLORS.veryHard, label: '매우 어려움' },
                      ].map(seg => (
                        <div
                          key={seg.key}
                          className="flex items-center justify-center text-xs font-bold text-white transition-all"
                          style={{ width: `${(seg.val / 24) * 100}%`, background: seg.color }}
                          title={`${seg.label}: ${seg.val}명`}
                        >
                          {seg.val > 2 ? seg.val : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex gap-4 justify-center mt-3">
                  {[
                    { label: '쉬움', color: DIFFICULTY_COLORS.easy },
                    { label: '보통', color: DIFFICULTY_COLORS.normal },
                    { label: '어려움', color: DIFFICULTY_COLORS.hard },
                    { label: '매우 어려움', color: DIFFICULTY_COLORS.veryHard },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded" style={{ background: l.color }} />
                      <span className="text-xs text-slate-500">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="text-sm font-semibold text-slate-500 mb-1">&ldquo;조금만 도와주면 학생 스스로 풀 수 있었던 문제&rdquo;의 특징</h3>
            <p className="text-xs text-slate-400 mb-4">복수 응답 — AI가 개입할 수 있는 지점</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teacherFatigue.canSolveWithHelp.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                    {item.percent}%
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{item.name}</p>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* ═══ SECTION 4: AI EXPECTATIONS ═══ */}
        <Section id="ai-expect">
          <SectionTitle number="04" title="교사들이 AI에 거는 기대" subtitle="AI Expectations" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatBox label="AI 문항 자동 매칭 필요성" value={4.6} suffix="/5" color={COLORS.indigo} decimals={1} />
            <StatBox label="서술형 피드백 필요성" value={4.5} suffix="/5" color={COLORS.sky} decimals={1} />
            <StatBox label="결손 파악 → 집중 학습" value={70.8} suffix="%" color={COLORS.emerald} decimals={1} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-4">AI가 줄여주길 기대하는 업무</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={aiExpectations.reduceWorkload} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12, fill: '#475569' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} fill={COLORS.indigo}>
                    {aiExpectations.reduceWorkload.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 p-3 bg-indigo-50 rounded-xl">
                <p className="text-xs text-indigo-700 font-medium">
                  &lsquo;개별 피드백 작성&rsquo;이 46%로 압도적 1위 — AI의 핵심 가치 영역
                </p>
              </div>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-4">가장 기대하는 AI 기능</h3>
              <div className="space-y-4">
                {aiExpectations.desiredAIFeatures.map((feat, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-800">{feat.name}</span>
                      <span className="text-sm font-bold" style={{ color: CHART_COLORS[i] }}>{feat.percent}%</span>
                    </div>
                    <p className="text-xs text-slate-500">{feat.desc}</p>
                    <div className="mt-2 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full progress-animated" style={{ width: `${feat.percent}%`, background: CHART_COLORS[i] }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-4">풀이 단계별 분석 기능 평가</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={aiExpectations.stepAnalysisNeed} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="name">
                    {aiExpectations.stepAnalysisNeed.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {aiExpectations.stepAnalysisNeed.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i] }} />
                    <span className="text-xs text-slate-600">{d.name} ({d.percent}%)</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-emerald-50 rounded-xl">
                <p className="text-xs text-emerald-700 font-medium">
                  87.5%가 &lsquo;보조 이상&rsquo;으로 평가 — 단계별 분석은 보편적 니즈
                </p>
              </div>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-4">AI 중간 단계 문제 활용 의향</h3>
              <div className="space-y-3 mb-6">
                {aiExpectations.steppingStoneUsage.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-700 font-medium">{item.name}</span>
                        <span className="text-sm font-bold" style={{ color: CHART_COLORS[i] }}>{item.percent}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full progress-animated" style={{ width: `${item.percent}%`, background: CHART_COLORS[i] }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="text-3xl font-extrabold text-amber-600 mb-1">
                  <AnimatedNumber value={62.5} suffix="%" decimals={1} />
                </div>
                <p className="text-xs text-amber-700 font-medium">
                  교사의 62.5%가 대부분 또는 모든 학생에게 활용하겠다고 응답
                </p>
              </div>
            </Card>
          </div>
        </Section>

        {/* ═══ SECTION 5: KEY FEATURES ═══ */}
        <Section id="features">
          <SectionTitle number="05" title="에듀테크에 정말 필요한 기능" subtitle="Must-Have Features" />

          {/* Feature Priority Ranking */}
          <Card className="mb-8">
            <h3 className="text-sm font-semibold text-slate-500 mb-2">&ldquo;딱 하나만 고른다면?&rdquo; — 에듀테크 필수 기능</h3>
            <p className="text-xs text-slate-400 mb-6">단일 선택</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {keyFeatures.mustHaveFeature.map((feat, i) => (
                <div
                  key={i}
                  className={`relative p-5 rounded-2xl text-center transition-all hover:scale-[1.02] ${
                    i === 0 ? 'bg-indigo-50 border-2 border-indigo-200 ring-2 ring-indigo-100' : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  {i === 0 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                      1st
                    </div>
                  )}
                  <div className={`text-3xl font-extrabold mb-2 ${i === 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {feat.percent}%
                  </div>
                  <div className={`text-sm font-medium ${i === 0 ? 'text-indigo-900' : 'text-slate-600'}`}>
                    {feat.name}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-4">AI가 대신해주면 가장 도움되는 것</h3>
              <p className="text-xs text-slate-400 mb-4">복수 응답</p>
              <HBar data={keyFeatures.aiHelpItems} color={COLORS.sky} />
            </Card>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-500">서술형 풀이 피드백 필요성</h3>
                <div className="px-3 py-1 bg-emerald-100 rounded-full text-xs font-bold text-emerald-700">ALL 4+</div>
              </div>
              <div className="text-center py-6">
                <div className="text-6xl font-extrabold text-emerald-600 mb-3">
                  <AnimatedNumber value={4.5} suffix="/5" decimals={1} />
                </div>
                <p className="text-sm text-slate-500 mb-6">24명 전원이 4점 이상 부여 (4점 12명, 5점 12명)</p>
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold"
                      style={{
                        background: i >= 3 ? COLORS.emerald : '#f1f5f9',
                        color: i >= 3 ? 'white' : '#94a3b8',
                      }}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 p-3 bg-emerald-50 rounded-xl">
                <p className="text-xs text-emerald-700 font-medium">
                  설문 전 항목 중 가장 높은 합의 수준 — 서술형 피드백은 필수 기능
                </p>
              </div>
            </Card>
          </div>

          {/* Feedback Reasons */}
          <Card>
            <h3 className="text-sm font-semibold text-slate-500 mb-4">교사들이 말하는 서술형 피드백이 필요한 이유</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teacherVoices.feedbackReasons.map((reason, i) => (
                <div key={i} className="quote-card p-3 bg-slate-50 rounded-r-xl">
                  <p className="text-sm text-slate-700 leading-relaxed">&ldquo;{reason}&rdquo;</p>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* ═══ SECTION 6: IMPACT ═══ */}
        <Section id="impact">
          <SectionTitle number="06" title="AI가 바꿀 교육 현장의 모습" subtitle="Expected Impact" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-4">교사가 가장 절약하고 싶은 시간</h3>
              <HBar data={impactData.timeSavings} color={COLORS.amber} />
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-4">수포자에게 줄 가장 큰 영향</h3>
              <HBar data={impactData.impactOnStruggling} color={COLORS.emerald} />
              <div className="mt-4 p-3 bg-emerald-50 rounded-xl">
                <p className="text-xs text-emerald-700 font-medium">
                  63%가 &lsquo;단계별 힌트로 성공 경험 제공&rsquo; 선택 — 자기효능감이 핵심
                </p>
              </div>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-4">대시보드 우선 지표</h3>
              <HBar data={impactData.dashboardPriority} color={COLORS.violet} />
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-4">풀이 데이터 활용 계획</h3>
              <p className="text-xs text-slate-400 mb-4">복수 응답</p>
              <HBar data={impactData.dataUsage} color={COLORS.indigo} />
              <div className="mt-4 p-3 bg-indigo-50 rounded-xl">
                <p className="text-xs text-indigo-700 font-medium">
                  75%가 &lsquo;학부모 상담 근거&rsquo;로 활용 — 데이터가 소통의 언어가 됨
                </p>
              </div>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-slate-500 mb-4">AI가 가장 효과적인 학생 수준</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={impactData.effectiveLevel} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name">
                    {impactData.effectiveLevel.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {impactData.effectiveLevel.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i] }} />
                    <span className="text-xs text-slate-600">{d.name} ({d.percent}%)</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-sky-50 rounded-xl border border-sky-100">
                <div className="text-sm font-semibold text-sky-800 mb-1">핵심 타겟: 중위권 (50%)</div>
                <p className="text-xs text-sky-600 leading-relaxed">
                  &ldquo;{teacherVoices.levelEffectivenessReasons.mid}&rdquo;
                </p>
              </div>
            </Card>
          </div>
        </Section>

        {/* ═══ SECTION 7: TEACHER VOICES ═══ */}
        <Section id="voices">
          <SectionTitle number="07" title="교사 현장의 목소리" subtitle="Teacher Voices" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <h3 className="text-sm font-semibold text-coral mb-6">한계에 부딪혔던 순간</h3>
              <div className="space-y-4">
                {teacherVoices.struggles.map((s, i) => (
                  <div key={i} className="quote-card p-4 bg-slate-50 rounded-r-xl">
                    <div className="inline-block px-2 py-0.5 bg-coral/10 text-coral text-xs font-semibold rounded mb-2">
                      {s.theme}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">&ldquo;{s.quote}&rdquo;</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-indigo-600 mb-6">AI 서비스에 바라는 것</h3>
              <div className="space-y-4">
                {teacherVoices.additionalWishes.map((wish, i) => (
                  <div key={i} className="flex gap-3 p-4 bg-indigo-50/50 rounded-xl hover:bg-indigo-50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                      {i + 1}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">&ldquo;{wish}&rdquo;</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-sky-50 rounded-xl border border-indigo-100">
                <h4 className="text-sm font-semibold text-indigo-800 mb-2">학생 수준별 AI 효과에 대한 교사 의견</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-bold text-indigo-600">상위권:</span>
                    <span className="text-xs text-slate-600 ml-1">&ldquo;{teacherVoices.levelEffectivenessReasons.high}&rdquo;</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-sky-600">중위권:</span>
                    <span className="text-xs text-slate-600 ml-1">&ldquo;{teacherVoices.levelEffectivenessReasons.mid}&rdquo;</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-600">하위권:</span>
                    <span className="text-xs text-slate-600 ml-1">&ldquo;{teacherVoices.levelEffectivenessReasons.low}&rdquo;</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Section>

        {/* ═══ CONCLUSION ═══ */}
        <Section id="conclusion" className="pb-16">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">핵심 시사점</h2>
              <p className="text-slate-400 mb-10 max-w-2xl mx-auto">
                24명의 현장 교사 설문이 가리키는 AI 수학 서비스의 방향
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                  <div className="text-3xl font-extrabold bg-gradient-to-r from-coral to-amber-400 bg-clip-text text-transparent mb-3">01</div>
                  <h3 className="text-lg font-bold text-white mb-2">결손 진단이 시작점</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    67%가 하위 학년 개념 부족을 1순위 학습 장벽으로 꼽았습니다. 학습 결손 지점의 정확한 진단 없이는 어떤 개입도 효과가 제한적입니다.
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                  <div className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent mb-3">02</div>
                  <h3 className="text-lg font-bold text-white mb-2">피드백의 자동화</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    서술형 피드백 필요성 4.5/5, 전원 합의. 하지만 교사 피로도 4.2/5. AI가 이 딜레마를 해결해야 합니다.
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                  <div className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-3">03</div>
                  <h3 className="text-lg font-bold text-white mb-2">성공 경험의 설계</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    수포자에게 가장 큰 영향은 &lsquo;단계별 힌트로 스스로 문제를 해결하는 성공 경험&rsquo;(63%). 정답 제공이 아닌, 사고 유도가 핵심입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-slate-400">
            수학 AI 서비스 기획을 위한 현장 교사 설문 분석 &middot; {overview.totalResponses}명 응답 &middot; {overview.surveyPeriod}
          </p>
        </div>
      </footer>
    </div>
  );
}
