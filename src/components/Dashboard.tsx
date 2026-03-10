'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

/* ═══════════════════════════════════════════
   PALETTE
   ═══════════════════════════════════════════ */
const palette = {
  accent: '#6C63FF',
  warm: '#FF6B4A',
  teal: '#2DD4A8',
  gold: '#F5C542',
  rose: '#FF4F81',
  slate: '#8B8B9E',
};
const chartColors = ['#6C63FF', '#2DD4A8', '#FF6B4A', '#F5C542', '#FF4F81', '#8B8B9E'];
const diffColors = { easy: '#2DD4A8', normal: '#F5C542', hard: '#FF6B4A', veryHard: '#FF4F81' };

/* ═══════════════════════════════════════════
   CENTERED CONTAINER — uses inline style to
   guarantee centering in Tailwind v4
   ═══════════════════════════════════════════ */
function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      style={{ maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '2rem', paddingRight: '2rem' }}
      className={className}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   PRIMITIVES
   ═══════════════════════════════════════════ */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.unobserve(el); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, vis };
}

function AnimNum({ value, suffix = '', dec = 0, className = '' }: {
  value: number; suffix?: string; dec?: number; className?: string;
}) {
  const [d, setD] = useState(0);
  const { ref, vis } = useInView();
  useEffect(() => {
    if (!vis) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 1000, 1);
      setD(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [vis, value]);
  return (
    <span ref={ref} className={className}>
      {dec > 0 ? d.toFixed(dec) : Math.round(d)}{suffix}
    </span>
  );
}

/* Custom Tooltip */
function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ value: number; name: string; }>; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1E1E24', padding: '12px 16px', borderRadius: '12px', border: '1px solid #2A2A32', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}>
      <p style={{ color: '#EAEAEF', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: '#8B8B9E', fontSize: '13px' }}>
          {p.name}: <span style={{ fontWeight: 700, color: '#EAEAEF', fontFamily: 'var(--font-mono)' }}>{p.value}명</span>
        </p>
      ))}
    </div>
  );
}

/* Card */
function Card({ children, className = '', delay = 0, style }: {
  children: ReactNode; className?: string; delay?: number; style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ background: '#16161A', borderRadius: '16px', border: '1px solid rgba(42,42,50,0.6)', padding: '2.5rem', ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Section heading */
function Heading({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#EAEAEF', letterSpacing: '-0.01em' }}>{children}</h3>
      {sub && <p style={{ fontSize: '0.85rem', color: '#5C5C6F', marginTop: '0.25rem' }}>{sub}</p>}
    </div>
  );
}

/* Stat (big number) */
function BigStat({ label, value, suffix, color, dec = 0, delay = 0 }: {
  label: string; value: number; suffix?: string; color: string; dec?: number; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ background: '#16161A', borderRadius: '16px', border: '1px solid rgba(42,42,50,0.6)', padding: '2.5rem', textAlign: 'center' }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '1rem', color }}>
        <AnimNum value={value} suffix={suffix} dec={dec} />
      </div>
      <div style={{ fontSize: '0.875rem', color: '#8B8B9E', letterSpacing: '0.02em' }}>{label}</div>
    </motion.div>
  );
}

/* Horizontal progress bar */
function BarRow({ label, value, max, pct, color, delay = 0 }: {
  label: string; value: number; max: number; pct?: number; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      style={{ padding: '1rem 0', borderBottom: '1px solid #222228' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.9375rem', color: 'rgba(234,234,239,0.9)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', fontWeight: 600, marginLeft: '1rem', flexShrink: 0, color }}>
          {pct !== undefined ? `${pct}%` : `${value}명`}
        </span>
      </div>
      <div style={{ width: '100%', height: '6px', background: '#222228', borderRadius: '3px', overflow: 'hidden' }}>
        <div className="bar-fill" style={{ height: '100%', borderRadius: '3px', width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </motion.div>
  );
}

/* Bar list card */
function BarListCard({ title, sub, data, color = palette.accent, delay = 0 }: {
  title: string; sub?: string;
  data: { name: string; value: number; percent?: number }[];
  color?: string; delay?: number;
}) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <Card delay={delay}>
      <Heading sub={sub}>{title}</Heading>
      <div style={{ marginTop: '1.5rem' }}>
        {data.map((item, i) => (
          <BarRow key={i} label={item.name} value={item.value} max={max}
            pct={item.percent} color={color} delay={0.1 + i * 0.05} />
        ))}
      </div>
    </Card>
  );
}

/* Quote card for qualitative data */
function QuoteCard({ text, index }: { text: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.03, duration: 0.4 }}
      className="quote-accent"
      style={{ padding: '0.75rem 0 0.75rem 1.5rem' }}
    >
      <p style={{ fontSize: '0.9375rem', color: 'rgba(234,234,239,0.75)', lineHeight: 1.7 }}>&ldquo;{text}&rdquo;</p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   TAB: OVERVIEW
   ═══════════════════════════════════════════ */
function TabOverview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Key insights grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {keyInsights.map((ins, i) => (
          <motion.div
            key={ins.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: '#16161A', borderRadius: '16px', border: '1px solid rgba(42,42,50,0.6)',
              padding: '2.5rem', transition: 'border-color 0.5s',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: 700, color: '#6C63FF', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              {ins.stat}
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: '#EAEAEF', marginBottom: '1rem', lineHeight: 1.4 }}>
              {ins.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#8B8B9E', lineHeight: 1.7 }}>{ins.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Profile stats */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#EAEAEF', marginBottom: '2rem' }}>
          응답자 프로필
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <BigStat label="총 응답자" value={24} suffix="명" color={palette.accent} delay={0} />
          <BigStat label="초등 교사 비율" value={70.8} suffix="%" color={palette.teal} dec={1} delay={0.08} />
          <BigStat label="경력 13년 이상" value={62.5} suffix="%" color={palette.gold} dec={1} delay={0.16} />
          <BigStat label="에듀테크 주 1회+" value={54.2} suffix="%" color={palette.warm} dec={1} delay={0.24} />
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <Card delay={0.1}>
          <Heading>근무 형태</Heading>
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={profileData.schoolType} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value" nameKey="name" stroke="none">
                  {profileData.schoolType.map((_, i) => <Cell key={i} fill={chartColors[i]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem' }}>
            {profileData.schoolType.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: chartColors[i] }} />
                <span style={{ fontSize: '0.875rem', color: '#8B8B9E' }}>{d.name} <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#EAEAEF' }}>{d.ratio}%</span></span>
              </div>
            ))}
          </div>
        </Card>

        <Card delay={0.15}>
          <Heading sub="91.7%가 8년 이상 경력">수학 지도 경력</Heading>
          <div style={{ marginTop: '1.5rem' }}>
            {profileData.experience.map((d, i) => (
              <BarRow key={i} label={d.name} value={d.value} max={15} color={palette.teal} delay={0.2 + i * 0.05} />
            ))}
          </div>
        </Card>

        <Card delay={0.2}>
          <Heading sub="91.7% 사용 중, 매 수업 활용 25%">에듀테크 활용 빈도</Heading>
          <div style={{ marginTop: '1.5rem' }}>
            {profileData.edtechFrequency.map((d, i) => (
              <BarRow key={i} label={d.name} value={d.value} max={9} color={palette.gold} delay={0.2 + i * 0.05} />
            ))}
          </div>
        </Card>
      </div>

      {/* Edtech programs used */}
      <Card delay={0.25}>
        <Heading sub={`${teacherVoices.edtechPrograms.length}개 프로그램 언급`}>교사들이 사용 중인 에듀테크 프로그램</Heading>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.5rem' }}>
          {teacherVoices.edtechPrograms.map((prog, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.02 }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                fontSize: '0.8125rem',
                background: i < 3 ? 'rgba(108,99,255,0.1)' : 'rgba(30,30,36,1)',
                color: i < 3 ? '#6C63FF' : '#8B8B9E',
                border: `1px solid ${i < 3 ? 'rgba(108,99,255,0.25)' : 'rgba(42,42,50,0.6)'}`,
                fontWeight: i < 3 ? 600 : 400,
              }}
            >
              {prog}
            </motion.span>
          ))}
        </div>
        <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', borderRadius: '12px', background: 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.12)', fontSize: '0.8125rem', color: '#8B8B9E' }}>
          똑똑수학탐험대, 풀리수학, 알지오매쓰 등 수학 특화 앱 외에도 캔바, 패들렛, 구글 워크스페이스 등 범용 도구도 교사들이 수학 수업에 활용하고 있습니다.
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB: REALITY
   ═══════════════════════════════════════════ */
function TabReality() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Chain reaction */}
      <Card style={{ background: 'linear-gradient(135deg, #16161A 0%, #1a1520 50%, #16161A 100%)', border: '1px solid #2A2A32' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#EAEAEF', marginBottom: '2.5rem', textAlign: 'center' }}>
          학습 결손의 연쇄 반응
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          {[
            { text: '하위 학년\n개념 부족', stat: '67%', color: palette.warm },
            { text: '문제 해석 불가\n시작 못함', stat: '42%', color: palette.gold },
            { text: '조금만 어려워도\n바로 포기', stat: '71%', color: palette.rose },
            { text: '학력 격차\n심화', stat: '75%', color: '#EF4444' },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '160px', height: '160px', borderRadius: '16px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', border: `1px solid ${step.color}30`,
                background: `${step.color}08`, transition: 'transform 0.2s',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: step.color }}>
                  {step.stat}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#8B8B9E', marginTop: '0.75rem', whiteSpace: 'pre-wrap', textAlign: 'center', lineHeight: 1.5 }}>
                  {step.text}
                </span>
              </div>
              {i < 3 && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5C5C6F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <BarListCard title="학생의 학습 장벽" sub="복수 응답 (n=24)" data={learningBarriers.barriers} color={palette.rose} delay={0.1} />
        <BarListCard title="수학 지도 페인포인트" sub="단일 응답" data={learningBarriers.teachingPainPoints} color={palette.gold} delay={0.15} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <BarListCard title="맞춤 지도가 어려운 구조적 이유" sub="복수 응답" data={learningBarriers.structuralReasons} color={palette.accent} delay={0.1} />
        <BarListCard title="기존 에듀테크 앱의 아쉬움" sub="복수 응답" data={painPointsData.appFrustrations} color={palette.slate} delay={0.15} />
      </div>

      {/* Tablet pain - qualitative data */}
      <Card delay={0.2}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Heading sub="교사 원문 응답">태블릿 기반 학습의 불편한 점</Heading>
          <div style={{ padding: '0.375rem 1rem', background: 'rgba(255,107,74,0.1)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, color: '#FF6B4A', border: '1px solid rgba(255,107,74,0.2)' }}>
            {painPointsData.tabletDiscomfort[1].percent}% 불편함 경험
          </div>
        </div>
        {/* Issue keywords */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {painPointsData.tabletIssueKeywords.map((kw, i) => (
            <span key={i} style={{
              padding: '0.375rem 0.75rem', borderRadius: '8px', fontSize: '0.8125rem',
              background: 'rgba(30,30,36,1)', color: '#EAEAEF', border: '1px solid rgba(42,42,50,0.6)',
            }}>
              {kw.keyword} <span style={{ fontFamily: 'var(--font-mono)', color: palette.warm, fontWeight: 600 }}>{kw.count}</span>
            </span>
          ))}
        </div>
        {/* Actual quotes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.5rem' }}>
          {teacherVoices.tabletPainTexts.map((text, i) => (
            <QuoteCard key={i} text={text} index={i} />
          ))}
        </div>
      </Card>

      {/* Difficulty reason texts */}
      <Card delay={0.25}>
        <Heading sub="교사 원문 응답 — 기초학력보장 프로그램의 현실">맞춤 지도가 어려운 구체적 이유</Heading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.5rem', marginTop: '1.5rem' }}>
          {teacherVoices.difficultyReasonTexts.map((text, i) => (
            <QuoteCard key={i} text={text} index={i} />
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB: FATIGUE
   ═══════════════════════════════════════════ */
function TabFatigue() {
  const radarData = teacherFatigue.difficultyByArea.map(d => ({
    area: d.area,
    difficulty: (d.hard * 3 + d.veryHard * 4 + d.normal * 2 + d.easy * 1) / 24,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <BigStat label="피드백 ↔ 피로도" value={4.2} suffix="/5" color={palette.rose} dec={1} delay={0} />
        <BigStat label="난이도 판단 부담" value={4.0} suffix="/5" color={palette.gold} dec={1} delay={0.08} />
        <BigStat label="업무부담 '어렵다' 응답" value={79.2} suffix="%" color={palette.accent} dec={1} delay={0.16} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <Card delay={0.1}>
          <Heading>기초학력보장 4대 영역별 어려움</Heading>
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={340}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="68%">
                <PolarGrid stroke="#2A2A32" />
                <PolarAngleAxis dataKey="area" tick={{ fontSize: 13, fill: '#8B8B9E' }} />
                <PolarRadiusAxis domain={[0, 4]} tick={false} axisLine={false} />
                <Radar name="어려움" dataKey="difficulty" stroke={palette.accent} fill={palette.accent} fillOpacity={0.12} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: '12px', background: 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.12)', fontSize: '0.875rem', color: '#8B8B9E' }}>
            &lsquo;교사 업무 부담&rsquo;이 가장 높고, &lsquo;개별 피드백&rsquo;과 &lsquo;수준별 자료&rsquo;가 뒤를 이음
          </div>
        </Card>

        <Card delay={0.15}>
          <Heading>4대 영역 상세 분포</Heading>
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {teacherFatigue.difficultyByArea.map((area, i) => (
              <div key={i}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(234,234,239,0.8)', marginBottom: '0.75rem' }}>{area.area}</div>
                <div style={{ display: 'flex', height: '32px', borderRadius: '8px', overflow: 'hidden', gap: '2px' }}>
                  {[
                    { val: area.easy, color: diffColors.easy, lbl: '쉬움' },
                    { val: area.normal, color: diffColors.normal, lbl: '보통' },
                    { val: area.hard, color: diffColors.hard, lbl: '어려움' },
                    { val: area.veryHard, color: diffColors.veryHard, lbl: '매우 어려움' },
                  ].map((seg, j) => (
                    <div key={j} style={{
                      width: `${(seg.val / 24) * 100}%`, background: seg.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', borderRadius: '2px',
                    }} title={`${seg.lbl}: ${seg.val}명`}>
                      {seg.val > 2 ? seg.val : ''}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '2.5rem' }}>
            {[
              { label: '쉬움', color: diffColors.easy },
              { label: '보통', color: diffColors.normal },
              { label: '어려움', color: diffColors.hard },
              { label: '매우 어려움', color: diffColors.veryHard },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '4px', background: l.color }} />
                <span style={{ fontSize: '0.75rem', color: '#5C5C6F' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card delay={0.2}>
        <Heading sub="복수 응답 — AI가 개입할 수 있는 핵심 지점">
          &ldquo;조금만 도와주면 풀 수 있었던 문제&rdquo;의 특징
        </Heading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginTop: '2rem' }}>
          {teacherFatigue.canSolveWithHelp.map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '1.25rem', padding: '1.5rem',
                borderRadius: '12px', background: '#1E1E24', border: '1px solid rgba(42,42,50,0.4)',
              }}
            >
              <div style={{
                flexShrink: 0, width: '56px', height: '56px', borderRadius: '12px',
                background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', color: '#6C63FF', fontWeight: 700,
              }}>
                {item.percent}%
              </div>
              <p style={{ fontSize: '0.9375rem', color: 'rgba(234,234,239,0.8)', lineHeight: 1.6, paddingTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{item.name}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Feedback fatigue distribution */}
      <Card delay={0.25}>
        <Heading sub="교사 피드백 피로도 점수 분포">피드백 피로도 상세</Heading>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1.5rem', marginTop: '2rem', paddingBottom: '1rem' }}>
          {teacherFatigue.feedbackFatigueDistribution.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', transformOrigin: 'bottom' }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: palette.rose }}>{item.value}명</span>
              <div style={{
                width: '48px', height: `${item.value * 16}px`, borderRadius: '8px 8px 4px 4px',
                background: `linear-gradient(to top, ${palette.rose}, ${palette.rose}90)`,
              }} />
              <span style={{ fontSize: '0.8125rem', color: '#8B8B9E' }}>{item.score}</span>
            </motion.div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#5C5C6F' }}>
          83%의 교사가 4점 이상 — 피드백은 필요하지만 피로도가 심각
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB: AI EXPECTATIONS
   ═══════════════════════════════════════════ */
function TabAI() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <BigStat label="AI 문항 자동 매칭" value={4.6} suffix="/5" color={palette.accent} dec={1} />
        <BigStat label="서술형 피드백 필요성" value={4.5} suffix="/5" color={palette.teal} dec={1} delay={0.08} />
        <BigStat label="결손 파악 → 집중 학습" value={70.8} suffix="%" color={palette.warm} dec={1} delay={0.16} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <Card delay={0.1}>
          <Heading>AI가 줄여주길 기대하는 업무</Heading>
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={aiExpectations.reduceWorkload} layout="vertical" margin={{ left: 20, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 13, fill: '#8B8B9E' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                  {aiExpectations.reduceWorkload.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: '12px', background: 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.12)', fontSize: '0.875rem', color: '#8B8B9E' }}>
            &lsquo;개별 피드백 작성&rsquo;이 <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#6C63FF' }}>46%</span>로 압도적 1위
          </div>
        </Card>

        <Card delay={0.15}>
          <Heading>가장 기대하는 AI 기능</Heading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '2rem' }}>
            {aiExpectations.desiredAIFeatures.map((feat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                style={{ padding: '1.5rem', borderRadius: '12px', background: '#1E1E24', border: '1px solid rgba(42,42,50,0.4)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#EAEAEF' }}>{feat.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', fontWeight: 700, color: chartColors[i] }}>{feat.percent}%</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#5C5C6F', marginBottom: '1rem' }}>{feat.desc}</p>
                <div style={{ width: '100%', height: '6px', background: '#222228', borderRadius: '3px', overflow: 'hidden' }}>
                  <div className="bar-fill" style={{ height: '100%', borderRadius: '3px', width: `${feat.percent}%`, background: chartColors[i] }} />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <Card delay={0.1}>
          <Heading>풀이 단계별 분석 기능 평가</Heading>
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={aiExpectations.stepAnalysisNeed} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" nameKey="name" stroke="none">
                  {aiExpectations.stepAnalysisNeed.map((_, i) => <Cell key={i} fill={chartColors[i]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '2rem' }}>
            {aiExpectations.stepAnalysisNeed.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, background: chartColors[i] }} />
                <span style={{ fontSize: '0.875rem', color: '#8B8B9E' }}>{d.name} <span style={{ fontFamily: 'var(--font-mono)', color: '#EAEAEF' }}>{d.percent}%</span></span>
              </div>
            ))}
          </div>
        </Card>

        <Card delay={0.15}>
          <Heading>AI 중간 단계 문제 활용 의향</Heading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '2rem', marginBottom: '2rem' }}>
            {aiExpectations.steppingStoneUsage.map((item, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.9375rem', color: 'rgba(234,234,239,0.8)' }}>{item.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', fontWeight: 600, color: chartColors[i] }}>{item.percent}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#222228', borderRadius: '4px', overflow: 'hidden' }}>
                  <div className="bar-fill" style={{ height: '100%', borderRadius: '4px', width: `${item.percent}%`, background: chartColors[i] }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '2rem', borderRadius: '12px', background: 'rgba(245,197,66,0.05)', border: '1px solid rgba(245,197,66,0.12)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3rem', fontWeight: 700, color: '#F5C542', marginBottom: '0.75rem' }}>
              <AnimNum value={62.5} suffix="%" dec={1} />
            </div>
            <p style={{ fontSize: '0.875rem', color: '#8B8B9E' }}>대부분 또는 모든 학생에게 활용하겠다고 응답</p>
          </div>
        </Card>
      </div>

      {/* Qualitative: feedback reasons */}
      <Card delay={0.2}>
        <Heading sub="교사 원문 응답">서술형 피드백이 필요한 이유</Heading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.5rem', marginTop: '1.5rem' }}>
          {teacherVoices.feedbackReasons.map((reason, i) => (
            <QuoteCard key={i} text={reason} index={i} />
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB: FEATURES & IMPACT
   ═══════════════════════════════════════════ */
function TabFeatures() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Must-have ranking */}
      <Card>
        <Heading sub="단일 선택">&ldquo;딱 하나만 고른다면?&rdquo;</Heading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          {keyFeatures.mustHaveFeature.map((feat, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              style={{
                position: 'relative', padding: '2rem', borderRadius: '16px', textAlign: 'center',
                background: i === 0 ? 'rgba(108,99,255,0.06)' : '#1E1E24',
                border: i === 0 ? '2px solid rgba(108,99,255,0.3)' : '1px solid rgba(42,42,50,0.6)',
                boxShadow: i === 0 ? '0 0 0 4px rgba(108,99,255,0.05)' : 'none',
              }}
            >
              {i === 0 && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  padding: '0.25rem 1rem', background: '#6C63FF', color: 'white', fontSize: '0.75rem',
                  fontWeight: 700, borderRadius: '999px', letterSpacing: '0.02em',
                }}>
                  1위
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: i === 0 ? '#6C63FF' : '#5C5C6F' }}>
                {feat.percent}%
              </div>
              <div style={{ fontSize: '0.875rem', lineHeight: 1.4, color: i === 0 ? '#EAEAEF' : '#8B8B9E', fontWeight: i === 0 ? 600 : 400 }}>
                {feat.name}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Feedback score + AI help */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <BarListCard title="AI가 대신해주면 가장 도움되는 것" sub="복수 응답" data={keyFeatures.aiHelpItems} color={palette.teal} delay={0.1} />

        <Card delay={0.15}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <Heading>서술형 풀이 피드백 필요성</Heading>
            <div style={{ padding: '0.375rem 1rem', background: 'rgba(45,212,168,0.1)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, color: '#2DD4A8', border: '1px solid rgba(45,212,168,0.2)', letterSpacing: '0.02em' }}>
              전원 4점+
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(4rem, 8vw, 5rem)', fontWeight: 700, color: '#2DD4A8', marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
              <AnimNum value={4.5} suffix="" dec={1} />
              <span style={{ fontSize: '1.75rem', color: '#5C5C6F', marginLeft: '0.25rem' }}>/5</span>
            </div>
            <p style={{ fontSize: '1rem', color: '#8B8B9E', marginBottom: '2rem' }}>24명 전원이 4점 이상 부여</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} style={{
                  width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.125rem', fontFamily: 'var(--font-mono)', fontWeight: 700,
                  background: n >= 4 ? palette.teal : '#1E1E24',
                  color: n >= 4 ? '#0C0C0F' : '#5C5C6F',
                  border: n < 4 ? '1px solid #2A2A32' : 'none',
                }}>
                  {n}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Impact section */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#EAEAEF' }}>
        AI가 바꿀 교육 현장
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <BarListCard title="절약하고 싶은 시간" data={impactData.timeSavings} color={palette.gold} />
        <BarListCard title="수포자에게 줄 가장 큰 영향" data={impactData.impactOnStruggling} color={palette.teal} delay={0.05} />
        <BarListCard title="대시보드 우선 지표" data={impactData.dashboardPriority} color={palette.accent} delay={0.1} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <BarListCard title="풀이 데이터 활용 계획" sub="복수 응답" data={impactData.dataUsage} color={palette.accent} />

        <Card delay={0.1}>
          <Heading>AI가 가장 효과적인 학생 수준</Heading>
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={impactData.effectiveLevel} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" nameKey="name" stroke="none">
                  {impactData.effectiveLevel.map((_, i) => <Cell key={i} fill={chartColors[i]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem' }}>
            {impactData.effectiveLevel.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: chartColors[i] }} />
                <span style={{ fontSize: '0.875rem', color: '#8B8B9E' }}>{d.name} <span style={{ fontFamily: 'var(--font-mono)', color: '#EAEAEF' }}>{d.percent}%</span></span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Level effectiveness - qualitative */}
      <Card delay={0.15}>
        <Heading sub="교사 원문 응답">학생 수준별 AI 효과에 대한 의견</Heading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          {['상', '중', '하', '최하'].map(level => {
            const items = teacherVoices.levelEffectivenessTexts.filter(t => t.level === level);
            if (items.length === 0) return null;
            const colorMap: Record<string, string> = { '상': palette.accent, '중': palette.teal, '하': palette.warm, '최하': palette.rose };
            return (
              <div key={level} style={{ padding: '1.5rem', background: '#1E1E24', borderRadius: '12px', border: '1px solid rgba(42,42,50,0.4)' }}>
                <div style={{
                  display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
                  marginBottom: '1.25rem', letterSpacing: '0.02em',
                  background: `${colorMap[level]}15`, color: colorMap[level], border: `1px solid ${colorMap[level]}25`,
                }}>
                  {level}위권 ({items.length}명)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {items.map((item, i) => (
                    <p key={i} style={{ fontSize: '0.875rem', color: 'rgba(234,234,239,0.7)', lineHeight: 1.6, paddingLeft: '1rem', borderLeft: `2px solid ${colorMap[level]}30` }}>
                      &ldquo;{item.text}&rdquo;
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB: VOICES
   ═══════════════════════════════════════════ */
function TabVoices() {
  // Group struggles by theme
  const themeGroups: Record<string, typeof teacherVoices.struggles> = {};
  teacherVoices.struggles.forEach(s => {
    if (!themeGroups[s.theme]) themeGroups[s.theme] = [];
    themeGroups[s.theme].push(s);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Struggles - grouped by theme */}
      <Card delay={0}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FF4F81', marginBottom: '0.5rem' }}>한계에 부딪혔던 순간</h3>
        <p style={{ fontSize: '0.8125rem', color: '#5C5C6F', marginBottom: '2rem' }}>
          교사 15명의 원문 응답 — 테마별 분류
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(themeGroups).map(([theme, items], gi) => (
            <div key={theme}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{
                  display: 'inline-block', padding: '0.25rem 0.75rem', background: 'rgba(255,79,129,0.08)',
                  color: '#FF4F81', fontSize: '0.75rem', fontWeight: 600, borderRadius: '999px', border: '1px solid rgba(255,79,129,0.15)',
                }}>
                  {theme}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#5C5C6F', fontFamily: 'var(--font-mono)' }}>{items.length}건</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {items.map((s, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + gi * 0.05 + i * 0.03 }}
                    className="quote-accent"
                    style={{ padding: '0.5rem 0 0.5rem 1.5rem' }}
                  >
                    <p style={{ fontSize: '0.9375rem', color: 'rgba(234,234,239,0.8)', lineHeight: 1.7 }}>&ldquo;{s.quote}&rdquo;</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Additional wishes */}
      <Card delay={0.1}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#6C63FF', marginBottom: '0.5rem' }}>AI 서비스에 바라는 것</h3>
        <p style={{ fontSize: '0.8125rem', color: '#5C5C6F', marginBottom: '2rem' }}>
          교사 {teacherVoices.additionalWishes.length}명의 원문 응답
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
          {teacherVoices.additionalWishes.map((wish, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              style={{
                display: 'flex', gap: '1.25rem', padding: '1.25rem', borderRadius: '12px',
                background: '#1E1E24', border: '1px solid rgba(42,42,50,0.4)',
              }}
            >
              <div style={{
                flexShrink: 0, width: '36px', height: '36px', borderRadius: '8px',
                background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', color: '#6C63FF', fontWeight: 700, fontSize: '0.8125rem',
              }}>
                {i + 1}
              </div>
              <p style={{ fontSize: '0.9375rem', color: 'rgba(234,234,239,0.8)', lineHeight: 1.6, paddingTop: '0.25rem' }}>&ldquo;{wish}&rdquo;</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Feedback reasons */}
      <Card delay={0.15}>
        <Heading sub="교사 원문 응답">서술형 피드백이 필요한 이유</Heading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.5rem', marginTop: '1.5rem' }}>
          {teacherVoices.feedbackReasons.map((reason, i) => (
            <QuoteCard key={i} text={reason} index={i} />
          ))}
        </div>
      </Card>

      {/* Level effectiveness reasons */}
      <Card delay={0.2}>
        <Heading>학생 수준별 AI 효과</Heading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          {[
            { level: '상위권', color: palette.accent, text: teacherVoices.levelEffectivenessReasons.high },
            { level: '중위권', color: palette.teal, text: teacherVoices.levelEffectivenessReasons.mid },
            { level: '하위권', color: palette.warm, text: teacherVoices.levelEffectivenessReasons.low },
          ].map((item, i) => (
            <div key={i} style={{ padding: '2rem', background: '#1E1E24', borderRadius: '12px', border: '1px solid rgba(42,42,50,0.4)' }}>
              <div style={{
                display: 'inline-block', padding: '0.375rem 1rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
                marginBottom: '1.25rem', letterSpacing: '0.02em',
                background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}25`,
              }}>
                {item.level}
              </div>
              <p style={{ fontSize: '0.9375rem', color: 'rgba(234,234,239,0.75)', lineHeight: 1.7 }}>&ldquo;{item.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TABS CONFIG
   ═══════════════════════════════════════════ */
const TABS = [
  { id: 'overview', label: '개요' },
  { id: 'reality', label: '교육 현실' },
  { id: 'fatigue', label: '교사 부담' },
  { id: 'ai', label: 'AI 기대' },
  { id: 'features', label: '기능 & 임팩트' },
  { id: 'voices', label: '현장 목소리' },
];

const TAB_COMPONENTS: Record<string, () => ReactNode> = {
  overview: TabOverview,
  reality: TabReality,
  fatigue: TabFatigue,
  ai: TabAI,
  features: TabFeatures,
  voices: TabVoices,
};

/* ═══════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════ */
export default function Dashboard() {
  const [tab, setTab] = useState('overview');
  const ActiveTab = TAB_COMPONENTS[tab];

  return (
    <div className="noise-bg" style={{ minHeight: '100vh' }}>
      {/* ─── Hero header ─── */}
      <header className="hero-mesh" style={{ position: 'relative' }}>
        <Container>
          <div style={{ paddingTop: 'clamp(5rem, 8vw, 7rem)', paddingBottom: 'clamp(4rem, 6vw, 5rem)' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <span className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2DD4A8' }} />
                <span style={{ fontSize: '0.875rem', color: '#5C5C6F', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
                  {overview.totalResponses}명 응답 &middot; {overview.surveyPeriod}
                </span>
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                fontWeight: 900, color: '#EAEAEF', lineHeight: 1.15, marginBottom: '1.5rem', letterSpacing: '-0.02em',
              }}>
                수학 교육의 현실,<br />
                <span style={{
                  backgroundImage: 'linear-gradient(to right, #6C63FF, #2DD4A8, #F5C542)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  AI가 풀어야 할 과제
                </span>
              </h1>
              <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#8B8B9E', lineHeight: 1.7 }}>
                경력 평균 10년 이상의 수학 교사 24명이 전하는<br />
                교육 현장의 진짜 목소리와 AI 서비스에 거는 기대
              </p>
            </motion.div>
          </div>
        </Container>
      </header>

      {/* ─── Sticky Tab Bar ─── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(12,12,15,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #2A2A32' }}>
        <Container>
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', padding: '4px 0', scrollbarWidth: 'none' }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  position: 'relative', padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 500,
                  whiteSpace: 'nowrap', transition: 'color 0.2s', border: 'none', cursor: 'pointer',
                  background: 'transparent',
                  color: tab === t.id ? '#EAEAEF' : '#5C5C6F',
                }}
              >
                {t.label}
                {tab === t.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: '#6C63FF' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* ─── Tab Content ─── */}
      <main>
        <Container>
          <div style={{ paddingTop: 'clamp(2.5rem, 4vw, 4rem)', paddingBottom: 'clamp(2.5rem, 4vw, 4rem)' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <ActiveTab />
              </motion.div>
            </AnimatePresence>
          </div>
        </Container>
      </main>

      {/* ─── Conclusion ─── */}
      <Container>
        <div style={{ paddingBottom: '5rem' }}>
          <div style={{
            borderRadius: '24px', padding: 'clamp(2.5rem, 4vw, 4rem)', position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg, #16161A 0%, #1a1525 50%, #16161A 100%)',
            border: '1px solid rgba(42,42,50,0.25)',
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '320px', height: '320px', background: 'rgba(108,99,255,0.05)', borderRadius: '50%', filter: 'blur(100px)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '320px', height: '320px', background: 'rgba(45,212,168,0.05)', borderRadius: '50%', filter: 'blur(100px)' }} />
            <div style={{ position: 'relative' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 900, color: '#EAEAEF', marginBottom: '1rem', textAlign: 'center', letterSpacing: '-0.02em' }}>
                핵심 시사점
              </h2>
              <p style={{ color: '#5C5C6F', marginBottom: '3.5rem', textAlign: 'center', fontSize: '1rem' }}>
                24명의 현장 교사 설문이 가리키는 AI 수학 서비스의 방향
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                {[
                  { num: '01', title: '결손 진단이 시작점', text: '67%가 하위 학년 개념 부족을 1순위 학습 장벽으로 꼽았습니다. 결손 지점의 정확한 진단이 모든 것의 출발점입니다.', color: palette.rose },
                  { num: '02', title: '피드백의 자동화', text: '서술형 피드백 필요성 4.5/5, 전원 합의. 하지만 교사 피로도 4.2/5. AI가 이 딜레마를 해결해야 합니다.', color: palette.accent },
                  { num: '03', title: '성공 경험의 설계', text: "수포자에게 가장 큰 영향은 '단계별 힌트로 스스로 해결하는 성공 경험'(63%). 사고 유도가 핵심입니다.", color: palette.teal },
                ].map(item => (
                  <div key={item.num} style={{ padding: '2rem', borderRadius: '16px', background: 'rgba(12,12,15,0.4)', border: '1px solid rgba(42,42,50,0.4)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.25rem', color: item.color }}>
                      {item.num}
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#EAEAEF', marginBottom: '1rem' }}>{item.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#8B8B9E', lineHeight: 1.7 }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: '1px solid #222228', padding: '2.5rem 0' }}>
        <Container>
          <p style={{ fontSize: '0.875rem', color: '#5C5C6F', textAlign: 'center' }}>
            수학 AI 서비스 기획을 위한 현장 교사 설문 분석 &middot; {overview.totalResponses}명 응답 &middot; {overview.surveyPeriod}
          </p>
        </Container>
      </footer>
    </div>
  );
}
