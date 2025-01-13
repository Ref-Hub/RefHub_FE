// src/components/layout/Layout.tsx
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userState } from "@/store/auth";
import AuthHeader from "./AuthHeader";
import MainHeader from "./MainHeader";

export default function Layout() {
  const location = useLocation();
  const user = useRecoilValue(userState);
  const isAuthPage = location.pathname.startsWith("/auth/");

  // 인증이 필요한 페이지에서 비로그인 상태일 경우 로그인 페이지로 리다이렉트
  if (!isAuthPage && !user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  // 로그인 상태에서 인증 페이지 접근 시 메인 페이지로 리다이렉트
  if (isAuthPage && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthPage ? <AuthHeader /> : <MainHeader />}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
