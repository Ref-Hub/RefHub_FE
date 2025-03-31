// src/router.tsx
import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// 페이지 컴포넌트 import
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import PasswordResetPage from "@/pages/auth/PasswordResetPage";
import CollectionPage from "@/pages/collection/CollectionPage";
import CollectionDetailPage from "@/pages/collection/CollectionDetailPage";
import ReferenceListPage from "@/pages/reference/ReferenceListPage";
import ReferenceDetailPage from "@/pages/reference/ReferenceDetailPage";
import ReferenceCreatePage from "@/pages/reference/ReferenceCreatePage";
import ReferenceEditPage from "@/pages/reference/ReferenceEditPage";

// 404 페이지 처리를 위한 컴포넌트
const NotFoundRedirect = () => {
  // 인증 여부 확인
  const token = localStorage.getItem("accessToken");
  return token ? <Navigate to="/collections" replace /> : <Navigate to="/auth/login" replace />;
};

// 인증 관련 라우트
const authRoutes: RouteObject[] = [
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "signup",
    element: <SignupPage />,
  },
  {
    path: "reset-password",
    element: <PasswordResetPage />,
  },
];

// 보호된 라우트 (인증 필요)
const protectedRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/collections" replace />,
  },
  {
    path: "collections",
    element: (
      <ProtectedRoute>
        <CollectionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "collections/:collectionId",
    element: (
      <ProtectedRoute>
        <CollectionDetailPage />
      </ProtectedRoute>
    ),
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
];

// 메인 라우터 설정
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFoundRedirect />, // 오류 발생 시 인증 상태에 따라 리다이렉트
    children: [
      {
        path: "auth",
        children: authRoutes,
      },
      ...protectedRoutes,
      // 명시적인 와일드카드 경로 추가
      {
        path: "*",
        element: <NotFoundRedirect />
      }
    ],
  },
]);