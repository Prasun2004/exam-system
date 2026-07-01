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

  useEffect(() => {
    if (!active) return;

    const handleViolation = (reason = "Violation") => {
      const now = Date.now();

      // Prevent alert loops firing multiple times simultaneously
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

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation("Tab switch detected");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !lockedRef.current) {
        handleViolation("Fullscreen exited");
      }
    };

    const disableRightClick = (e) => e.preventDefault();
    const disableCopyPaste = (e) => e.preventDefault();
    const disableShortcuts = (e) => {
      if (e.ctrlKey && ["c", "v", "x", "u", "s"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
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