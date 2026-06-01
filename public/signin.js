async function initSignIn() {
  const errEl = document.getElementById("signin-error");
  const hintEl = document.getElementById("signin-hint");
  const btnHost = document.getElementById("google-signin");

  function showErr(msg) {
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.remove("hidden");
    }
  }

  let clientId = "";
  let allowDevLogin = false;
  try {
    const cfgRes = await fetch("/api/auth/config");
    if (!cfgRes.ok) {
      throw new Error("bad response");
    }
    const cfg = await cfgRes.json();
    clientId = String(cfg.googleClientId || "").trim();
    allowDevLogin = cfg.allowDevLogin === true;
  } catch {
    showErr(
      "This page must be opened through your app server (not as a saved file). Run: node server.js — then open http://localhost:3000/signin.html"
    );
    return;
  }

  const devPanel = document.getElementById("dev-signin");

  if (!clientId) {
    if (allowDevLogin && devPanel) {
      errEl?.classList.add("hidden");
      btnHost?.classList.add("hidden");
      if (hintEl) {
        hintEl.textContent =
          "Optional: add GOOGLE_CLIENT_ID in .env for real Google Sign-In (Authorized JavaScript origins: http://localhost:3000 and http://127.0.0.1:3000). Restart the server after changes.";
      }
      devPanel.classList.remove("hidden");
      document.getElementById("dev-submit")?.addEventListener("click", async () => {
        errEl?.classList.add("hidden");
        const email = document.getElementById("dev-email")?.value?.trim() || "";
        const name = document.getElementById("dev-name")?.value?.trim() || "";
        try {
          const res = await fetch("/api/auth/dev-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, name }),
          });
          const body = await res.json().catch(() => ({}));
          if (!res.ok) {
            showErr(body.message || "Could not sign in.");
            return;
          }
          window.location.href = "my-bookings.html";
        } catch {
          showErr("Network error.");
        }
      });
    } else {
      btnHost?.classList.add("hidden");
      showErr(
        "No Google Sign-In yet: set GOOGLE_CLIENT_ID in .env (Google Cloud → Credentials → OAuth Web client), or for local-only testing set ALLOW_DEV_LOGIN=true in .env and restart the server. Authorized JavaScript origins: http://localhost:3000 and http://127.0.0.1:3000"
      );
      if (hintEl) {
        hintEl.textContent =
          "After editing .env, stop and start node server.js again.";
      }
    }
    if (!allowDevLogin) return;
    if (!clientId) return;
  }

  const meRes = await fetch("/api/auth/me", { credentials: "include" });
  if (meRes.ok) {
    window.location.href = "my-bookings.html";
    return;
  }

  btnHost?.classList.remove("hidden");

  window.handleGoogleCredential = async (response) => {
    errEl?.classList.add("hidden");
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential: response.credential }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        showErr(body.message || "Sign-in failed.");
        return;
      }
      window.location.href = "my-bookings.html";
    } catch {
      showErr("Network error during sign-in.");
    }
  };

  const s = document.createElement("script");
  s.src = "https://accounts.google.com/gsi/client";
  s.async = true;
  s.defer = true;
  s.onerror = () => {
    showErr(
      "Could not load Google’s sign-in script (blocked network, extension, or firewall). Allow accounts.google.com and try again."
    );
  };
  s.onload = () => {
    if (!window.google?.accounts?.id) {
      showErr("Google Sign-In script loaded but is unavailable. Try another browser or disable blockers.");
      return;
    }
    google.accounts.id.initialize({
      client_id: clientId,
      callback: window.handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    google.accounts.id.renderButton(btnHost, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "rectangular",
      width: 384,
      logo_alignment: "left",
    });
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        return;
      }
    });
  };
  document.head.appendChild(s);
}

window.addEventListener("DOMContentLoaded", initSignIn);
