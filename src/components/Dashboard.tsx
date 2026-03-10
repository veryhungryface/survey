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
    <div className="bg-[#1E1E24] px-5 py-4 rounded-xl border border-[#2A2A32] shadow-2xl">
      <p className="font-medium text-[#EAEAEF] mb-1 text-sm">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[#8B8B9E] text-sm">
          {p.name}: <span className="font-bold text-[#EAEAEF] font-mono">{p.value}명</span>
        </p>
      ))}
    </div>
  );
}

/* Card */
function Card({ children, className = '', delay = 0 }: {
  children: ReactNode; className?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`bg-[#16161A] rounded-2xl border border-[#2A2A32]/60 p-10 ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* Section heading */
function Heading({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-2">
      <h3 className="text-xl font-bold text-[#EAEAEF] tracking-tight">{children}</h3>
      {sub && <p className="text-sm text-[#5C5C6F] mt-1">{sub}</p>}
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
      className="bg-[#16161A] rounded-2xl border border-[#2A2A32]/60 p-10 text-center"
    >
      <div className="font-mono text-5xl md:text-6xl font-bold tracking-tight mb-4" style={{ color }}>
        <AnimNum value={value} suffix={suffix} dec={dec} />
      </div>
      <div className="text-sm text-[#8B8B9E] tracking-wide">{label}</div>
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
      className="group py-4 border-b border-[#222228] last:border-0"
    >
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-[15px] text-[#EAEAEF]/90 group-hover:text-[#EAEAEF] transition-colors">
          {label}
        </span>
        <span className="font-mono text-[15px] font-semibold ml-4 shrink-0" style={{ color }}>
          {pct !== undefined ? `${pct}%` : `${value}명`}
        </span>
      </div>
      <div className="w-full h-1.5 bg-[#222228] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bar-fill"
          style={{ width: `${(value / max) * 100}%`, background: color }}
        />
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
      <div className="mt-6">
        {data.map((item, i) => (
          <BarRow key={i} label={item.name} value={item.value} max={max}
            pct={item.percent} color={color} delay={0.1 + i * 0.05} />
        ))}
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════
   TAB: OVERVIEW
   ═══════════════════════════════════════════ */
function TabOverview() {
  return (
    <div className="space-y-12">
      {/* Key insights grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {keyInsights.map((ins, i) => (
          <motion.div
            key={ins.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#16161A] rounded-2xl border border-[#2A2A32]/60 p-10 group hover:border-[#6C63FF]/30 transition-colors duration-500"
          >
            <div className="font-mono text-4xl font-bold text-[#6C63FF] mb-3 tracking-tight">
              {ins.stat}
            </div>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#EAEAEF] mb-4 leading-snug">
              {ins.title}
            </h3>
            <p className="text-sm text-[#8B8B9E] leading-relaxed">{ins.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Profile stats */}
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#EAEAEF] mb-8">
          응답자 프로필
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <BigStat label="총 응답자" value={24} suffix="명" color={palette.accent} delay={0} />
          <BigStat label="초등 교사 비율" value={70.8} suffix="%" color={palette.teal} dec={1} delay={0.08} />
          <BigStat label="경력 13년 이상" value={62.5} suffix="%" color={palette.gold} dec={1} delay={0.16} />
          <BigStat label="에듀테크 주 1회+" value={54.2} suffix="%" color={palette.warm} dec={1} delay={0.24} />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card delay={0.1}>
          <Heading>근무 형태</Heading>
          <div className="mt-8 flex justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={profileData.schoolType} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value" nameKey="name" stroke="none">
                  {profileData.schoolType.map((_, i) => <Cell key={i} fill={chartColors[i]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-6">
            {profileData.schoolType.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: chartColors[i] }} />
                <span className="text-sm text-[#8B8B9E]">{d.name} <span className="font-mono font-semibold text-[#EAEAEF]">{d.ratio}%</span></span>
              </div>
            ))}
          </div>
        </Card>

        <Card delay={0.15}>
          <Heading sub="91.7%가 8년 이상 경력">수학 지도 경력</Heading>
          <div className="mt-6">
            {profileData.experience.map((d, i) => (
              <BarRow key={i} label={d.name} value={d.value} max={15} color={palette.teal} delay={0.2 + i * 0.05} />
            ))}
          </div>
        </Card>

        <Card delay={0.2}>
          <Heading sub="91.7% 사용 중, 매 수업 활용 25%">에듀테크 활용 빈도</Heading>
          <div className="mt-6">
            {profileData.edtechFrequency.map((d, i) => (
              <BarRow key={i} label={d.name} value={d.value} max={9} color={palette.gold} delay={0.2 + i * 0.05} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB: REALITY
   ═══════════════════════════════════════════ */
function TabReality() {
  return (
    <div className="space-y-12">
      {/* Chain reaction */}
      <Card className="!bg-gradient-to-br from-[#16161A] via-[#1a1520] to-[#16161A] border-[#2A2A32]">
        <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#EAEAEF] mb-10 text-center">
          학습 결손의 연쇄 반응
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4">
          {[
            { text: '하위 학년\n개념 부족', stat: '67%', color: palette.warm },
            { text: '문제 해석 불가\n시작 못함', stat: '42%', color: palette.gold },
            { text: '조금만 어려워도\n바로 포기', stat: '71%', color: palette.rose },
            { text: '학력 격차\n심화', stat: '75%', color: '#EF4444' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-36 h-36 md:w-40 md:h-40 rounded-2xl flex flex-col items-center justify-center border border-[#2A2A32] hover:scale-[1.03] transition-transform"
                style={{ background: `${step.color}08`, borderColor: `${step.color}30` }}>
                <span className="font-mono text-3xl md:text-4xl font-bold" style={{ color: step.color }}>
                  {step.stat}
                </span>
                <span className="text-xs text-[#8B8B9E] mt-3 whitespace-pre-wrap text-center leading-relaxed">
                  {step.text}
                </span>
              </div>
              {i < 3 && (
                <svg className="w-5 h-5 text-[#5C5C6F] shrink-0 max-md:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarListCard title="학생의 학습 장벽" sub="복수 응답 (n=24)" data={learningBarriers.barriers} color={palette.rose} delay={0.1} />
        <BarListCard title="수학 지도 페인포인트" sub="단일 응답" data={learningBarriers.teachingPainPoints} color={palette.gold} delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarListCard title="맞춤 지도가 어려운 구조적 이유" sub="복수 응답" data={learningBarriers.structuralReasons} color={palette.accent} delay={0.1} />
        <BarListCard title="기존 에듀테크 앱의 아쉬움" sub="복수 응답" data={painPointsData.appFrustrations} color={palette.slate} delay={0.15} />
      </div>
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
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BigStat label="피드백 ↔ 피로도" value={4.2} suffix="/5" color={palette.rose} dec={1} delay={0} />
        <BigStat label="난이도 판단 부담" value={4.0} suffix="/5" color={palette.gold} dec={1} delay={0.08} />
        <BigStat label="업무부담 '어렵다' 응답" value={79.2} suffix="%" color={palette.accent} dec={1} delay={0.16} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card delay={0.1}>
          <Heading>기초학력보장 4대 영역별 어려움</Heading>
          <div className="mt-8 flex justify-center">
            <ResponsiveContainer width="100%" height={340}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="68%">
                <PolarGrid stroke="#2A2A32" />
                <PolarAngleAxis dataKey="area" tick={{ fontSize: 13, fill: '#8B8B9E' }} />
                <PolarRadiusAxis domain={[0, 4]} tick={false} axisLine={false} />
                <Radar name="어려움" dataKey="difficulty" stroke={palette.accent} fill={palette.accent} fillOpacity={0.12} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-5 rounded-xl bg-[#6C63FF]/5 border border-[#6C63FF]/15 text-sm text-[#8B8B9E]">
            &lsquo;교사 업무 부담&rsquo;이 가장 높고, &lsquo;개별 피드백&rsquo;과 &lsquo;수준별 자료&rsquo;가 뒤를 이음
          </div>
        </Card>

        <Card delay={0.15}>
          <Heading>4대 영역 상세 분포</Heading>
          <div className="mt-8 space-y-8">
            {teacherFatigue.difficultyByArea.map((area, i) => (
              <div key={i}>
                <div className="text-sm font-medium text-[#EAEAEF]/80 mb-3">{area.area}</div>
                <div className="flex h-8 rounded-lg overflow-hidden gap-[2px]">
                  {[
                    { val: area.easy, color: diffColors.easy, lbl: '쉬움' },
                    { val: area.normal, color: diffColors.normal, lbl: '보통' },
                    { val: area.hard, color: diffColors.hard, lbl: '어려움' },
                    { val: area.veryHard, color: diffColors.veryHard, lbl: '매우 어려움' },
                  ].map((seg, j) => (
                    <div key={j} className="flex items-center justify-center text-xs font-bold text-white/90 rounded-sm"
                      style={{ width: `${(seg.val / 24) * 100}%`, background: seg.color }}
                      title={`${seg.lbl}: ${seg.val}명`}>
                      {seg.val > 2 ? seg.val : ''}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-6 justify-center mt-10">
            {[
              { label: '쉬움', color: diffColors.easy },
              { label: '보통', color: diffColors.normal },
              { label: '어려움', color: diffColors.hard },
              { label: '매우 어려움', color: diffColors.veryHard },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded" style={{ background: l.color }} />
                <span className="text-xs text-[#5C5C6F]">{l.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card delay={0.2}>
        <Heading sub="복수 응답 — AI가 개입할 수 있는 핵심 지점">
          &ldquo;조금만 도와주면 풀 수 있었던 문제&rdquo;의 특징
        </Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
          {teacherFatigue.canSolveWithHelp.map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
              className="flex items-start gap-5 p-6 rounded-xl bg-[#1E1E24] border border-[#2A2A32]/40 hover:border-[#6C63FF]/20 transition-colors"
            >
              <div className="shrink-0 w-14 h-14 rounded-xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center font-mono text-[#6C63FF] font-bold">
                {item.percent}%
              </div>
              <p className="text-[15px] text-[#EAEAEF]/80 leading-relaxed pt-2 whitespace-pre-wrap">{item.name}</p>
            </motion.div>
          ))}
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
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BigStat label="AI 문항 자동 매칭" value={4.6} suffix="/5" color={palette.accent} dec={1} />
        <BigStat label="서술형 피드백 필요성" value={4.5} suffix="/5" color={palette.teal} dec={1} delay={0.08} />
        <BigStat label="결손 파악 → 집중 학습" value={70.8} suffix="%" color={palette.warm} dec={1} delay={0.16} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card delay={0.1}>
          <Heading>AI가 줄여주길 기대하는 업무</Heading>
          <div className="mt-8 flex justify-center">
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
          <div className="mt-6 p-5 rounded-xl bg-[#6C63FF]/5 border border-[#6C63FF]/15 text-sm text-[#8B8B9E]">
            &lsquo;개별 피드백 작성&rsquo;이 <span className="font-mono font-bold text-[#6C63FF]">46%</span>로 압도적 1위
          </div>
        </Card>

        <Card delay={0.15}>
          <Heading>가장 기대하는 AI 기능</Heading>
          <div className="space-y-5 mt-8">
            {aiExpectations.desiredAIFeatures.map((feat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="p-6 rounded-xl bg-[#1E1E24] border border-[#2A2A32]/40 hover:border-[#6C63FF]/15 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[15px] font-semibold text-[#EAEAEF]">{feat.name}</span>
                  <span className="font-mono text-[15px] font-bold" style={{ color: chartColors[i] }}>{feat.percent}%</span>
                </div>
                <p className="text-sm text-[#5C5C6F] mb-4">{feat.desc}</p>
                <div className="w-full h-1.5 bg-[#222228] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bar-fill" style={{ width: `${feat.percent}%`, background: chartColors[i] }} />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card delay={0.1}>
          <Heading>풀이 단계별 분석 기능 평가</Heading>
          <div className="mt-8 flex justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={aiExpectations.stepAnalysisNeed} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" nameKey="name" stroke="none">
                  {aiExpectations.stepAnalysisNeed.map((_, i) => <Cell key={i} fill={chartColors[i]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-8">
            {aiExpectations.stepAnalysisNeed.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: chartColors[i] }} />
                <span className="text-sm text-[#8B8B9E]">{d.name} <span className="font-mono text-[#EAEAEF]">{d.percent}%</span></span>
              </div>
            ))}
          </div>
        </Card>

        <Card delay={0.15}>
          <Heading>AI 중간 단계 문제 활용 의향</Heading>
          <div className="space-y-5 mt-8 mb-8">
            {aiExpectations.steppingStoneUsage.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-3">
                  <span className="text-[15px] text-[#EAEAEF]/80">{item.name}</span>
                  <span className="font-mono text-[15px] font-semibold" style={{ color: chartColors[i] }}>{item.percent}%</span>
                </div>
                <div className="w-full h-2 bg-[#222228] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bar-fill" style={{ width: `${item.percent}%`, background: chartColors[i] }} />
                </div>
              </div>
            ))}
          </div>
          <div className="p-8 rounded-xl bg-[#F5C542]/5 border border-[#F5C542]/15 text-center">
            <div className="font-mono text-5xl font-bold text-[#F5C542] mb-3">
              <AnimNum value={62.5} suffix="%" dec={1} />
            </div>
            <p className="text-sm text-[#8B8B9E]">대부분 또는 모든 학생에게 활용하겠다고 응답</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB: FEATURES & IMPACT
   ═══════════════════════════════════════════ */
function TabFeatures() {
  return (
    <div className="space-y-12">
      {/* Must-have ranking */}
      <Card>
        <Heading sub="단일 선택">&ldquo;딱 하나만 고른다면?&rdquo;</Heading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {keyFeatures.mustHaveFeature.map((feat, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className={`relative p-8 rounded-2xl text-center transition-all ${
                i === 0
                  ? 'bg-[#6C63FF]/8 border-2 border-[#6C63FF]/30 ring-4 ring-[#6C63FF]/5'
                  : 'bg-[#1E1E24] border border-[#2A2A32]/60'
              }`}
            >
              {i === 0 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#6C63FF] text-white text-xs font-bold rounded-full tracking-wide">
                  1위
                </div>
              )}
              <div className={`font-mono text-4xl font-bold mb-4 ${i === 0 ? 'text-[#6C63FF]' : 'text-[#5C5C6F]'}`}>
                {feat.percent}%
              </div>
              <div className={`text-sm leading-snug ${i === 0 ? 'text-[#EAEAEF] font-semibold' : 'text-[#8B8B9E]'}`}>
                {feat.name}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Feedback score + AI help */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarListCard title="AI가 대신해주면 가장 도움되는 것" sub="복수 응답" data={keyFeatures.aiHelpItems} color={palette.teal} delay={0.1} />

        <Card delay={0.15}>
          <div className="flex items-center justify-between mb-8">
            <Heading>서술형 풀이 피드백 필요성</Heading>
            <div className="px-4 py-1.5 bg-[#2DD4A8]/10 rounded-full text-xs font-bold text-[#2DD4A8] border border-[#2DD4A8]/20 tracking-wide">
              전원 4점+
            </div>
          </div>
          <div className="text-center py-10">
            <div className="font-mono text-7xl md:text-8xl font-bold text-[#2DD4A8] mb-5 tracking-tighter">
              <AnimNum value={4.5} suffix="" dec={1} />
              <span className="text-3xl text-[#5C5C6F] ml-1">/5</span>
            </div>
            <p className="text-base text-[#8B8B9E] mb-8">24명 전원이 4점 이상 부여</p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-mono font-bold"
                  style={{
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
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#EAEAEF]">
        AI가 바꿀 교육 현장
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BarListCard title="절약하고 싶은 시간" data={impactData.timeSavings} color={palette.gold} />
        <BarListCard title="수포자에게 줄 가장 큰 영향" data={impactData.impactOnStruggling} color={palette.teal} delay={0.05} />
        <BarListCard title="대시보드 우선 지표" data={impactData.dashboardPriority} color={palette.accent} delay={0.1} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarListCard title="풀이 데이터 활용 계획" sub="복수 응답" data={impactData.dataUsage} color={palette.accent} />

        <Card delay={0.1}>
          <Heading>AI가 가장 효과적인 학생 수준</Heading>
          <div className="mt-8 flex justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={impactData.effectiveLevel} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" nameKey="name" stroke="none">
                  {impactData.effectiveLevel.map((_, i) => <Cell key={i} fill={chartColors[i]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-6">
            {impactData.effectiveLevel.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: chartColors[i] }} />
                <span className="text-sm text-[#8B8B9E]">{d.name} <span className="font-mono text-[#EAEAEF]">{d.percent}%</span></span>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-xl bg-[#2DD4A8]/5 border border-[#2DD4A8]/15">
            <div className="text-base font-bold text-[#2DD4A8] mb-2">핵심 타겟: 중위권 (50%)</div>
            <p className="text-sm text-[#8B8B9E] leading-relaxed">
              &ldquo;{teacherVoices.levelEffectivenessReasons.mid}&rdquo;
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB: VOICES
   ═══════════════════════════════════════════ */
function TabVoices() {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card delay={0}>
          <h3 className="text-xl font-bold text-[#FF4F81] mb-10">한계에 부딪혔던 순간</h3>
          <div className="space-y-8">
            {teacherVoices.struggles.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="quote-accent"
              >
                <span className="inline-block px-3 py-1 bg-[#FF4F81]/8 text-[#FF4F81] text-xs font-semibold rounded-full mb-3 border border-[#FF4F81]/15">
                  {s.theme}
                </span>
                <p className="text-[15px] text-[#EAEAEF]/80 leading-relaxed">&ldquo;{s.quote}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card delay={0.1}>
          <h3 className="text-xl font-bold text-[#6C63FF] mb-10">AI 서비스에 바라는 것</h3>
          <div className="space-y-5">
            {teacherVoices.additionalWishes.map((wish, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="flex gap-5 p-6 rounded-xl bg-[#1E1E24] border border-[#2A2A32]/40 hover:border-[#6C63FF]/20 transition-colors"
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center font-mono text-[#6C63FF] font-bold text-sm">
                  {i + 1}
                </div>
                <p className="text-[15px] text-[#EAEAEF]/80 leading-relaxed pt-1">&ldquo;{wish}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      <Card delay={0.15}>
        <Heading>서술형 피드백이 필요한 이유</Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
          {teacherVoices.feedbackReasons.map((reason, i) => (
            <motion.div key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="quote-accent py-2"
            >
              <p className="text-[15px] text-[#EAEAEF]/75 leading-relaxed">&ldquo;{reason}&rdquo;</p>
            </motion.div>
          ))}
        </div>
      </Card>

      <Card delay={0.2}>
        <Heading>학생 수준별 AI 효과</Heading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            { level: '상위권', color: palette.accent, text: teacherVoices.levelEffectivenessReasons.high },
            { level: '중위권', color: palette.teal, text: teacherVoices.levelEffectivenessReasons.mid },
            { level: '하위권', color: palette.warm, text: teacherVoices.levelEffectivenessReasons.low },
          ].map((item, i) => (
            <div key={i} className="p-8 bg-[#1E1E24] rounded-xl border border-[#2A2A32]/40">
              <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-5 tracking-wide"
                style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}25` }}>
                {item.level}
              </div>
              <p className="text-[15px] text-[#EAEAEF]/75 leading-relaxed">&ldquo;{item.text}&rdquo;</p>
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
    <div className="noise-bg min-h-screen">
      {/* ─── Hero header ─── */}
      <header className="hero-mesh relative">
        <div className="max-w-[1200px] mx-auto px-8 md:px-12 pt-20 pb-16 md:pt-28 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#2DD4A8] pulse-dot" />
              <span className="text-sm text-[#5C5C6F] tracking-wider font-mono">
                {overview.totalResponses}명 응답 &middot; {overview.surveyPeriod}
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-6xl lg:text-7xl font-black text-[#EAEAEF] leading-[1.15] mb-6 tracking-tight">
              수학 교육의 현실,<br />
              <span className="bg-gradient-to-r from-[#6C63FF] via-[#2DD4A8] to-[#F5C542] bg-clip-text text-transparent">
                AI가 풀어야 할 과제
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[#8B8B9E] max-w-2xl leading-relaxed">
              경력 평균 10년 이상의 수학 교사 24명이 전하는<br className="hidden md:block" />
              교육 현장의 진짜 목소리와 AI 서비스에 거는 기대
            </p>
          </motion.div>
        </div>
      </header>

      {/* ─── Sticky Tab Bar ─── */}
      <div className="sticky top-0 z-50 bg-[#0C0C0F]/95 backdrop-blur-xl border-b border-[#2A2A32]">
        <div className="max-w-[1200px] mx-auto px-8 md:px-12">
          <div className="flex gap-1 overflow-x-auto py-1 -mb-px" style={{ scrollbarWidth: 'none' }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.id ? 'text-[#EAEAEF]' : 'text-[#5C5C6F] hover:text-[#8B8B9E]'
                }`}
              >
                {t.label}
                {tab === t.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6C63FF]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Tab Content ─── */}
      <main className="max-w-[1200px] mx-auto px-8 md:px-12 py-12 md:py-16">
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
      </main>

      {/* ─── Conclusion ─── */}
      <div className="max-w-[1200px] mx-auto px-8 md:px-12 pb-20">
        <div className="rounded-3xl p-12 md:p-16 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #16161A 0%, #1a1525 50%, #16161A 100%)',
            border: '1px solid #2A2A3240',
          }}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#6C63FF]/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#2DD4A8]/5 rounded-full blur-[100px]" />
          <div className="relative">
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-black text-[#EAEAEF] mb-4 text-center tracking-tight">
              핵심 시사점
            </h2>
            <p className="text-[#5C5C6F] mb-14 text-center text-base">
              24명의 현장 교사 설문이 가리키는 AI 수학 서비스의 방향
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: '01', title: '결손 진단이 시작점', text: '67%가 하위 학년 개념 부족을 1순위 학습 장벽으로 꼽았습니다. 결손 지점의 정확한 진단이 모든 것의 출발점입니다.', color: palette.rose },
                { num: '02', title: '피드백의 자동화', text: '서술형 피드백 필요성 4.5/5, 전원 합의. 하지만 교사 피로도 4.2/5. AI가 이 딜레마를 해결해야 합니다.', color: palette.accent },
                { num: '03', title: '성공 경험의 설계', text: "수포자에게 가장 큰 영향은 '단계별 힌트로 스스로 해결하는 성공 경험'(63%). 사고 유도가 핵심입니다.", color: palette.teal },
              ].map(item => (
                <div key={item.num} className="p-8 rounded-2xl bg-[#0C0C0F]/40 border border-[#2A2A32]/40">
                  <div className="font-mono text-3xl font-bold mb-5" style={{ color: item.color }}>
                    {item.num}
                  </div>
                  <h3 className="text-lg font-bold text-[#EAEAEF] mb-4">{item.title}</h3>
                  <p className="text-sm text-[#8B8B9E] leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#222228] py-10">
        <div className="max-w-[1200px] mx-auto px-8 md:px-12 text-center">
          <p className="text-sm text-[#5C5C6F]">
            수학 AI 서비스 기획을 위한 현장 교사 설문 분석 &middot; {overview.totalResponses}명 응답 &middot; {overview.surveyPeriod}
          </p>
        </div>
      </footer>
    </div>
  );
}
