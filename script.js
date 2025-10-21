document.addEventListener("DOMContentLoaded", () => {
  const masthead = document.querySelector(".masthead");
  const art = document.querySelector(".masthead-art img");
  if (!masthead || !art) return;

  // ----- Tuning knobs -----
  const RANGE_X = 6;          // max horizontal translate in %
  const RANGE_Y = 3;          // max vertical translate in %
  const ROT_MAX = 2;          // max rotation in deg
  const DAMPING = 0.14;       // 0.08 = softer, 0.2 = snappier
  const RETURN_DAMPING = 0.10;// easing when leaving

  // State
  let raf = null;
  let hovering = false;

  // Current transform values (what we render)
  let cx = 0, cy = 0, cr = 0; // %
  // Targets (where we want to go)
  let tx = 0, ty = 0, tr = 0;

  // Helpers
  const toNeutral = () => { tx = 0; ty = 0; tr = 0; };
  const stopRaf = () => { if (raf) cancelAnimationFrame(raf); raf = null; };

  const render = () => {
    // Ease current toward target
    const k = hovering ? DAMPING : RETURN_DAMPING;
    cx += (tx - cx) * k;
    cy += (ty - cy) * k;
    cr += (tr - cr) * k;

    art.style.transform =
      `translateX(${cx}%) translateY(${cy}%) rotate(${cr}deg) scale(var(--art-scale))`;

    // Keep going if we’re still moving or hovering
    if (hovering || Math.abs(cx) > 0.02 || Math.abs(cy) > 0.02 || Math.abs(cr) > 0.02) {
      raf = requestAnimationFrame(render);
    } else {
      // fully settled → resume slow pan
      art.style.animation = "pan-right var(--pan-duration, 80s) linear infinite alternate";
      raf = null;
    }
  };

  const onEnter = () => {
    hovering = true;
    // Pause the slow pan immediately
    art.style.animation = "none";
    // Kick RAF if not running
    if (!raf) raf = requestAnimationFrame(render);
  };

  const onMove = (e) => {
    if (!hovering) return;
    const rect = masthead.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;  // -1..1
    const ny = ((e.clientY - rect.top)  / rect.height) * 2 - 1; // -1..1 (top= -1)

    // Set targets from mouse (invert Y so up is negative movement)
    tx = nx * RANGE_X;         // horizontal parallax
    ty = -ny * RANGE_Y * 0.7;  // subtle vertical lift
    tr = nx * ROT_MAX;         // slight tilt

    // Start RAF if it somehow stopped
    if (!raf) raf = requestAnimationFrame(render);
  };

  const onLeave = () => {
    hovering = false;
    // Drift back to neutral; RAF keeps running until settled,
    // then render() resumes the slow pan
    toNeutral();
    if (!raf) raf = requestAnimationFrame(render);
  };

  // Use the whole masthead as the hover area (more reliable than the image)
  masthead.addEventListener("mouseenter", onEnter);
  masthead.addEventListener("mousemove", onMove);
  masthead.addEventListener("mouseleave", onLeave);

  // Safety: resume pan if page loses focus
  window.addEventListener("blur", () => { hovering = false; toNeutral(); if (!raf) raf = requestAnimationFrame(render); });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { hovering = false; toNeutral(); if (!raf) raf = requestAnimationFrame(render); }
  });
});
