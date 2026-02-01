import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const isEmail = (v) => /\S+@\S+\.\S+/.test(v);

const AuthForm = ({
  mode = "login",
  onSubmit,
  defaultRole = "USER",
  initialRemember = false,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [remember, setRemember] = useState(initialRemember);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  const focusFirstError = (errs) => {
    if (errs.email && emailRef.current) emailRef.current.focus();
    else if (errs.password && passwordRef.current) passwordRef.current.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const errs = {};
    if (!email) errs.email = "Please provide an email";
    else if (!isEmail(email)) errs.email = "Please enter a valid email";

    if (!password) errs.password = "Please provide a password";
    else if (mode === "signup" && password.length < 8)
      errs.password = "Password must be at least 8 characters";

    if (mode === "signup" && !role) errs.role = "Please select a role";

    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      focusFirstError(errs);
      return;
    }

    setFieldErrors({});

    try {
      setIsLoading(true);
      await onSubmit({ email, password, role, remember });
    } catch (err) {
      // Expect onSubmit to throw with {message} or Error
      const message =
        err?.response?.data?.message || err?.message || "Something went wrong";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" aria-live="polite">
      {error && (
        <div
          role="alert"
          className="mb-2 rounded-md bg-red-50 border border-red-100 text-red-700 px-4 py-2"
        >
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          ref={emailRef}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          className="mt-1 w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="you@example.com"
        />
        {fieldErrors.email && (
          <div id="email-error" className="text-sm text-red-600 mt-1">
            {fieldErrors.email}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          ref={passwordRef}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
          placeholder="Your password"
          className="mt-1 w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
        {fieldErrors.password && (
          <div id="password-error" className="text-sm text-red-600 mt-1">
            {fieldErrors.password}
          </div>
        )}
      </div>

      {mode === "signup" && (
        <div>
          <label className="block text-sm font-medium">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <option value="USER">User</option>
            <option value="OWNER">Owner</option>
          </select>
          {fieldErrors.role && (
            <div className="text-sm text-red-600 mt-1">{fieldErrors.role}</div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="rounded"
          />{" "}
          Remember me
        </label>

        <button
          type="button"
          onClick={() => navigate(mode === "login" ? "/signup" : "/login")}
          className="text-sm text-slate-500"
        >
          {mode === "login" ? "Create account" : "Have an account? Log in"}
        </button>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isLoading
            ? mode === "login"
              ? "Signing in..."
              : "Creating..."
            : mode === "login"
              ? "Log in"
              : "Create account"}
        </button>
      </div>
    </form>
  );
};

export default AuthForm;
