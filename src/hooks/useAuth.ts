// src/hooks/useAuth.ts
import { useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/contexts/useToast";
import { userState, authUtils } from "@/store/auth";
import { authService } from "@/services/auth";
import { ApiError } from "@/utils/errorHandler";
import { jwtDecode } from "jwt-decode";
import type { LoginForm, SignupForm, User, TokenPayload } from "@/types/auth";

export const useAuth = () => {
  const [user, setUser] = useRecoilState(userState);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const extractUserFromToken = (token: string): User | null => {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return {
        id: decoded.id,
        email: decoded.email,
        name: decoded.email.split("@")[0], // 이메일에서 임시로 이름 추출
      };
    } catch {
      return null;
    }
  };

  const login = async (data: LoginForm, rememberMe?: boolean) => {
    try {
      const response = await authService.login(data, !!rememberMe);

      // 토큰에서 사용자 정보 추출
      const userData = extractUserFromToken(response.accessToken);
      if (!userData) {
        throw new Error("Invalid token");
      }

      authUtils.setStoredUser(userData);
      setUser(userData);
      showToast("로그인이 완료되었습니다.", "success");
      navigate("/");
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, "error");
      } else {
        showToast("로그인에 실패했습니다.", "error");
      }
      throw error;
    }
  };

  const signup = async (data: SignupForm) => {
    try {
      await authService.signup(data);
      showToast("회원가입이 완료되었습니다. 로그인해주세요.", "success");
      navigate("/auth/login");
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, "error");
      } else {
        showToast("회원가입에 실패했습니다.", "error");
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      authUtils.clearAll();
      setUser(null);
      showToast("로그아웃 되었습니다.", "success");
      navigate("/auth/login");
    } catch {  // '_' 파라미터 제거
      authUtils.clearAll();
      setUser(null);
      showToast("로그아웃 중 오류가 발생했습니다.", "error");
      navigate("/auth/login");
    }
  };

  const isAuthenticated = () => {
    const token = authUtils.getToken();
    return !!token && !!user;
  };

  return {
    user,
    login,
    signup,
    logout,
    isAuthenticated: isAuthenticated(),
  };
};
