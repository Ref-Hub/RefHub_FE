// src/pages/auth/LoginPage.tsx
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { userState, DUMMY_USER } from '@/store/auth';
import type { LoginForm } from '@/types/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useSetRecoilState(userState);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    // 더미 로그인 처리
    console.log('Login attempt:', data);
    setUser(DUMMY_USER);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            로그인
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="이메일"
              type="email"
              {...register('email', {
                required: '이메일을 입력해주세요',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '올바른 이메일 형식이 아닙니다'
                }
              })}
              error={errors.email?.message}
            />
            <Input
              label="비밀번호"
              type="password"
              {...register('password', {
                required: '비밀번호를 입력해주세요',
                minLength: {
                  value: 8,
                  message: '비밀번호는 8자 이상이어야 합니다'
                }
              })}
              error={errors.password?.message}
            />
          </div>

          <div className="flex items-center justify-end">
            <Link
              to="/auth/reset-password"
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          <div>
            <Button type="submit" fullWidth>
              로그인
            </Button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">계정이 없으신가요? </span>
            <Link
              to="/auth/signup"
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}