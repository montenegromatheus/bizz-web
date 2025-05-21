import posthog from "posthog-js";

if (typeof window !== "undefined") {
  posthog.init("phc_omm6GqnNZAnvgS0YGu9T3liWQ4gbtltXweuZho1loit", {
    api_host: "https://us.i.posthog.com",
    autocapture: true,
    capture_pageview: true,
    disable_session_recording: false,
  });
}

export default posthog;
