// src/router.tsx
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

// 페이지 컴포넌트 import
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import PasswordResetPage from '@/pages/auth/PasswordResetPage';
import HomePage from '@/pages/home/HomePage';
import CollectionPage from '@/pages/collection/CollectionPage';
import CollectionDetailPage from '@/pages/collection/CollectionDetailPage';
import ReferenceListPage from '@/pages/reference/ReferenceListPage';
import ReferenceDetailPage from '@/pages/reference/ReferenceDetailPage';
import ReferenceCreatePage from '@/pages/reference/ReferenceCreatePage';
import ReferenceEditPage from '@/pages/reference/ReferenceEditPage';
import NotFoundPage from '@/pages/error/NotFoundPage';

// 인증 관련 라우트
const authRoutes: RouteObject[] = [
  {
    path: 'login',
    element: <LoginPage />,
  },
  {
    path: 'signup',
    element: <SignupPage />,
  },
  {
    path: 'reset-password',
    element: <PasswordResetPage />,
  },
];

// 보호된 라우트 (인증 필요)
const protectedRoutes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: 'collections',
    children: [
      {
<<<<<<< HEAD
        path: '/',
        element: <CollectionPage />,
      },
      {
        path: '/collection/:id',
        element: <HomePage />,
=======
        index: true,
        element: <CollectionPage />,
      },
      {
        path: ':collectionId',
        element: <CollectionDetailPage />,
>>>>>>> 323f4f7861c5dd5850f6b2ffb49e4238f0e1fd3d
      },
    ],
  },
  {
    path: 'references',
    children: [
      {
        index: true,
        element: <ReferenceListPage />,
      },
      {
        path: 'new',
        element: <ReferenceCreatePage />,
      },
      {
        path: ':referenceId',
        element: <ReferenceDetailPage />,
      },
      {
        path: ':referenceId/edit',
        element: <ReferenceEditPage />,
      },
    ],
  },
];

// 메인 라우터 설정
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: 'auth',
        children: authRoutes,
      },
      ...protectedRoutes,
    ],
  },
]);