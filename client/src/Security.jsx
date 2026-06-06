import React, { useEffect, useRef } from "react";

const ExamSecurityWrapper = ({
  children,
  onAutoSubmit,
  maxViolations = 1,
  active,
}) => {
  const violationsRef = useRef(0);
  const lockedRef = useRef(false);
  const lastTriggerRef = useRef(0);

  // 🔥 ENTER FULLSCREEN (call this on exam start button click)
  const enterFullScreen = async () => {
    const elem = document.documentElement;

    if (elem.requestFullscreen) await elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  };

  useEffect(() => {
    if (!active) return;

    // 👉 Try entering fullscreen when active becomes true
    enterFullScreen();

    const handleViolation = (reason = "Violation") => {
      const now = Date.now();

      if (now - lastTriggerRef.current < 1500) return;
      lastTriggerRef.current = now;

      if (lockedRef.current) return;

      violationsRef.current += 1;
      const current = violationsRef.current;

      alert(`⚠️ ${reason} (${current}/${maxViolations})`);

      if (current >= maxViolations) {
        lockedRef.current = true;

        alert("❌ Too many violations! Auto submitting exam...");

        setTimeout(() => {
          onAutoSubmit && onAutoSubmit();
        }, 300);
      }
    };

    // ✅ TAB SWITCH
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation("Tab switch detected");
      }
    };

    // ✅ FULLSCREEN EXIT DETECTION (IMPORTANT)
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleViolation("Fullscreen exited");
      }
    };

    // 🚫 RIGHT CLICK
    const disableRightClick = (e) => e.preventDefault();

    // 🚫 COPY / PASTE / CUT
    const disableCopyPaste = (e) => e.preventDefault();

    // 🚫 SHORTCUTS (add ESC tracking carefully)
    const disableShortcuts = (e) => {
      if (
        e.ctrlKey &&
        ["c", "v", "x", "u", "s"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }

      // ⚠️ ESC → usually exits fullscreen → already handled
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("copy", disableCopyPaste);
    document.addEventListener("paste", disableCopyPaste);
    document.addEventListener("cut", disableCopyPaste);
    document.addEventListener("keydown", disableShortcuts);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("copy", disableCopyPaste);
      document.removeEventListener("paste", disableCopyPaste);
      document.removeEventListener("cut", disableCopyPaste);
      document.removeEventListener("keydown", disableShortcuts);
    };
  }, [active, onAutoSubmit, maxViolations]);

  return <>{children}</>;
};

export default ExamSecurityWrapper;