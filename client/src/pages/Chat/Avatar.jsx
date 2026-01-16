const Avatar = ({ src, size = "md" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-24 h-24",
  };

  if (src) {
    return (
      <img
        src={src}
        className={`${sizes[size]} rounded-full object-cover`}
        alt="avatar"
      />
    );
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-[#DFE5E7] flex items-center justify-center`}>
      <svg viewBox="0 0 24 24" className="w-2/3 h-2/3 fill-white">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
};

export default Avatar;
