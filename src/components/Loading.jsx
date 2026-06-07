const Loading = ({ text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 "
      style={{ background: "rgba(18, 20, 31, 0.8)" }}>

      {/* Spinner */}
      <div className="relative w-14 h-14">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-white/8" />
        {/* Spinning arc */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "#a855f7", borderRightColor: "#7c3aed" }} />
        {/* Inner icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="url(#grad)" strokeWidth="2">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="m22 17-5-3-5 3-5-3-5 3" />
          </svg>
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{
              background: "linear-gradient(135deg, #a855f7, #7c3aed)",
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.8s",
            }}
          />
        ))}
      </div>

      {/* Text */}
      <p className="text-white/40 text-sm tracking-wide">{text}</p>
    </div>
  );
};

export default Loading;