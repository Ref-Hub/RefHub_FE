// src/pages/user/MyPage.tsx
import { useAuth } from "@/hooks/useAuth";

export default function MyPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">마이페이지</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          {/* 프로필 이미지 */}
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gray-100">
            <img 
              src="/images/default-profile.svg" 
              alt="프로필 이미지"
              className="w-full h-full object-cover" 
            />
          </div>
          
          {/* 사용자 정보 */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-semibold mb-4">사용자 정보</h2>
            
            {user ? (
              <div className="space-y-2">
                <p>이름: {user.name}</p>
                <p>이메일: {user.email}</p>
              </div>
            ) : (
              <p className="text-gray-500">사용자 정보를 불러오는 중...</p>
            )}
          </div>
        </div>
      </div>
      
      {/* 간단한 테스트용 버튼 */}
      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">마이페이지 테스트</h2>
        <p className="mb-4 text-gray-600">마이페이지로 성공적으로 리디렉션되었습니다.</p>
        <button 
          onClick={() => alert('마이페이지 기능은 추후 구현될 예정입니다.')}
          className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition-colors"
        >
          테스트 버튼
        </button>
      </div>
    </div>
  );
}