import { useEffect, useState } from "react";

function Popup() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [linkOpen, setLinkOpen] = useState(true);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0]?.url || "";
      setUrl(currentUrl);
    });
  }, []);

  const saveUrl = async () => {
    setStatus("저장 중...");

    const token = await getToken();

    if (!token) {
      alert("로그인이 필요합니다.");
      chrome.tabs.create({ url: "https://www.refhub.my/auth/login" });
      return;
    }

    const isLoggedIn = await checkLogin(token);
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      chrome.tabs.create({ url: "https://www.refhub.my/auth/login" });
      return;
    }

    try {
      const res = await fetch("https://api.refhub.site/api/extensions/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileType: "link",
          link: url,
        }),
      });

      if (res.status === 201) {
        alert("레퍼런스가 저장되었습니다.");
        setTimeout(() => {
          window.close(); // 팝업 닫기
        }, 1000);
      } else {
        alert("레퍼런스 저장 실패했습니다.");
      }
    } catch (e) {
      alert("레퍼런스 저장 실패했습니다.");
    } finally {
      setStatus("");
    }
  };

  const getToken = (): Promise<string | null> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(["token"], (result) => {
        resolve(result.token || null);
      });
    });
  };

  const checkLogin = async (token: string) => {
    try {
      const res = await fetch(
        "https://api.refhub.site/api/extensions/authCheck",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        return res.ok && data.message === "로그인 상태 정상";
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="w-80 min-h-56 bg-[#FAFAFA] rounded-[3px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] text-base font-normal">
      <div className="flex border-b border-[#999999] p-5 items-center gap-3">
        <img src="images/icon.svg" className="w-6 h-4" />
        <h1>RefHub</h1>
      </div>
      <div className="flex flex-col p-5 gap-3">
        <div
          className="flex gap-2 items-center cursor-pointer w-fit hover:underline"
          onClick={() => setLinkOpen(!linkOpen)}
        >
          <img
            src="images/icon_arrow.svg"
            className={`${
              linkOpen ? "origin-center rotate-90" : ""
            } transition duration-300 ease-in-out`}
          />
          <p>링크</p>
        </div>
        {linkOpen && (
          <div className="flex flex-col items-end">
            <p className="w-full border border-[#DADDDB] bg-white rounded-lg px-5 py-2.5 mb-4 truncate">
              {url}
            </p>
            <button
              onClick={saveUrl}
              className="bg-[#1ABC9C] w-fit rounded-[50px] text-white font-bold px-4 py-2 hover:bg-emerald-600"
            >
              레퍼런스 저장
            </button>
          </div>
        )}
      </div>

      {status && <p className="mt-3 text-sm">{status}</p>}
    </div>
  );
}

export default Popup;
