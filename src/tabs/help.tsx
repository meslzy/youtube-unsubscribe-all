import "./help.css";

// @ts-expect-error
import setp1Img from "data-url:./images/step1.png";
// @ts-expect-error
import setp2Img from "data-url:./images/step2.png";
// @ts-expect-error
import setp3Img from "data-url:./images/step3.png";
// @ts-expect-error
import setp4Img from "data-url:./images/step4.png";

interface StepSectionProps {
  stepNumber: number;
  title: string;
  description: string;
  imageSrc: string;
}

const StepSection = ({ stepNumber, title, description, imageSrc }: StepSectionProps) => {
  return (
    <div className={"step-section"}>
      <div className={"step-content"}>
        <div className={"step-info"}>
          <div className={"step-header"}>
            <span className={"step-number"}>Step { stepNumber }</span>
            <h3 className={"step-title"}>{ title }</h3>
          </div>
          <p className={"step-description"}>{ description }</p>
        </div>
        <div className={"step-image"}>
          <img src={imageSrc} alt={`Step ${stepNumber} illustration`}/>
        </div>
      </div>
    </div>
  );
};

const HelpPage = () => {
  const handleLinkClick = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className={"help-page"}>
      <div className={"help-container"}>
        <header className={"help-header"}>
          <h1>YouTube Unsubscribe All - Help Guide</h1>
          <p className={"help-subtitle"}>
            Quickly unsubscribe from multiple YouTube channels at once with this easy-to-use extension.
          </p>
        </header>
        <section className={"about-section"}>
          <div className={"content-card"}>
            <h2>About This Extension</h2>
            <p>
              YouTube Unsubscribe All automates the process of unsubscribing from multiple YouTube channels,
              saving you time instead of manually clicking through each subscription.
            </p>
          </div>
        </section>
        <section className={"steps-section"}>
          <h2>How to Use</h2>
          <StepSection
            stepNumber={1}
            title={"Install and Access Extension"}
            description={"Click on the YouTube Unsubscribe All extension icon in your browser toolbar. If you don't see it, click the puzzle piece icon to find it in your extensions menu."}
            imageSrc={setp1Img}
          />
          <StepSection
            stepNumber={2}
            title={"Go to YouTube Subscriptions"}
            description={"Navigate to your YouTube subscriptions page (https://www.youtube.com/feed/channels) to view all the channels you're subscribed to."}
            imageSrc={setp2Img}
          />
          <StepSection
            stepNumber={3}
            title={"Select 'Most relevant' ⚡"}
            description={"Make sure to select 'Most relevant' from the dropdown menu on the subscriptions page. This ensures the extension can work effectively with all your subscriptions."}
            imageSrc={setp3Img}
          />
          <StepSection
            stepNumber={4}
            title={"Start Unsubscribing"}
            description={"Once you're on the subscriptions page, click the 'Unsubscribe All' button in the extension popup to begin the automated unsubscription process."}
            imageSrc={setp4Img}
          />
        </section>
        <section className={"troubleshooting-section"}>
          <div className={"content-card"}>
            <h2>Troubleshooting & Support</h2>
            <div className={"troubleshooting-item"}>
              <h3>⚡ Quick Fixes</h3>
              <ul className={"troubleshooting-tips"}>
                <li>Ensure you're on the YouTube subscriptions page (https://www.youtube.com/feed/channels)</li>
                <li>Make sure you've selected "Most relevant" from the dropdown menu</li>
                <li>Set your browser language to English for best compatibility</li>
                <li>Try refreshing the page and reopening the extension</li>
                <li>Disable other YouTube-related extensions temporarily to avoid conflicts</li>
              </ul>
            </div>
            <div className={"troubleshooting-item"}>
              <h3>🆘 Need More Help?</h3>
              <p>If you're still experiencing issues, reach out through any of these channels:</p>
              <div className={"social-links"}>
                <button
                  className={"social-button github"}
                  onClick={() => handleLinkClick("https://github.com/meslzy/youtube-unsubscribe-all/issues")}
                >
                  🐛 Report Bug
                </button>
                <button
                  className={"social-button discord"}
                >
                  @meslzy on Discord
                </button>
                <button
                  className={"social-button instagram"}
                  onClick={() => handleLinkClick("https://instagram.com/meslzy")}
                >
                  📸 Instagram
                </button>
                <button
                  className={"social-button twitter"}
                  onClick={() => handleLinkClick("https://twitter.com/meslzy")}
                >
                  🐦 Twitter
                </button>
                <button
                  className={"social-button youtube"}
                  onClick={() => handleLinkClick("https://youtube.com/@meslzy")}
                >
                  📺 YouTube
                </button>
              </div>
            </div>
          </div>
        </section>
        <footer className={"help-footer"}>
          <div className={"content-card"}>
            <h2>Support the Project</h2>
            <p>
              If you find this extension helpful, please consider supporting its development
              and sharing it with others who might benefit from it.
            </p>
            <div className={"footer-actions"}>
              <button
                className={"primary-button"}
                onClick={() => handleLinkClick("https://chrome.google.com/webstore/detail/youtube-unsubscribe-all/bbpkghgmcjojbljplcdehdbkgphhpemo/reviews")}
              >
                ⭐ Rate Extension
              </button>
              <button
                className={"secondary-button"}
                onClick={() => handleLinkClick("https://buymeacoffee.com/meslzy")}
              >
                ☕ Buy Me a Coffee
              </button>
              <button
                className={"link-button"}
                onClick={() => handleLinkClick("https://github.com/meslzy/youtube-unsubscribe-all")}
              >
                💻 View Source
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HelpPage;
