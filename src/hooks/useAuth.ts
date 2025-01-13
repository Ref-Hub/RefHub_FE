// src/hooks/useAuth.ts
import { useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import { userState, authUtils } from "@/store/auth";
import { authService } from "@/services/auth";
import type { LoginForm, SignupForm } from "@/types/auth";

export const useAuth = () => {
  const [user, setUser] = useRecoilState(userState);
  const navigate = useNavigate();

  const login = async (data: LoginForm, rememberMe?: boolean) => {
    try {
      const response = await authService.login(data);
      if (rememberMe) {
        authUtils.setRememberMe(true);
      }
      setUser(response.user);
      authUtils.setStoredUser(response.user);
      navigate("/");
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("로그인에 실패했습니다");
    }
  };

  const signup = async (data: SignupForm) => {
    try {
      const response = await authService.signup(data);
      setUser(response.user);
      authUtils.setStoredUser(response.user);
      navigate("/");
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("회원가입에 실패했습니다");
    }
  };

  const logout = () => {
    authUtils.removeToken();
    authUtils.removeStoredUser();
    authUtils.removeRememberMe();
    setUser(null);
    navigate("/auth/login");
  };

  return {
    user,
    login,
    signup,
    logout,
    isAuthenticated: authService.isAuthenticated(),
  };
};