// src/components/layout/Layout.tsx
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userState, authUtils } from "@/store/auth";
import AuthHeader from "./AuthHeader";
import MainHeader from "./MainHeader";
import Footer from "./Footer";

export default function Layout() {
  const location = useLocation();
  const user = useRecoilValue(userState);
  const isAuthPage = location.pathname.startsWith("/auth/");
  const isLoginPage = location.pathname === "/auth/login";
  const isPasswordResetPage = location.pathname === "/auth/reset-password";
  const isHomePage =
    location.pathname === "/collections" ||
    location.pathname === "/references" ||
    location.pathname === "/user/mypage" ||
    location.pathname === "/mypage";

  // 인증이 필요한 페이지에서 비로그인 상태일 경우 로그인 페이지로 리다이렉트
  if (!isAuthPage && !user && !authUtils.getToken()) {
    console.log("Redirecting to login: No auth");
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  // 로그인 상태에서 인증 페이지 접근 시 컬렉션 페이지로 리다이렉트
  // 비밀번호 재설정 페이지는 항상 접근 가능하도록 예외 처리
  if (isAuthPage && !isPasswordResetPage && user && !isLoginPage) {
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
      {isHomePage && <Footer />}
    </div>
  );
}
