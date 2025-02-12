// src/components/layout/Layout.tsx
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userState, authUtils } from "@/store/auth";
import AuthHeader from "./AuthHeader";
import MainHeader from "./MainHeader";

export default function Layout() {
  const location = useLocation();
  const user = useRecoilValue(userState);
  const isAuthPage = location.pathname.startsWith("/auth/");
  const isLoginPage = location.pathname === "/auth/login";

  // 현재 로그인 프로세스가 진행 중인지 확인
  const isLoggingIn = isLoginPage && authUtils.getToken();

  // 인증이 필요한 페이지에서 비로그인 상태일 경우 로그인 페이지로 리다이렉트
  if (!isAuthPage && !user && !authUtils.getToken()) {
    console.log("Redirecting to login: No auth");
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  // 로그인 상태에서 인증 페이지 접근 시 컬렉션 페이지로 리다이렉트
  // 단, 로그인 진행 중일 때는 제외
  if (isAuthPage && user && !isLoggingIn) {
    console.log("Redirecting to collections: Already authenticated");
    return <Navigate to="/collections" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAF9]">
      {isAuthPage && !isLoginPage ? <AuthHeader /> : null}
      {!isAuthPage && <MainHeader />}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
