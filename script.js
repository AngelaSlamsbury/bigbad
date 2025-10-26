// Masthead: continuous slow pan (via CSS) + hover wiggle (via JS vars)
(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    var masthead = document.querySelector(".masthead");
    var img = document.querySelector(".masthead-art img");
    if (!masthead || !img) return;

    // Hover tuning
    var RANGE_X = 6;          // % translate
    var RANGE_Y = 3;          // % translate
    var ROT_MAX = 2;          // deg
    var DAMPING = 0.14;
    var RETURN_DAMPING = 0.10;

    var raf = null;
    var hovering = false;

    var cx = 0, cy = 0, cr = 0;   // current
    var tx = 0, ty = 0, tr = 0;   // target

    // Ensure the image is sized to allow panning (defensive)
    img.style.height = "100%";
    img.style.width = "auto";
    if (!img.style.minWidth) img.style.minWidth = "130%"; // gives room on both sides
    img.style.maxWidth = "none";
    img.style.objectFit = "contain";
    img.style.transformOrigin = "50% 50%";
    img.style.borderRadius = "0";

    // Initialize CSS vars used by the CSS transform
    img.style.setProperty("--hover-x", "0%");
    img.style.setProperty("--hover-y", "0%");
    img.style.setProperty("--hover-r", "0deg");

    function toNeutral(){ tx = 0; ty = 0; tr = 0; }

    function render(){
      var k = hovering ? DAMPING : RETURN_DAMPING;
      cx += (tx - cx) * k;
      cy += (ty - cy) * k;
      cr += (tr - cr) * k;

      img.style.setProperty("--hover-x", cx.toFixed(3) + "%");
      img.style.setProperty("--hover-y", cy.toFixed(3) + "%");
      img.style.setProperty("--hover-r", cr.toFixed(3) + "deg");

      if (hovering || Math.abs(cx) > 0.02 || Math.abs(cy) > 0.02 || Math.abs(cr) > 0.02) {
        raf = requestAnimationFrame(render);
      } else {
        img.style.setProperty("--hover-x", "0%");
        img.style.setProperty("--hover-y", "0%");
        img.style.setProperty("--hover-r", "0deg");
        raf = null;
      }
    }

    function onEnter(){
      hovering = true;
      if (!raf) raf = requestAnimationFrame(render);
    }

    function onMove(e){
      if (!hovering) return;
      var r = masthead.getBoundingClientRect();
      var nx = ((e.clientX - r.left) / r.width) * 2 - 1;  // -1..1
      var ny = ((e.clientY - r.top)  / r.height) * 2 - 1; // -1..1
      tx = nx * RANGE_X;
      ty = -ny * RANGE_Y * 0.7;
      tr = nx * ROT_MAX;
      if (!raf) raf = requestAnimationFrame(render);
    }

    function onLeave(){
      hovering = false;
      toNeutral();
      if (!raf) raf = requestAnimationFrame(render);
    }

    masthead.addEventListener("mouseenter", onEnter);
    masthead.addEventListener("mousemove", onMove);
    masthead.addEventListener("mouseleave", onLeave);

    window.addEventListener("blur", onLeave);
    document.addEventListener("visibilitychange", function(){
      if (document.hidden) onLeave();
    });
    window.addEventListener("resize", onLeave);
  }
})();
