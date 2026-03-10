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

/* ─── Colors ─── */
const C = {
  indigo: '#4f46e5', sky: '#0ea5e9', emerald: '#10b981',
  amber: '#f59e0b', coral: '#f43f5e', violet: '#8b5cf6', slate: '#64748b',
};
const CHART_C = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#64748b'];
const DIFF_C = { easy: '#10b981', normal: '#f59e0b', hard: '#f97316', veryHard: '#ef4444' };

/* ─── Hooks ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.unobserve(el); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Animated number ─── */
function Num({ value, suffix = '', dec = 0 }: { value: number; suffix?: string; dec?: number }) {
  const [d, setD] = useState(0);
  const { ref, visible } = useInView();
  useEffect(() => {
    if (!visible) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 1000, 1);
      setD(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, value]);
  return <span ref={ref}>{dec > 0 ? d.toFixed(dec) : Math.round(d)}{suffix}</span>;
}

/* ─── Tooltip ─── */
function Tip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-100 text-sm">
      <p className="font-semibold text-slate-800 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-slate-500">{p.name}: <span className="font-bold text-slate-800">{p.value}명</span></p>
      ))}
    </div>
  );
}

/* ─── Card ─── */
function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8 ${className}`}>
      {children}
    </div>
  );
}

/* ─── Progress bar row ─── */
function ProgressRow({ label, value, max, percent, color }: {
  label: string; value: number; max: number; percent?: number; color: string;
}) {
  return (
    <div className="py-3">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[15px] text-slate-700 leading-snug">{label}</span>
        <span className="text-[15px] font-bold text-slate-900 ml-4 tabular-nums shrink-0">
          {percent !== undefined ? `${percent}%` : `${value}명`}
        </span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full progress-animated" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  );
}

/* ─── Stat card ─── */
function Stat({ label, value, suffix, color, dec = 0 }: {
  label: string; value: number; suffix?: string; color: string; dec?: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8 text-center hover:shadow-md transition-shadow">
      <div className="text-4xl md:text-5xl font-extrabold mb-3" style={{ color }}>
        <Num value={value} suffix={suffix} dec={dec} />
      </div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

/* ─── BarList (horizontal bars in a card) ─── */
function BarList({ title, subtitle, data, color = C.indigo }: {
  title: string; subtitle?: string;
  data: { name: string; value: number; percent?: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <Card>
      <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-slate-400 mb-6">{subtitle}</p>}
      {!subtitle && <div className="mb-6" />}
      <div className="divide-y divide-slate-50">
        {data.map((item, i) => (
          <ProgressRow key={i} label={item.name} value={item.value} max={max} percent={item.percent} color={color} />
        ))}
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB SECTIONS
   ═══════════════════════════════════════════════════════════════ */

/* ─── TAB 0: OVERVIEW ─── */
function TabOverview() {
  return (
    <div className="tab-enter space-y-10">
      {/* Key insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {keyInsights.map((ins) => (
          <div key={ins.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="text-4xl font-extrabold text-indigo-600 mb-2">{ins.stat}</div>
            <h3 className="text-lg font-bold text-slate-800 mb-3">{ins.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{ins.description}</p>
          </div>
        ))}
      </div>

      {/* Profile summary */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-6">응답자 프로필</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Stat label="총 응답자" value={24} suffix="명" color={C.indigo} />
          <Stat label="초등 교사 비율" value={70.8} suffix="%" color={C.sky} dec={1} />
          <Stat label="경력 13년 이상" value={62.5} suffix="%" color={C.emerald} dec={1} />
          <Stat label="에듀테크 주 1회+" value={54.2} suffix="%" color={C.violet} dec={1} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-slate-800 mb-6">근무 형태</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={profileData.schoolType} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" nameKey="name">
                {profileData.schoolType.map((_, i) => <Cell key={i} fill={CHART_C[i]} />)}
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-8 mt-4">
            {profileData.schoolType.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: CHART_C[i] }} />
                <span className="text-sm text-slate-600">{d.name} <span className="font-semibold">{d.ratio}%</span></span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-slate-800 mb-2">수학 지도 경력</h3>
          <p className="text-sm text-slate-400 mb-6">91.7%가 8년 이상 경력의 베테랑</p>
          <div className="divide-y divide-slate-50">
            {profileData.experience.map((d, i) => (
              <ProgressRow key={i} label={d.name} value={d.value} max={15} color={C.sky} />
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-slate-800 mb-2">에듀테크 활용 빈도</h3>
          <p className="text-sm text-slate-400 mb-6">91.7% 사용 중, 매 수업은 25%</p>
          <div className="divide-y divide-slate-50">
            {profileData.edtechFrequency.map((d, i) => (
              <ProgressRow key={i} label={d.name} value={d.value} max={9} color={C.emerald} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── TAB 1: CLASSROOM REALITY ─── */
function TabReality() {
  return (
    <div className="tab-enter space-y-10">
      {/* Chain reaction */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-none">
        <h3 className="text-xl font-bold text-white mb-8 text-center">학습 결손의 연쇄 반응</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
          {[
            { text: '하위 학년\n개념 부족', stat: '67%', color: '#f43f5e' },
            { text: '문제 해석 불가\n풀이 시작 못함', stat: '42%', color: '#f97316' },
            { text: '조금만 어려워도\n바로 포기', stat: '71%', color: '#ef4444' },
            { text: '학력 격차\n심화', stat: '75%', color: '#dc2626' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-4 md:gap-6">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl flex flex-col items-center justify-center border-2 hover:scale-105 transition-transform"
                style={{ borderColor: step.color, background: `${step.color}12` }}>
                <span className="text-3xl font-extrabold" style={{ color: step.color }}>{step.stat}</span>
                <span className="text-xs text-slate-300 mt-2 whitespace-pre-wrap text-center leading-tight">{step.text}</span>
              </div>
              {i < 3 && (
                <svg className="w-6 h-6 text-slate-500 shrink-0 max-md:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarList title="학생의 학습 장벽" subtitle="복수 응답 (n=24)" data={learningBarriers.barriers} color={C.coral} />
        <BarList title="수학 지도 페인포인트" subtitle="단일 응답" data={learningBarriers.teachingPainPoints} color={C.amber} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarList title="맞춤 지도가 어려운 구조적 이유" subtitle="복수 응답" data={learningBarriers.structuralReasons} color={C.violet} />
        <BarList title="기존 에듀테크 앱의 아쉬움" subtitle="복수 응답" data={painPointsData.appFrustrations} color={C.slate} />
      </div>
    </div>
  );
}

/* ─── TAB 2: TEACHER FATIGUE ─── */
function TabFatigue() {
  const radarData = teacherFatigue.difficultyByArea.map(d => ({
    area: d.area,
    difficulty: (d.hard * 3 + d.veryHard * 4 + d.normal * 2 + d.easy * 1) / 24,
  }));

  return (
    <div className="tab-enter space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Stat label="피드백 ↔ 피로도" value={4.2} suffix="/5" color={C.coral} dec={1} />
        <Stat label="난이도 판단 부담" value={4.0} suffix="/5" color={C.amber} dec={1} />
        <Stat label="교사 업무부담 '어렵다'" value={79.2} suffix="%" color={C.violet} dec={1} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-slate-800 mb-8">기초학력보장 4대 영역별 어려움</h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="68%">
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="area" tick={{ fontSize: 13, fill: '#475569' }} />
              <PolarRadiusAxis domain={[0, 4]} tick={false} axisLine={false} />
              <Radar name="어려움" dataKey="difficulty" stroke={C.indigo} fill={C.indigo} fillOpacity={0.15} strokeWidth={2.5} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-indigo-50 rounded-xl text-sm text-indigo-700">
            &lsquo;교사 업무 부담&rsquo;이 가장 높고, &lsquo;개별 피드백&rsquo;과 &lsquo;수준별 자료 제공&rsquo;이 그 뒤를 이음
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-slate-800 mb-8">4대 영역 상세 응답 분포</h3>
          <div className="space-y-6">
            {teacherFatigue.difficultyByArea.map((area, i) => (
              <div key={i}>
                <div className="text-sm font-semibold text-slate-700 mb-2">{area.area}</div>
                <div className="flex h-8 rounded-lg overflow-hidden gap-0.5">
                  {[
                    { val: area.easy, color: DIFF_C.easy, label: '쉬움' },
                    { val: area.normal, color: DIFF_C.normal, label: '보통' },
                    { val: area.hard, color: DIFF_C.hard, label: '어려움' },
                    { val: area.veryHard, color: DIFF_C.veryHard, label: '매우 어려움' },
                  ].map((seg, j) => (
                    <div key={j}
                      className="flex items-center justify-center text-xs font-bold text-white rounded-sm"
                      style={{ width: `${(seg.val / 24) * 100}%`, background: seg.color }}
                      title={`${seg.label}: ${seg.val}명`}
                    >
                      {seg.val > 2 ? seg.val : ''}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-6 justify-center mt-8">
            {[
              { label: '쉬움', color: DIFF_C.easy },
              { label: '보통', color: DIFF_C.normal },
              { label: '어려움', color: DIFF_C.hard },
              { label: '매우 어려움', color: DIFF_C.veryHard },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: l.color }} />
                <span className="text-sm text-slate-500">{l.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-bold text-slate-800 mb-2">&ldquo;조금만 도와주면 풀 수 있었던 문제&rdquo;의 특징</h3>
        <p className="text-sm text-slate-400 mb-8">복수 응답 — AI가 개입할 수 있는 핵심 지점</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {teacherFatigue.canSolveWithHelp.map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl hover:bg-indigo-50/60 transition-colors">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {item.percent}%
              </div>
              <p className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-wrap pt-1">{item.name}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ─── TAB 3: AI EXPECTATIONS ─── */
function TabAI() {
  return (
    <div className="tab-enter space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Stat label="AI 문항 자동 매칭 필요성" value={4.6} suffix="/5" color={C.indigo} dec={1} />
        <Stat label="서술형 피드백 필요성" value={4.5} suffix="/5" color={C.sky} dec={1} />
        <Stat label="결손 파악 → 집중 학습" value={70.8} suffix="%" color={C.emerald} dec={1} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-slate-800 mb-8">AI가 줄여주길 기대하는 업무</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={aiExpectations.reduceWorkload} layout="vertical" margin={{ left: 20, right: 30, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 13, fill: '#475569' }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                {aiExpectations.reduceWorkload.map((_, i) => <Cell key={i} fill={CHART_C[i % CHART_C.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-6 p-4 bg-indigo-50 rounded-xl text-sm text-indigo-700">
            &lsquo;개별 피드백 작성&rsquo;이 46%로 압도적 1위 — AI의 핵심 가치 영역
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-slate-800 mb-8">가장 기대하는 AI 기능</h3>
          <div className="space-y-5">
            {aiExpectations.desiredAIFeatures.map((feat, i) => (
              <div key={i} className="p-5 bg-slate-50 rounded-xl hover:bg-indigo-50/50 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[15px] font-semibold text-slate-800">{feat.name}</span>
                  <span className="text-[15px] font-bold" style={{ color: CHART_C[i] }}>{feat.percent}%</span>
                </div>
                <p className="text-sm text-slate-400 mb-3">{feat.desc}</p>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full progress-animated" style={{ width: `${feat.percent}%`, background: CHART_C[i] }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-slate-800 mb-8">풀이 단계별 분석 기능 평가</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={aiExpectations.stepAnalysisNeed} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name">
                {aiExpectations.stepAnalysisNeed.map((_, i) => <Cell key={i} fill={CHART_C[i]} />)}
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {aiExpectations.stepAnalysisNeed.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: CHART_C[i] }} />
                <span className="text-sm text-slate-600">{d.name} ({d.percent}%)</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-emerald-50 rounded-xl text-sm text-emerald-700">
            87.5%가 &lsquo;보조 이상&rsquo;으로 평가 — 단계별 분석은 보편적 니즈
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-slate-800 mb-8">AI 중간 단계 문제 활용 의향</h3>
          <div className="space-y-5 mb-8">
            {aiExpectations.steppingStoneUsage.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <span className="text-[15px] text-slate-700">{item.name}</span>
                  <span className="text-[15px] font-bold" style={{ color: CHART_C[i] }}>{item.percent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full progress-animated" style={{ width: `${item.percent}%`, background: CHART_C[i] }} />
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-amber-50 rounded-xl border border-amber-100 text-center">
            <div className="text-4xl font-extrabold text-amber-600 mb-2">
              <Num value={62.5} suffix="%" dec={1} />
            </div>
            <p className="text-sm text-amber-700">
              대부분 또는 모든 학생에게 활용하겠다고 응답
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── TAB 4: FEATURES & IMPACT ─── */
function TabFeatures() {
  return (
    <div className="tab-enter space-y-10">
      {/* Must-have ranking */}
      <Card>
        <h3 className="text-lg font-bold text-slate-800 mb-2">&ldquo;딱 하나만 고른다면?&rdquo;</h3>
        <p className="text-sm text-slate-400 mb-8">에듀테크 필수 기능 — 단일 선택</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyFeatures.mustHaveFeature.map((feat, i) => (
            <div key={i} className={`relative p-6 rounded-2xl text-center transition-all hover:scale-[1.02] ${
              i === 0 ? 'bg-indigo-50 border-2 border-indigo-200 ring-4 ring-indigo-50' : 'bg-slate-50 border border-slate-200'
            }`}>
              {i === 0 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
                  1위
                </div>
              )}
              <div className={`text-4xl font-extrabold mb-3 ${i === 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                {feat.percent}%
              </div>
              <div className={`text-sm font-medium leading-snug ${i === 0 ? 'text-indigo-900' : 'text-slate-600'}`}>
                {feat.name}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Descriptive feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarList title="AI가 대신해주면 가장 도움되는 것" subtitle="복수 응답" data={keyFeatures.aiHelpItems} color={C.sky} />

        <Card>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800">서술형 풀이 피드백 필요성</h3>
            <div className="px-3 py-1.5 bg-emerald-100 rounded-full text-xs font-bold text-emerald-700">전원 4점+</div>
          </div>
          <div className="text-center py-8">
            <div className="text-7xl font-extrabold text-emerald-600 mb-4">
              <Num value={4.5} suffix="/5" dec={1} />
            </div>
            <p className="text-base text-slate-500 mb-8">24명 전원이 4점 이상 (4점 12명, 5점 12명)</p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{ background: n >= 4 ? C.emerald : '#f1f5f9', color: n >= 4 ? 'white' : '#94a3b8' }}>
                  {n}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 p-4 bg-emerald-50 rounded-xl text-sm text-emerald-700">
            설문 전 항목 중 가장 높은 합의 — 서술형 피드백은 필수 기능
          </div>
        </Card>
      </div>

      {/* Impact */}
      <h3 className="text-xl font-bold text-slate-800">AI가 바꿀 교육 현장</h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BarList title="절약하고 싶은 시간" data={impactData.timeSavings} color={C.amber} />
        <BarList title="수포자에게 줄 가장 큰 영향" data={impactData.impactOnStruggling} color={C.emerald} />
        <BarList title="대시보드 우선 지표" data={impactData.dashboardPriority} color={C.violet} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarList title="풀이 데이터 활용 계획" subtitle="복수 응답 — 75%가 학부모 상담 근거로 활용" data={impactData.dataUsage} color={C.indigo} />
        <Card>
          <h3 className="text-lg font-bold text-slate-800 mb-8">AI가 가장 효과적인 학생 수준</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={impactData.effectiveLevel} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" nameKey="name">
                {impactData.effectiveLevel.map((_, i) => <Cell key={i} fill={CHART_C[i]} />)}
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            {impactData.effectiveLevel.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: CHART_C[i] }} />
                <span className="text-sm text-slate-600">{d.name} ({d.percent}%)</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-5 bg-sky-50 rounded-xl border border-sky-100">
            <div className="text-base font-bold text-sky-800 mb-1">핵심 타겟: 중위권 (50%)</div>
            <p className="text-sm text-sky-600 leading-relaxed">
              &ldquo;{teacherVoices.levelEffectivenessReasons.mid}&rdquo;
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── TAB 5: VOICES ─── */
function TabVoices() {
  return (
    <div className="tab-enter space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-coral mb-8">한계에 부딪혔던 순간</h3>
          <div className="space-y-5">
            {teacherVoices.struggles.map((s, i) => (
              <div key={i} className="quote-border pl-5 py-1">
                <span className="inline-block px-2.5 py-1 bg-rose-50 text-coral text-xs font-semibold rounded-full mb-2">{s.theme}</span>
                <p className="text-[15px] text-slate-700 leading-relaxed">&ldquo;{s.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-indigo-600 mb-8">AI 서비스에 바라는 것</h3>
          <div className="space-y-5">
            {teacherVoices.additionalWishes.map((wish, i) => (
              <div key={i} className="flex gap-4 p-5 bg-indigo-50/40 rounded-xl hover:bg-indigo-50 transition-colors">
                <div className="shrink-0 w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                  {i + 1}
                </div>
                <p className="text-[15px] text-slate-700 leading-relaxed pt-0.5">&ldquo;{wish}&rdquo;</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-bold text-slate-800 mb-8">서술형 피드백이 필요한 이유</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teacherVoices.feedbackReasons.map((reason, i) => (
            <div key={i} className="quote-border pl-5 py-2">
              <p className="text-[15px] text-slate-700 leading-relaxed">&ldquo;{reason}&rdquo;</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-slate-800 mb-8">학생 수준별 AI 효과에 대한 교사 의견</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { level: '상위권', color: C.indigo, text: teacherVoices.levelEffectivenessReasons.high },
            { level: '중위권', color: C.sky, text: teacherVoices.levelEffectivenessReasons.mid },
            { level: '하위권', color: C.emerald, text: teacherVoices.levelEffectivenessReasons.low },
          ].map((item, i) => (
            <div key={i} className="p-6 bg-slate-50 rounded-xl">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-4" style={{ background: item.color }}>
                {item.level}
              </div>
              <p className="text-[15px] text-slate-700 leading-relaxed">&ldquo;{item.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'overview', label: '개요', icon: '📊' },
  { id: 'reality', label: '교육 현실', icon: '🏫' },
  { id: 'fatigue', label: '교사 부담', icon: '⏱' },
  { id: 'ai', label: 'AI 기대', icon: '🤖' },
  { id: 'features', label: '기능 & 임팩트', icon: '⚡' },
  { id: 'voices', label: '현장 목소리', icon: '💬' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen">
      {/* ─── Header ─── */}
      <header className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-12 md:pt-20 md:pb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm text-white/70 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {overview.totalResponses}명 응답 &middot; {overview.surveyPeriod}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            수학 교육의 현실,{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
              AI가 풀어야 할 과제
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
            경력 평균 10년 이상의 수학 교사 24명이 전하는 교육 현장의 진짜 목소리
          </p>
        </div>
      </header>

      {/* ─── Tab Navigation ─── */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto py-1 -mb-px scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Tab Content ─── */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {activeTab === 'overview' && <TabOverview />}
        {activeTab === 'reality' && <TabReality />}
        {activeTab === 'fatigue' && <TabFatigue />}
        {activeTab === 'ai' && <TabAI />}
        {activeTab === 'features' && <TabFeatures />}
        {activeTab === 'voices' && <TabVoices />}
      </main>

      {/* ─── Conclusion (always visible) ─── */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-10 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 text-center">핵심 시사점</h2>
            <p className="text-slate-400 mb-12 text-center">24명의 현장 교사 설문이 가리키는 AI 수학 서비스의 방향</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  num: '01', title: '결손 진단이 시작점',
                  text: '67%가 하위 학년 개념 부족을 1순위 학습 장벽으로 꼽았습니다. 결손 지점의 정확한 진단이 모든 것의 출발점입니다.',
                  gradient: 'from-rose-400 to-amber-400',
                },
                {
                  num: '02', title: '피드백의 자동화',
                  text: '서술형 피드백 필요성 4.5/5, 전원 합의. 하지만 교사 피로도 4.2/5. AI가 이 딜레마를 해결해야 합니다.',
                  gradient: 'from-indigo-400 to-sky-400',
                },
                {
                  num: '03', title: '성공 경험의 설계',
                  text: "수포자에게 가장 큰 영향은 '단계별 힌트로 스스로 해결하는 성공 경험'(63%). 사고 유도가 핵심입니다.",
                  gradient: 'from-emerald-400 to-cyan-400',
                },
              ].map(item => (
                <div key={item.num} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
                  <div className={`text-3xl font-extrabold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent mb-4`}>
                    {item.num}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-200 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-400">
            수학 AI 서비스 기획을 위한 현장 교사 설문 분석 &middot; {overview.totalResponses}명 응답 &middot; {overview.surveyPeriod}
          </p>
        </div>
      </footer>
    </div>
  );
}
