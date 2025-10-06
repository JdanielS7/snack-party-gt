import logoJpg from "../assets/logo.jpg";
import logoPng from "../assets/logo.png";

export default function Logo({ className = "", alt = "Snack Party Logo" }) {
  const preferredSrc = logoJpg || logoPng;

  return (
    <div
      className={["rounded-full overflow-hidden select-none", className].join(" ")}
      aria-label={alt}
    >
      <img
        src={preferredSrc}
        alt={alt}
        className="w-full h-full object-contain"
        loading="eager"
        decoding="async"
        draggable="false"
      />
    </div>
  );
}
