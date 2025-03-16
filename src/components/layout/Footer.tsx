// src/components/layout/Footer.tsx
import instar from "@/assets/images/instar_icon.svg";

export default function Footer() {
  return (
    <footer className="flex flex-col max-w-7xl w-full p-6 mx-auto border-t border-gray-200 text-gray-700 text-base mt-8">
      <div className="flex items-center relative">
        <img src="/images/icon_with_text.svg" alt="RefHub" className="h-8" />
        <p className="font-bold ml-12">E-mail</p>
        <p className="font-medium ml-3.5">refhub0@gmail.com</p>
        <img
          src={instar}
          alt="instargram"
          className="absolute right-0 cursor-pointer"
        />
      </div>
      <div className="flex font-medium mt-11 relative">
        <p className="cursor-pointer">이용약관</p>
        <p className="ml-8 cursor-pointer">개인정보처리방침</p>
        <p className="underline absolute right-0 cursor-pointer">탈퇴하기</p>
      </div>
    </footer>
  );
}
