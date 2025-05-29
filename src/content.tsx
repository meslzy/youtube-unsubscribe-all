import React from "react";

import type { PlasmoCSConfig, PlasmoGetStyle, PlasmoGetInlineAnchor } from "plasmo";

// @ts-expect-error
import styleText from "data-text:./content.css";

export const config: PlasmoCSConfig = {
  run_at: "document_end",
  matches: [
    "https://www.youtube.com/feed/channels",
  ],
};

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style");
  style.textContent = styleText;
  return style;
};

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  const element = await new Promise<Element>((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 50;

    const findElement = () => {
      const element = document.querySelector("yt-dynamic-text-view-model");

      if (element) {
        resolve(element);
        return;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        reject(new Error("Element not found after maximum attempts"));
        return;
      }

      setTimeout(findElement, 100);
    };

    findElement();
  });

  return {
    element,
    insertPosition: "afterend",
  };
};

const Content = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [unsubscriptions, setUnsubscriptions] = React.useState<HTMLButtonElement[]>([]);
  const [unsubscribeSuccess, setUnsubscribeSuccess] = React.useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = React.useState(false);

  const [deselectedChannels, setDeselectedChannels] = React.useState<Set<number>>(new Set());

  const unsubscriptionCounter = React.useMemo(() => {
    return unsubscriptions.length - deselectedChannels.size;
  }, [unsubscriptions.length, deselectedChannels]);

  const addFilterControls = React.useCallback((subscribeButtons: Element[]) => {
    for (const [index, element] of subscribeButtons.entries()) {
      if (element.querySelector(".subscription-checkbox")) {
        return;
      }

      const channelId = index;

      const checkboxContainer = document.createElement("div");
      checkboxContainer.className = "subscription-checkbox";
      checkboxContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        height: 100%;
        margin: 8px 4px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        color: #fff;
      `;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `checkbox-${channelId}`;
      checkbox.checked = true;
      checkbox.style.cssText = `
        width: 16px;
        height: 16px;
        cursor: pointer;
        margin: 0;
      `;

      const label = document.createElement("label");
      label.htmlFor = `checkbox-${channelId}`;
      label.textContent = "Select";
      label.style.cssText = `
        cursor: pointer;
        margin: 0;
        user-select: none;
      `;

      checkbox.addEventListener("change", (e) => {
        const isChecked = (e.target as HTMLInputElement).checked;
        setDeselectedChannels((prev) => {
          const newSet = new Set(prev);
          if (isChecked) {
            newSet.delete(channelId);
          } else {
            newSet.add(channelId);
          }
          return newSet;
        });
      });

      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(label);

      element.appendChild(checkboxContainer);
    }
  }, []);

  const loadSubscriptions = React.useCallback(() => {
    const subscribeButtons = Array.from(document.querySelectorAll("ytd-subscribe-button-renderer[subscribed]"));

    if (subscribeButtons.length === 0) {
      setError("No subscribed channels found. Please ensure you are on the correct page.");
      return;
    }

    const unsubscriptions = Array.from(subscribeButtons).map((el) => {
      return el.querySelector("button");
    }).filter((button): button is HTMLButtonElement => {
      return button !== null && button instanceof HTMLButtonElement;
    });

    if (unsubscriptions.length === 0) {
      setError("No unsubscribe buttons found. Please ensure you are subscribed to channels.");
      return;
    }

    addFilterControls(subscribeButtons);

    setUnsubscriptions(unsubscriptions);
  }, [addFilterControls]);

  React.useEffect(() => {
    loadSubscriptions();
    setLoading(false);
  }, [loadSubscriptions]);

  const handleExportList = () => {
    const channels = Array.from(document.getElementsByTagName("ytd-channel-renderer"));

    const channelData = channels
      .map((channel) => {
        const linkElement = channel.querySelector("a");
        const nameElement = channel.querySelector("ytd-channel-name yt-formatted-string");

        return {
          name: nameElement?.textContent?.trim() || "",
          link: linkElement?.href || "",
        };
      })
      .filter((channel) => channel.link && channel.name);

    if (channelData.length === 0) {
      setError("No channel data found to export.");
      return;
    }

    const csvHeaders = ["Channel Name", "Link"];
    const csvRows = channelData.map((channel) => [channel.name, channel.link]);

    const csvContent = [csvHeaders, ...csvRows].map((row) => row.map((field) => `"${field.replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "youtube-subscriptions.csv";
    downloadLink.style.visibility = "hidden";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    URL.revokeObjectURL(url);
  };

  const handleSelectAll = () => {
    setDeselectedChannels(new Set());
    const checkboxes = document.querySelectorAll(".subscription-checkbox input[type='checkbox']");
    for (const checkbox of checkboxes) {
      (checkbox as HTMLInputElement).checked = true;
    }
  };

  const handleSelectNone = () => {
    setDeselectedChannels(new Set(Array.from({ length: unsubscriptions.length }, (_, i) => i)));
    const checkboxes = document.querySelectorAll(".subscription-checkbox input[type='checkbox']");
    for (const checkbox of checkboxes) {
      (checkbox as HTMLInputElement).checked = false;
    }
  };

  const handleUnsubscribeAll = async () => {
    if (isUnsubscribing || unsubscriptionCounter === 0) {
      return;
    }

    setIsUnsubscribing(true);

    let shouldStop = false;
    const totalToProcess = unsubscriptionCounter;

    const stop = document.createElement("div");
    stop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    backdrop-filter: blur(5px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    cursor: pointer;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  `;

    const progressContainer = document.createElement("div");
    progressContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 40px;
    background: rgba(30, 30, 30, 0.9);
    border-radius: 12px;
    border: 2px solid #333;
    max-width: 400px;
    width: 90%;
  `;

    const title = document.createElement("h2");
    title.textContent = "Unsubscribing from Channels";
    title.style.cssText = `
    margin: 0;
    font-size: 24px;
    color: #fff;
    text-align: center;
  `;

    const progressText = document.createElement("div");
    progressText.style.cssText = `
    font-size: 18px;
    color: #e0e0e0;
    text-align: center;
    margin: 10px 0;
  `;

    const progressBarContainer = document.createElement("div");
    progressBarContainer.style.cssText = `
    width: 100%;
    height: 8px;
    background: #333;
    border-radius: 4px;
    overflow: hidden;
  `;

    const progressBar = document.createElement("div");
    progressBar.style.cssText = `
    height: 100%;
    background: linear-gradient(90deg, #ff4444, #ff6666);
    width: 0%;
    transition: width 0.3s ease;
    border-radius: 4px;
  `;

    const stopButton = document.createElement("button");
    stopButton.textContent = "Stop Unsubscribing";
    stopButton.style.cssText = `
    padding: 12px 24px;
    background: #666;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.3s ease;
    margin-top: 10px;
  `;

    stopButton.addEventListener("mouseenter", () => {
      stopButton.style.background = "#777";
    });

    stopButton.addEventListener("mouseleave", () => {
      stopButton.style.background = "#666";
    });

    const updateProgress = (current: number, channelName?: string) => {
      const percentage = Math.round((current / totalToProcess) * 100);
      progressText.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">
        ${current} of ${totalToProcess} channels processed (${percentage}%)
      </div>
      ${channelName ? `<div style="font-size: 14px; color: #ccc;">Currently: ${channelName}</div>` : ""}
      `;
      progressBar.style.width = `${percentage}%`;
    };

    progressBarContainer.appendChild(progressBar);
    progressContainer.appendChild(title);
    progressContainer.appendChild(progressText);
    progressContainer.appendChild(progressBarContainer);
    progressContainer.appendChild(stopButton);
    stop.appendChild(progressContainer);

    updateProgress(0);

    stopButton.addEventListener("click", (e) => {
      e.stopPropagation();
      shouldStop = true;
      stop.remove();
    });

    progressContainer.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    document.body.appendChild(stop);

    const unsubscribe = async (index: number) => {
      if (shouldStop || index >= unsubscriptions.length) {
        return;
      }

      if (deselectedChannels.has(index)) {
        return unsubscribe(index + 1);
      }

      const button = unsubscriptions[index]!;
      const channelElement = button.closest("ytd-channel-renderer");
      const channelNameElement = channelElement?.querySelector("ytd-channel-name yt-formatted-string");
      const channelName = channelNameElement?.textContent?.trim() || `Channel ${index + 1}`;

      const processedCount = Array.from({ length: index }, (_, i) => i)
        .filter((i) => !deselectedChannels.has(i)).length + 1;

      updateProgress(processedCount, channelName);

      const rect = button.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = rect.top + scrollTop - (window.innerHeight / 2);

      window.scrollTo({
        top: targetY,
        behavior: "smooth",
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 150);
      });

      button.click();

      await new Promise((resolve) => {
        setTimeout(resolve, 150);
      });

      await new Promise((resolve) => {
        const waitForConfirmationButton = () => {
          if (shouldStop) {
            resolve(undefined);
            return;
          }

          const selectors = [
            "yt-confirm-dialog-renderer #confirm-button button",
            "button[aria-label=\"Unsubscribe\"]",
            "#confirm-button button",
          ];

          for (const selector of selectors) {
            const confirmationButton = document.querySelector(selector);
            if (confirmationButton) {
              (confirmationButton as HTMLButtonElement).click();
              resolve(undefined);
              return;
            }
          }

          setTimeout(waitForConfirmationButton, 100);
        };

        waitForConfirmationButton();
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 250 + (Math.random() * 250));
      });

      return unsubscribe(index + 1);
    };

    return unsubscribe(0).then(() => {
      setUnsubscribeSuccess(true);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }).catch((error) => {
      console.error("Error during unsubscription:", error);
      setError("An error occurred while unsubscribing. Please try again.");
    }).finally(() => {
      setIsUnsubscribing(false);
      stop.remove();
    });
  };

  if (loading) {
    return (
      <div className={"loading-container"}>
        <div className={"spinner"}></div>
        <h3 className={"loading-text"}>Loading Subscriptions...</h3>
        <p className={"loading-subtext"}>Scanning your YouTube subscriptions</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={"error-container"}>
        <h3 className={"error-title"}>
          ⚠️ Error Loading Subscriptions
        </h3>
        <p className={"error-message"}>{ error }</p>
        <p className={"error-contact"}>
          Need help? <a href={"https://www.meslzy.com/contact"} target={"_blank"} rel={"noopener noreferrer"}>Contact Support</a>
        </p>
        <button className={"btn btn-secondary"}>
          🔄 Try Again
        </button>
      </div>
    );
  }

  if (unsubscribeSuccess) {
    return (
      <div className={"success-container"}>
        <div className={"success-message"}>
          ✅ Successfully unsubscribed from all channels! You can now refresh the page.
        </div>
        <div className={"thank-you-section"}>
          <h3 className={"thank-you-title"}>🎉 Thank you for using YouTube Unsubscribe All!</h3>
          <div className={"thank-you-actions"}>
            <div className={"action-item"}>
              <span className={"action-icon"}>⭐</span>
              <div className={"action-content"}>
                <p className={"action-text"}>Enjoyed this extension?</p>
                <a
                  href={"https://chrome.google.com/webstore/detail/youtube-unsubscribe-all/bbpkghgmcjojbljplcdehdbkgphhpemo/reviews"}
                  target={"_blank"}
                  rel={"noopener noreferrer"}
                  className={"btn btn-rating"}
                >
                  ⭐ Rate 5 Stars
                </a>
              </div>
            </div>
            <div className={"action-item"}>
              <span className={"action-icon"}>☕</span>
              <div className={"action-content"}>
                <p className={"action-text"}>Support the developer</p>
                <a
                  href={"https://buymeacoffee.com/meslzy"}
                  target={"_blank"}
                  rel={"noopener noreferrer"}
                  className={"btn btn-donate"}
                >
                  ☕ Buy me a coffee
                </a>
              </div>
            </div>
            <div className={"action-item"}>
              <span className={"action-icon"}>🗑️</span>
              <div className={"action-content"}>
                <p className={"action-text"}>All done? You can now remove this extension</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className={"content-header"}>
        <h2 className={"content-title"}>YouTube Unsubscribe All</h2>
        <div className={"subscription-count"}>
          📺 { unsubscriptions.length } subscriptions found
        </div>
      </div>
      <div className={"content-actions"}>
        <div className={"action-left"}>
          <button
            className={"btn btn-secondary"}
            disabled={isUnsubscribing || unsubscriptions.length === 0}
            onClick={handleExportList}
          >
            📁 Export List
          </button>
          <button
            className={"btn btn-secondary"}
            disabled={isUnsubscribing}
            onClick={handleSelectAll}
          >
            ✅ Select All
          </button>
          <button
            className={"btn btn-secondary"}
            disabled={isUnsubscribing}
            onClick={handleSelectNone}
          >
            ❌ Select None
          </button>
        </div>
        <button
          className={"btn btn-danger"}
          disabled={isUnsubscribing || unsubscriptionCounter === 0}
          onClick={handleUnsubscribeAll}
        >
          {
            isUnsubscribing ? (
              <React.Fragment>
                <span className={"spinner"}></span> Unsubscribing...
              </React.Fragment>
            ) : (
              <React.Fragment>
                🗑️ Unsubscribe All ({ unsubscriptionCounter })
              </React.Fragment>
            )
          }
        </button>
      </div>
    </React.Fragment>
  );
};

export default Content;
