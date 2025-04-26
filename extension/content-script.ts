window.addEventListener("message", (event) => {
  if (event.source !== window || !event.data.token) return;
  if (event.data.type === "REFHUB_TOKEN") {
    const token = event.data.token;

    chrome.storage.local.set({ token }, () => {
      console.log("✅ 토큰 저장 완료");
    });
  }
});
