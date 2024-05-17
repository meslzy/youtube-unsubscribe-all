let prevent;

let popupObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "attributes" && mutation.attributeName === "aria-hidden") {
      const target = mutation.target;

      const confirmButton = target?.querySelector("#confirm-button button");

      if (confirmButton === null) {
        return;
      }

      confirmButton.click();
    }
  }
});

const isNotInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  const html = document.documentElement;

  return !(rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || html.clientHeight) && rect.right <= (window.innerWidth || html.clientWidth));
};

window.stop = async () => {
  prevent = true;
  popupObserver.disconnect();

  return chrome.runtime.sendMessage({
    type: "msg",
    msg: "start again",
    running: false,
  });
};

window.start = async () => {
  const subs = Array.from(document.querySelectorAll("#buttons > #subscribe-button > ytd-subscribe-button-renderer")).filter((sub) => {
    return sub.hasAttribute("subscribe-button-invisible");
  });

  if (typeof subs === "undefined" || subs.length === 0) {
    return chrome.runtime.sendMessage({
      type: "msg",
      msg: "you dont have any subs",
      running: false,
    });
  }

  prevent = false;

  const popup = document.querySelector("ytd-popup-container");

  popupObserver.observe(popup, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["aria-hidden"],
  });

  await chrome.runtime.sendMessage({
    type: "msg",
    msg: "click to stop",
    running: true,
  });

  const unSubscribe = (counter) => {
    if (prevent) {
      return;
    }

    if (counter < subs.length) {
      return setTimeout(async () => {
        if (isNotInViewport(subs[counter])) {
          subs[counter].scrollIntoView({
            behavior: "instant",
            block: "end",
          });

          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const btn = subs[counter].querySelector("button");

        if (btn) {
          btn.click();
        }

        setTimeout(() => {
          unSubscribe(counter + 1);
        }, 150 + counter);
      }, 150 + counter);
    }

    if (confirm("thanks for using me, give me 5 star, then remove me from your extensions")) {
      window.open("https://chrome.google.com/webstore/detail/youtube-unsubscribe-all/bbpkghgmcjojbljplcdehdbkgphhpemo?hl=ar");
    }

    window.stop();
  };

  unSubscribe(0);
};