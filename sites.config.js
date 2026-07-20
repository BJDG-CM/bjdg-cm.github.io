window.YEJUN_SITE_CONFIG = {
  owner: 'BJDG-CM',
  rootRepository: 'bjdg-cm.github.io',
  categories: {
    All: { label: '전체', en: 'All', color: '#171a21', onColor: '#ffffff' },
    Profile: { label: '프로필', en: 'Profile', color: '#3b82f6', onColor: '#ffffff' },
    Portfolio: { label: '포트폴리오', en: 'Portfolio', color: '#10b39a', onColor: '#ffffff' },
    Utility: { label: '유틸리티', en: 'Utility', color: '#f5943a', onColor: '#ffffff' },
    Campus: { label: '캠퍼스', en: 'Campus', color: '#8b5cf6', onColor: '#ffffff' },
    Content: { label: '콘텐츠', en: 'Content', color: '#f16a6a', onColor: '#ffffff' },
    Archive: { label: '아카이브', en: 'Archive', color: '#ec6aa6', onColor: '#ffffff' },
    Other: { label: '기타', en: 'Other', color: '#64748b', onColor: '#ffffff' }
  },
  overrides: {
    Homepage: {
      name: 'Academic Profile', kr: '학업 프로필', category: 'Profile', preview: 'AP', accentColor: '#3b82f6', featured: true,
      description: '전기공학 전공 방향, 연구 관심사, 경험, 공개 CV와 학업 연락처를 담은 프로필.',
      tags: ['Electrical Engineering', 'GIST', 'Research', 'CV']
    },
    'Homepage-CS': {
      name: 'Developer Portfolio', kr: '개발 포트폴리오 yejun.dev', category: 'Portfolio', preview: 'DEV', accentColor: '#10b39a', featured: true,
      description: '백엔드 시스템, 팀·개인 프로젝트, 기술 경험을 정리한 소프트웨어 포트폴리오.',
      tags: ['Backend', 'NestJS', 'TypeScript', 'Projects']
    },
    'print-drive': {
      name: 'Print Drive', kr: '프린트 드라이브', category: 'Utility', preview: 'PD', accentColor: '#f5943a', featured: true,
      description: '개인 클라우드 로그인 없이 공용 컴퓨터로 인쇄 파일을 옮기는 암호화 파일 전달 도구.',
      tags: ['Web Crypto', 'AES-GCM', 'Utility', 'Privacy']
    },
    'print-drive-template': {
      name: 'Print Drive Template', kr: '프린트 드라이브 템플릿', category: 'Utility', preview: '+', accentColor: '#eab02e', onAccent: '#231a05', featured: false,
      description: '나만의 독립형 암호화 Print Drive를 배포할 수 있는 재사용 가능한 시작 템플릿.',
      tags: ['Template', 'GitHub Pages', 'Encryption']
    },
    GISTGraduationMap: {
      name: 'GIST Graduation Map', kr: 'GIST 졸업 요건 지도', category: 'Campus', preview: 'GIST', accentColor: '#8b5cf6', featured: true,
      description: 'GIST 졸업 요건과 선수과목 관계를 확인하고 시각화하는 웹 애플리케이션.',
      tags: ['GIST', 'Education', 'JavaScript', 'Visualization']
    },
    'blog-fe': {
      name: 'Developer Blog', kr: '개발 블로그', category: 'Content', preview: 'BLOG', accentColor: '#f16a6a', featured: false,
      description: '개발 노트와 실험, 그리고 직접 만든 정적 퍼블리싱 워크플로를 담은 블로그.',
      tags: ['Astro', 'Blog', 'Writing', 'Experiment']
    },
    PersonalProfilePage: {
      name: 'Personal Profile Page', kr: '초기 프로필 페이지', category: 'Archive', preview: 'OLD', accentColor: '#ec6aa6', featured: false,
      description: '웹 포트폴리오의 시작을 기록한 초기 개인 프로필 프로젝트.',
      tags: ['HTML', 'CSS', 'JavaScript', 'Archive']
    }
  },
  hiddenRepositories: ['bjdg-cm.github.io']
};
