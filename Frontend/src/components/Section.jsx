export const Section = ({ children, className = "", id }) => {
  return (
    <section id={id} className={`py-20 px-6 md:px-12 lg:px-24 ${className}`}>
      <div className="max-w-7xl mx-auto">{children}</div>
    </section>
  );
};
