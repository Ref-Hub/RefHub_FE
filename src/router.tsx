// src/router.tsx
import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PublicRoute } from "@/components/layout/PublicRoute";
import { UnrestrictedRoute } from "@/components/layout/UnrestrictedRoute";
import NotFoundRedirect from "@/components/layout/NotFoundRedirect";

// 페이지 컴포넌트 import
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import PasswordResetPage from "@/pages/auth/PasswordResetPage";
import KakaoLoginCallback from "@/pages/auth/KakaoLoginCallback";
import CollectionPage from "@/pages/collection/CollectionPage";
import CollectionDetailPage from "@/pages/collection/CollectionDetailPage";
import ReferenceListPage from "@/pages/reference/ReferenceListPage";
import ReferenceDetailPage from "@/pages/reference/ReferenceDetailPage";
import ReferenceCreatePage from "@/pages/reference/ReferenceCreatePage";
import ReferenceEditPage from "@/pages/reference/ReferenceEditPage";
import MyPage from "@/pages/user/MyPage";

// 인증 관련 라우트
const authRoutes: RouteObject[] = [
  {
    path: "login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "signup",
    element: (
      <PublicRoute>
        <SignupPage />
      </PublicRoute>
    ),
  },
  // 비밀번호 재설정 페이지는 로그인 여부와 관계없이 접근 가능
  {
    path: "reset-password",
    element: <PasswordResetPage />,
  },
  // 카카오 로그인 콜백 경로는 /auth 경로에서 제거하고 최상위 경로에 추가
];

// 보호된 라우트 (인증 필요)
const protectedRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/collections" replace />,
  },
  {
    path: "collections",
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <CollectionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ":collectionId",
        element: (
          <ProtectedRoute>
            <CollectionDetailPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "references",
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <ReferenceListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "new",
        element: (
          <ProtectedRoute>
            <ReferenceCreatePage />
          </ProtectedRoute>
        ),
      },
      {
        path: ":referenceId",
        element: (
          <ProtectedRoute>
            <ReferenceDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ":referenceId/edit",
        element: (
          <ProtectedRoute>
            <ReferenceEditPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  // 마이페이지 라우트
  {
    path: "mypage",
    element: (
      <ProtectedRoute>
        <MyPage />
      </ProtectedRoute>
    ),
  },
];

// 메인 라우터 설정
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFoundRedirect />,
    children: [
      {
        path: "auth",
        children: authRoutes,
      },
      // 카카오 로그인 콜백 경로를 최상위 경로로 추가
      {
        path: "users/kakao-login",
        element: (
          <UnrestrictedRoute>
            <KakaoLoginCallback />
          </UnrestrictedRoute>
        ),
      },
      ...protectedRoutes,
      // 명시적인 와일드카드 경로 추가
      {
        path: "*",
        element: <NotFoundRedirect />,
      },
    ],
  },
]);
