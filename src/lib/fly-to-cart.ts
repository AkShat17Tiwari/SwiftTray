"use client";

/**
 * Flying add-to-cart animation.
 *
 * Clones the item image at the position of the clicked element and animates
 * it along a curved path into the cart icon (navbar cart on desktop, bottom
 * nav cart on mobile), then pulses the cart target. Pure DOM + WAAPI, so it
 * never touches React state and can't interfere with cart functionality.
 */

const DESKTOP_TARGET_ID = "cart-fly-target";
const MOBILE_TARGET_ID = "cart-fly-target-mobile";

function getVisibleTarget(): HTMLElement | null {
  const candidates = [
    document.getElementById(DESKTOP_TARGET_ID),
    document.getElementById(MOBILE_TARGET_ID),
  ];

  for (const el of candidates) {
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    const visible =
      rect.width > 0 &&
      rect.height > 0 &&
      style.visibility !== "hidden" &&
      style.display !== "none";
    if (visible) return el;
  }
  return null;
}

export function flyToCart(sourceEl: HTMLElement | null, imageSrc: string) {
  if (typeof window === "undefined" || !sourceEl) return;

  const target = getVisibleTarget();
  if (!target) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) {
    pulseTarget(target);
    return;
  }

  const from = sourceEl.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  const size = 56;
  const startX = from.left + from.width / 2 - size / 2;
  const startY = from.top + from.height / 2 - size / 2;
  const endX = to.left + to.width / 2 - size / 2;
  const endY = to.top + to.height / 2 - size / 2;

  const flyer = document.createElement("div");
  flyer.style.cssText = [
    "position:fixed",
    `left:${startX}px`,
    `top:${startY}px`,
    `width:${size}px`,
    `height:${size}px`,
    "border-radius:9999px",
    "overflow:hidden",
    "z-index:9999",
    "pointer-events:none",
    "box-shadow:0 8px 24px rgba(26,46,53,0.35), 0 0 0 3px rgba(93,229,213,0.9)",
    "background:#E4EBF5",
    "will-change:transform,opacity",
  ].join(";");

  const img = document.createElement("img");
  img.src = imageSrc;
  img.alt = "";
  img.style.cssText = "width:100%;height:100%;object-fit:cover";
  flyer.appendChild(img);
  document.body.appendChild(flyer);

  const dx = endX - startX;
  const dy = endY - startY;
  // Arc: midpoint lifted above the straight line between source and target
  const lift = Math.min(160, Math.max(70, Math.abs(dx) * 0.25));

  const animation = flyer.animate(
    [
      { transform: "translate(0px, 0px) scale(1)", opacity: 1, offset: 0 },
      {
        transform: `translate(${dx * 0.5}px, ${dy * 0.5 - lift}px) scale(0.75) rotate(10deg)`,
        opacity: 1,
        offset: 0.55,
      },
      {
        transform: `translate(${dx}px, ${dy}px) scale(0.15) rotate(20deg)`,
        opacity: 0.4,
        offset: 1,
      },
    ],
    {
      duration: 700,
      easing: "cubic-bezier(0.45, 0.05, 0.55, 0.95)",
      fill: "forwards",
    }
  );

  const cleanup = () => {
    flyer.remove();
    pulseTarget(target);
  };
  animation.onfinish = cleanup;
  animation.oncancel = () => flyer.remove();
  // Safety net in case WAAPI events don't fire
  window.setTimeout(() => {
    if (flyer.isConnected) cleanup();
  }, 900);
}

function pulseTarget(target: HTMLElement) {
  target.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.35)" },
      { transform: "scale(0.92)" },
      { transform: "scale(1)" },
    ],
    { duration: 420, easing: "ease-out" }
  );
}
