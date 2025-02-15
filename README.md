# RefHub 프론트엔드

RefHub는 여러 플랫폼에 흩어져 있는 레퍼런스를 한 곳에서 관리할 수 있는 서비스입니다. 링크, PDF, 이미지 등 다양한 형태의 레퍼런스를 저장하고 카테고리별로 정리할 수 있습니다.

## 🔗 서비스 링크
https://refhub.my

## ⚙️ 기술 스택

### 핵심 기술
- React + TypeScript: 정적 타입 검사를 통한 안정적인 개발
- Vite: 빠른 개발 환경과 빌드 성능
- React Router v6: SPA 라우팅 관리
- Recoil: 상태 관리
- React Query: 서버 상태 관리 및 데이터 캐싱
- Axios: HTTP 클라이언트

### UI/UX
- Tailwind CSS: 유틸리티 기반의 CSS 프레임워크
- Lucide React: 아이콘 라이브러리
- Recharts: 데이터 시각화
- Framer Motion: 애니메이션 효과

### 폼 관리 & 유효성 검사
- React Hook Form: 폼 상태 관리
- Express Validator: 데이터 유효성 검사

### 파일 처리
- PapaCSV: CSV 파일 파싱 및 처리
- SheetJS: Excel 파일 처리

## 🌟 주요 기능

### 회원 관리
- 3단계 회원가입 프로세스
  1. 이름/이메일 입력
  2. 인증번호 확인
  3. 비밀번호 설정
- 이메일/비밀번호 로그인
- 자동 로그인
- 비밀번호 재설정

### 레퍼런스 관리
- 레퍼런스 등록/조회/수정/삭제
- 카드뷰/리스트뷰 보기 모드
- 다양한 정렬 및 필터링 옵션
- 페이지네이션
- 다중 파일 업로드 지원
  - 이미지 (JPG, PNG, GIF, WEBP)
  - PDF
  - 기타 문서 파일
- 링크 미리보기

### 컬렉션(폴더) 관리
- 컬렉션 생성/수정/삭제
- 즐겨찾기 기능
- 팀 협업을 위한 공유 기능
- 사용자별 권한 관리 (보기/편집)

## 📁 프로젝트 구조

```
src/
├── components/         # 재사용 컴포넌트
│   ├── collection/    # 컬렉션 관련
│   ├── common/        # 공통 UI
│   ├── layout/        # 레이아웃
│   └── reference/     # 레퍼런스 관련
├── contexts/          # Context API
├── hooks/             # 커스텀 훅
├── pages/             # 페이지
├── services/          # API 통신
├── store/             # 전역 상태 관리
├── styles/            # 스타일
├── types/             # 타입 정의
└── utils/             # 유틸리티
```

## 🚀 시작하기

### 필수 조건
- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 방법

```bash
# 저장소 복제
git clone https://github.com/Ref-Hub/RefHub_FE.git

# 프로젝트 폴더로 이동
cd RefHub_FE

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음과 같이 설정하세요:

```
VITE_API_BASE_URL=https://api.refhub.site
```

## 📚 문서

API 문서는 [RefHub API 문서]([https://api.refhub.site/docs](https://psychedelic-crustacean-955.notion.site/Refhub-API-31eafe6739604bb4823ce9ab2c8d4c38))를 참고해 주세요.

## 🤝 프로젝트 참여하기

1. 프로젝트 Fork
2. 새로운 기능 브랜치 생성 (`git checkout -b feature/새로운기능`)
3. 변경사항 커밋 (`git commit -m '새로운 기능 추가'`)
4. 브랜치에 Push (`git push origin feature/새로운기능`)
5. Pull Request 생성

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

## 📞 문의하기

프로젝트 관련 문의는 [이슈 트래커](https://github.com/Ref-Hub/RefHub_FE/issues)를 이용해 주세요.
