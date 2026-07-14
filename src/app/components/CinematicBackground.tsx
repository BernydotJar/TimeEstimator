const CinematicBackground = () => {
  return (
    <div aria-hidden="true" className="cinematic-backdrop">
      <div className="cinematic-orb cinematic-orb-cyan" />
      <div className="cinematic-orb cinematic-orb-amber" />
      <div className="cinematic-grid-overlay" />
    </div>
  );
};

export default CinematicBackground;
