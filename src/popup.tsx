import "./popup.css";

import React from "react";

const YOUTUBE_SUBSCRIBE_URL: string = "https://www.youtube.com/feed/channels";

const Popup = () => {
  const [isOnChannelsPage, setIsOnChannelsPage] = React.useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = React.useState<boolean>(false);

  React.useEffect(() => {
    chrome.tabs.query({
      active: true,
      currentWindow: true,
    }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab && currentTab.url) {
        setIsOnChannelsPage(currentTab.url === YOUTUBE_SUBSCRIBE_URL);
      }
    });
  }, []);

  const handleRedirect = () => {
    setIsRedirecting(true);
    chrome.tabs.update({
      url: YOUTUBE_SUBSCRIBE_URL,
    });
    setTimeout(() => {
      window.close();
    }, 500);
  };

  const handleHelpClick = () => {
    chrome.tabs.create({
      url: `chrome-extension://${chrome.runtime.id}/tabs/help.html`,
    });
  };

  const handleLinkClick = (url: string) => {
    chrome.tabs.create({
      url: url,
    });
  };

  if (isRedirecting) {
    return (
      <div id={"popup"}>
        <div id={"popup-content"}>
          <div className={"loading-container"}>
            <div className={"spinner"}></div>
            <h1>Redirecting...</h1>
            <p>Taking you to YouTube channels page</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id={"popup"}>
      <div id={"popup-header"}>
        <h1>YouTube Unsubscribe All</h1>
        <button
          className={"help-button"}
          title={"Get Help"}
          onClick={handleHelpClick}
        >
          ❓ Help
        </button>
      </div>
      <div id={"popup-content"}>
        {
          isOnChannelsPage ? (
            <div className={"content-section"}>
              <h1>✅ Ready to Go!</h1>
              <p>You are on the YouTube channels page. The extension is now active and ready to help you manage your subscriptions.</p>
            </div>
          ) : (
            <div className={"content-section"}>
              <h1>🚀 Get Started</h1>
              <p>To use this extension, you need to be on the YouTube channels page. Click the button below to navigate there.</p>
              <button onClick={handleRedirect}>
                Go to YouTube Channels Page
              </button>
            </div>
          )
        }
      </div>
      <div id={"popup-footer"}>
        <div className={"footer-links"}>
          <div className={"footer-row"}>
            <button
              className={"footer-link"}
              onClick={() => handleLinkClick("https://www.meslzy.com")}
            >
              🌐 Meslzy.com
            </button>
            <button
              className={"footer-link"}
              onClick={() => handleLinkClick("https://github.com/meslzy/youtube-unsubscribe-all")}
            >
              💻 Source Code
            </button>
          </div>
          <div className={"footer-row"}>
            <button
              className={"footer-link"}
              onClick={() => handleLinkClick("https://buymeacoffee.com/meslzy")}
            >
              ☕ Donate
            </button>
            <button
              className={"footer-link"}
              onClick={() => handleLinkClick("https://chrome.google.com/webstore/detail/youtube-unsubscribe-all/bbpkghgmcjojbljplcdehdbkgphhpemo/reviews")}
            >
              ⭐ Rate Extension
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
