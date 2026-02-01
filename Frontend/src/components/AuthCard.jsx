const AuthCard = ({ title = "LogiNav", subtitle = "", children, footer }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>

        {children}

        {footer && <div className="mt-4 text-sm text-center">{footer}</div>}
      </div>
    </div>
  );
};

export default AuthCard;
