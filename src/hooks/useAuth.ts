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
    } catch (error) {
      console.error("Token decode error:", error);
      return null;
    }
  };

  const updateAuthState = async (
    userData: User | null,
    accessToken?: string,
    refreshToken?: string
  ) => {
    try {
      if (userData && accessToken) {
        // 토큰 저장
        authUtils.setToken(accessToken);
        if (refreshToken) {
          authUtils.setRefreshToken(refreshToken);
        }

        // 유저 데이터 저장
        authUtils.setStoredUser(userData);
        setUser(userData);

        // 저장 확인
        const storedToken = authUtils.getToken();
        const storedUser = authUtils.getStoredUser();

        console.log("Auth State Update Check:", {
          tokenStored: !!storedToken,
          userStored: !!storedUser,
          recoilStateUpdated: !!user,
        });

        return true;
      } else {
        authUtils.clearAll();
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("Auth state update failed:", error);
      return false;
    }
  };

  const login = async (data: LoginForm, rememberMe?: boolean) => {
    try {
      const response = await authService.login(data, !!rememberMe);
      console.log("Login API Response:", response);

      const userData = extractUserFromToken(response.accessToken);
      if (!userData) {
        throw new Error("Failed to extract user data from token");
      }

      const updateSuccess = await updateAuthState(
        userData,
        response.accessToken,
        response.refreshToken
      );

      if (!updateSuccess) {
        throw new Error("Failed to update auth state");
      }

      if (rememberMe) {
        authUtils.setRememberMe(true);
      }

      showToast("로그인이 완료되었습니다.", "success");

      // 약간의 지연 후 네비게이션 실행
      setTimeout(() => {
        if (authUtils.getToken() && authUtils.getStoredUser()) {
          navigate("/collections", { replace: true });
        } else {
          console.error("Navigation failed: Missing auth data");
          showToast("로그인 처리 중 오류가 발생했습니다.", "error");
        }
      }, 100);

      return response;
    } catch (error) {
      console.error("Login failed:", error);
      updateAuthState(null);

      if (error instanceof ApiError) {
        showToast(error.message, "error");
      } else {
        showToast("로그인에 실패했습니다.", "error");
      }
      throw error;
    }
  };

  // 나머지 코드는 그대로 유지
  const signup = async (data: SignupForm) => {
    try {
      await authService.signup(data);
      showToast("회원가입이 완료되었습니다. 로그인해주세요.", "success");
      navigate("/auth/login", { replace: true });
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
      // API 호출 추가
      await authService.logout();
      // 기존 코드: 로컬 상태 및 저장소 정리
      await updateAuthState(null);
      showToast("로그아웃 되었습니다.", "success");
      navigate("/auth/login", { replace: true });
    } catch (error) {
      console.log(
        "로그아웃 중 에러가 발생했지만, 로그아웃 처리를 계속 진행합니다."
      );
      await updateAuthState(null);
      showToast("로그아웃 중 오류가 발생했습니다.", "error");
      navigate("/auth/login", { replace: true });
    }
  };

  const checkAuthStatus = () => {
    const token = authUtils.getToken();
    const storedUser = authUtils.getStoredUser();

    console.log("Auth Status Check:", {
      hasToken: !!token,
      hasStoredUser: !!storedUser,
      hasRecoilUser: !!user,
    });

    if (token && storedUser && !user) {
      setUser(storedUser);
      return true;
    }

    if (!token && user) {
      updateAuthState(null);
      return false;
    }

    return !!token && !!user;
  };

  return {
    user,
    login,
    signup,
    logout,
    isAuthenticated: checkAuthStatus(),
  };
};
