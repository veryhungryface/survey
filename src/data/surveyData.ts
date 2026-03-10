// 수학 AI 서비스 기획을 위한 현장 교사 설문 - 가공 데이터
// 총 24명 응답 (2026.02.23 ~ 2026.02.27)

export const overview = {
  totalResponses: 24,
  surveyPeriod: '2026.02.23 ~ 2026.02.27',
  title: '수학 AI 서비스 기획을 위한 현장 교사 설문',
};

export const profileData = {
  schoolType: [
    { name: '초등학교 교사', value: 17, ratio: 70.8 },
    { name: '중학교 교사', value: 7, ratio: 29.2 },
  ],
  experience: [
    { name: '4~7년', value: 2 },
    { name: '8~12년', value: 7 },
    { name: '13년 이상', value: 15 },
  ],
  edtechFrequency: [
    { name: '거의 없음', value: 2 },
    { name: '월 1~2회', value: 9 },
    { name: '주 1~2회', value: 7 },
    { name: '매 수업 시간', value: 6 },
  ],
};

export const painPointsData = {
  appFrustrations: [
    { name: '단순 정답률 중심 분석', value: 11, percent: 45.8 },
    { name: '세밀하지 않은 난이도 조절', value: 9, percent: 37.5 },
    { name: '학생 흥미 요소 부족', value: 8, percent: 33.3 },
    { name: '복잡한 UI/UX', value: 7, percent: 29.2 },
    { name: '모호한 데이터 분석', value: 6, percent: 25.0 },
    { name: '낮은 문제 품질', value: 5, percent: 20.8 },
    { name: '수업 연계성 부족', value: 2, percent: 8.3 },
  ],
  tabletDiscomfort: [
    { name: '전혀 없다', value: 1, percent: 4.2 },
    { name: '조금 있다', value: 17, percent: 70.8 },
    { name: '많이 있다', value: 6, percent: 25.0 },
  ],
  tabletIssueKeywords: [
    { keyword: '풀이 과정 작성 불편', count: 12 },
    { keyword: '필기/입력 인식 문제', count: 5 },
    { keyword: '가독성 저하', count: 4 },
    { keyword: '기기 오류/버그', count: 3 },
    { keyword: '초기 설정 번거로움', count: 2 },
  ],
};

export const learningBarriers = {
  barriers: [
    { name: '하위 학년 개념 부족', value: 16, percent: 66.7 },
    { name: '오류 자각 불능 / 계산 실수', value: 10, percent: 41.7 },
    { name: '문제 해석 불가 / 풀이 시작 못함', value: 10, percent: 41.7 },
    { name: '막히면 바로 포기', value: 9, percent: 37.5 },
  ],
  problemSituations: [
    { name: '조금만 어려워도\n바로 포기', value: 17, percent: 70.8 },
    { name: '난이도 판단\n애매', value: 4, percent: 16.7 },
    { name: '교사가 직접\n문제 변형', value: 2, percent: 8.3 },
    { name: '너무 쉬운\n반복', value: 1, percent: 4.2 },
  ],
  teachingPainPoints: [
    { name: '학력 격차로 하위권 포기', value: 8, percent: 33.3 },
    { name: '서술형 풀이 점검/피드백 시간 과다', value: 7, percent: 29.2 },
    { name: '실시간 개별 힌트 물리적 불가', value: 5, percent: 20.8 },
    { name: '오답 원인 파악 어려움', value: 4, percent: 16.7 },
  ],
  structuralReasons: [
    { name: '학생 간 수준 격차', value: 18, percent: 75.0 },
    { name: '행정·평가 업무 과중', value: 10, percent: 41.7 },
    { name: '수업 시수 부족', value: 7, percent: 29.2 },
  ],
};

export const teacherFatigue = {
  feedbackFatigueAvg: 4.2,
  feedbackFatigueDistribution: [
    { score: '2점', value: 2 },
    { score: '3점', value: 2 },
    { score: '4점', value: 8 },
    { score: '5점', value: 12 },
  ],
  difficultyByArea: [
    {
      area: '학생 수준 파악',
      easy: 9,
      normal: 5,
      hard: 7,
      veryHard: 3,
    },
    {
      area: '개별 피드백 제공',
      easy: 4,
      normal: 1,
      hard: 14,
      veryHard: 5,
    },
    {
      area: '수준별 자료 제공',
      easy: 4,
      normal: 2,
      hard: 14,
      veryHard: 4,
    },
    {
      area: '교사 업무 부담',
      easy: 1,
      normal: 4,
      hard: 9,
      veryHard: 10,
    },
  ],
  canSolveWithHelp: [
    { name: '이전 학년 결손 지점 하나만\n짚어주면 풀리는 문제', value: 14, percent: 58.3 },
    { name: '발문/조건 해석만\n도와주면 수식 세우는 문제', value: 12, percent: 50.0 },
    { name: '첫 단추만 잡아주면\n끝까지 해결 가능한 문제', value: 7, percent: 29.2 },
    { name: '연산 한 단계에서\n반복적으로 막히는 문제', value: 4, percent: 16.7 },
  ],
  difficultyBurdenAvg: 4.0,
};

export const aiExpectations = {
  levelImprovementApproach: [
    { name: '결손 지점 파악 → 집중 학습', value: 17, percent: 70.8 },
    { name: '학생 수준에 따라 다름', value: 7, percent: 29.2 },
  ],
  reduceWorkload: [
    { name: '개별 피드백 작성', value: 11, percent: 45.8 },
    { name: '문제 선별', value: 5, percent: 20.8 },
    { name: '풀이 설명 준비', value: 3, percent: 12.5 },
    { name: '학습 기록·관리', value: 2, percent: 8.3 },
    { name: '오답 분석', value: 2, percent: 8.3 },
    { name: '상세 진단', value: 1, percent: 4.2 },
  ],
  autoMatchingNeed: {
    avg: 4.6,
    distribution: [
      { score: '4점', value: 9 },
      { score: '5점', value: 15 },
    ],
  },
  stepAnalysisNeed: [
    { name: '보조 자료 수준', value: 3, percent: 12.5 },
    { name: '일부 학생에게 유용', value: 7, percent: 29.2 },
    { name: '자주 활용 가능', value: 7, percent: 29.2 },
    { name: '꼭 필요한 기능', value: 7, percent: 29.2 },
  ],
  desiredAIFeatures: [
    { name: '사고 유도형 힌트', value: 10, percent: 41.7, desc: '"이 단계에서 부호를 확인해 볼까?" 같은 자가 수정 유도' },
    { name: '오류 지점 하이라이트', value: 8, percent: 33.3, desc: '논리가 끊긴 정확한 지점을 시각적으로 표시' },
    { name: '징검다리 문항', value: 4, percent: 16.7, desc: '사고 수준에 맞는 저난도 유사 문항 즉시 노출' },
    { name: '실시간 수식 검증', value: 2, percent: 8.3, desc: '풀이의 논리적 타당성 즉시 확인' },
  ],
  steppingStoneUsage: [
    { name: '필수적 활용', value: 3, percent: 12.5 },
    { name: '대부분 학생에게 활용', value: 12, percent: 50.0 },
    { name: '일부 학생에게만 활용', value: 9, percent: 37.5 },
  ],
};

export const keyFeatures = {
  mustHaveFeature: [
    { name: '개인별 맞춤 문제 제공', value: 10, percent: 41.7 },
    { name: '학습 결손 지점 자동 분석', value: 7, percent: 29.2 },
    { name: '풀이 과정 기반 피드백', value: 4, percent: 16.7 },
    { name: '기타', value: 3, percent: 12.5 },
  ],
  descriptiveFeedbackNeed: {
    avg: 4.5,
    fourPoints: 12,
    fivePoints: 12,
    totalPercent: 100,
  },
  aiHelpItems: [
    { name: '막힌 사고 단계 표시', value: 14, percent: 58.3 },
    { name: '오답 패턴 요약', value: 10, percent: 41.7 },
    { name: '설명용 풀이 생성', value: 7, percent: 29.2 },
    { name: '피드백 문장 초안', value: 4, percent: 16.7 },
  ],
};

export const impactData = {
  timeSavings: [
    { name: '보충 학습지 선별/제작', value: 9, percent: 37.5 },
    { name: '서술형 풀이 채점/분석', value: 8, percent: 33.3 },
    { name: '오답 원인 개별 면담', value: 7, percent: 29.2 },
  ],
  impactOnStruggling: [
    { name: '단계별 힌트로 성공 경험 제공', value: 15, percent: 62.5 },
    { name: '풀이 과정 집중 습관', value: 4, percent: 16.7 },
    { name: '결손 즉각 보완', value: 3, percent: 12.5 },
    { name: '포기하지 않는 시도', value: 2, percent: 8.3 },
  ],
  dashboardPriority: [
    { name: '학생별 취약 사고 단계', value: 11, percent: 45.8 },
    { name: '학급 전체 오답률 높은 구간', value: 6, percent: 25.0 },
    { name: '실시간 풀이 과정/학습 태도', value: 6, percent: 25.0 },
    { name: '학습 성취도 변화 추이', value: 1, percent: 4.2 },
  ],
  dataUsage: [
    { name: '학생/학부모 상담 근거', value: 18, percent: 75.0 },
    { name: '보충 수업 대상자 선정', value: 10, percent: 41.7 },
    { name: '성적 처리/서술형 평가', value: 9, percent: 37.5 },
    { name: '생활기록부 기재', value: 8, percent: 33.3 },
  ],
  effectiveLevel: [
    { name: '상', value: 4, percent: 16.7 },
    { name: '중', value: 12, percent: 50.0 },
    { name: '하', value: 7, percent: 29.2 },
    { name: '최하', value: 1, percent: 4.2 },
  ],
};

export const teacherVoices = {
  struggles: [
    {
      quote: '이전 학년의 학습 결손이 심각하여 도저히 건드릴 수가 없는 상태 — 통분의 개념이 전혀 없었던 경우',
      theme: '누적 결손',
    },
    {
      quote: '부진 학생의 막힘 순간이 다르고, 다른 학생들 지도해야하기 때문에 맞춤형 학습이 어려움',
      theme: '구조적 한계',
    },
    {
      quote: '중학생인데 초등학교 연산이 안되는 경우',
      theme: '기초 결손',
    },
    {
      quote: '학생의 학습 의지가 있는데 일대일 지도가 아닌 이상 한 학생에게 시간을 할애할 수 없다',
      theme: '시간 부족',
    },
    {
      quote: '학기초에 학생이 어디까지 모르는 지 알지 못해서, 보충 설명을 해도 효과적이지 않은 경우',
      theme: '진단 한계',
    },
  ],
  feedbackReasons: [
    '수학 개념 원리 이해를 위해 서술형 풀이 과정 이해가 필수',
    '객관식으로는 사고력 향상에 한계가 있음',
    '학생들이 어디에서 틀렸는지 찾기 어려워함',
    '향후 서술형 문항 평가 비중이 높아짐',
    '단순히 정답만 맞히는 반복을 넘어, 풀이 과정의 어디서 왜 틀렸는지 스스로 깨달아야',
  ],
  additionalWishes: [
    '학습여정맵을 테크트리 형태로 제공하여 학생이 게임처럼 취약한 요소를 채워나가도록',
    '교사가 옆에 없어도 학습이 진행되는 시스템',
    '재미와 학습을 모두 잡을 수 있는 서비스',
    '학년을 고려하지 않고 저학년 수준 결손도 찾아내서 보완',
    '서술형 채점, 쌍둥이 문제 출제, 생기부 과세특 정리',
  ],
  levelEffectivenessReasons: {
    mid: '기본 개념은 있으나 응용력이 부족한 학생들에게 오점을 잡아나갔을 때 효과가 크다',
    low: '개별 피드백과 학습이 가장 많이 필요한 수준이며, 결손 보충으로 현행 학습에 복귀 가능',
    high: '성취도 높은 학생이 프로그램 활용도도 높고, 약점까지 찾을 수 있다면 효과적',
  },
};

export const keyInsights = [
  {
    id: 'cascade',
    title: '학습 결손의 연쇄 반응',
    stat: '67%',
    description: '하위 학년 개념 부족이 가장 큰 학습 장벽이며, 71%의 학생이 조금만 어려워도 바로 포기합니다.',
    icon: 'chain',
  },
  {
    id: 'feedback',
    title: '피드백 딜레마',
    stat: '4.2/5',
    description: '교사 피로도가 4.2점으로 매우 높지만, AI로 가장 줄이고 싶은 업무 1위는 개별 피드백 작성입니다.',
    icon: 'balance',
  },
  {
    id: 'gap',
    title: '구조적 격차의 벽',
    stat: '75%',
    description: '학생 간 수준 격차가 맞춤 지도를 가로막는 압도적 1위 원인입니다.',
    icon: 'wall',
  },
  {
    id: 'opportunity',
    title: 'AI 자동 매칭의 기회',
    stat: '4.6/5',
    description: '100%의 교사가 AI 문항 자동 매칭에 4점 이상을 부여했습니다. 가장 높은 기대치입니다.',
    icon: 'rocket',
  },
  {
    id: 'target',
    title: '중위권이 핵심 타겟',
    stat: '50%',
    description: '교사 절반이 중위권 학생에게 AI가 가장 효과적이라고 답했습니다.',
    icon: 'target',
  },
];
