/**
 * @return Promise<Tab>
 **/
const getCurrentTab = async () => {
  return chrome.tabs.query({
    active: true,
    currentWindow: true,
  }).then((value) => {
    return value.at(0);
  });
};

const worker = document.getElementById("start");

worker.addEventListener("click", async () => {
  const isRunning = worker.getAttribute("running");

  const stop = async () => {
    const tab = await getCurrentTab();

    await chrome.scripting.executeScript({
      target: {
        tabId: tab.id,
      },
      func: () => {
        stop();
      },
    });
  };

  const start = async () => {
    const youtubeUrl = "https://www.youtube.com/feed/channels";

    const tab = await getCurrentTab();

    if (tab.url !== youtubeUrl) {
      worker.innerText = "redirect to youtube ..";

      return chrome.tabs.update(tab.id, {
        url: youtubeUrl,
      }, () => {
        worker.innerText = "redirected ..";
      });
    }

    await chrome.scripting.executeScript({
      target: {
        tabId: tab.id,
      },
      func: () => {
        start();
      },
    });
  };

  if (isRunning === "true") {
    await stop();
  } else {
    await start();
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    if (tab.url === "https://www.youtube.com/feed/channels") {
      worker.innerText = "start";
    }
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "msg") {
    worker.innerText = message.msg;

    if (message.running !== undefined) {
      worker.setAttribute("running", message.running.toString());
    }
  }
});
