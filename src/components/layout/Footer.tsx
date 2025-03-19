// src/components/layout/Footer.tsx
import instar from "@/assets/images/instar_icon.svg";

export default function Footer() {
  return (
    <footer className="flex flex-col max-w-7xl w-full p-6 mx-auto border-t border-gray-200 text-gray-700 text-base mt-8">
      <div className="flex items-center relative">
        <img src="/images/icon_with_text.svg" alt="RefHub" className="h-8" />
        <p className="font-bold ml-12">E-mail</p>
        <a href="mailto:refhub0@gmail.com" className="font-medium ml-3.5 cursor-pointer">refhub0@gmail.com</a>
        <a href="https://www.instagram.com/_refhub?igsh=b2ppejRrd2F3amQ0&utm_source=qr" target="_blank" rel="noopener noreferrer">
          <img src={instar} alt="instargram" className="absolute right-0 cursor-pointer" />
        </a>
      </div>
      <div className="flex font-medium mt-11 relative">
        <a href="https://psychedelic-crustacean-955.notion.site/1bbfa429e6f7804d9782d2b439cb0a29?pvs=4" target="_blank" rel="noopener noreferrer" className="cursor-pointer">이용약관</a>
        <a href="https://psychedelic-crustacean-955.notion.site/1bbfa429e6f78078a633dac2653b3dec?pvs=4" target="_blank" rel="noopener noreferrer" className="ml-8 cursor-pointer">개인정보처리방침</a>
        <p className="underline absolute right-0 cursor-pointer">탈퇴하기</p>
      </div>
    </footer>
  );
}