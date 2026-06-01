(function () {
  const slot = document.getElementById("auth-slot");
  if (!slot) return;

  function link(href, className, text) {
    const a = document.createElement("a");
    a.href = href;
    a.className = className;
    a.textContent = text;
    return a;
  }

  function renderSignedOut() {
    slot.replaceChildren(
      link("signin.html", "sign-in", "Sign in"),
      link("my-bookings.html", "sign-in nav-outline", "My bookings")
    );
  }

  fetch("/api/auth/me", { credentials: "include" })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (!data?.user) {
        renderSignedOut();
        return;
      }
      const u = data.user;
      slot.replaceChildren();

      const nameSpan = document.createElement("span");
      nameSpan.className = "auth-user";
      nameSpan.title = u.email || "";
      nameSpan.textContent = u.name || "Account";

      const out = document.createElement("button");
      out.type = "button";
      out.className = "sign-in";
      out.id = "auth-sign-out";
      out.textContent = "Sign out";
      out.addEventListener("click", async () => {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
        window.location.href = "index.html";
      });

      slot.append(
        nameSpan,
        link("my-bookings.html", "sign-in", "My bookings"),
        out
      );
    })
    .catch(() => renderSignedOut());
})();
