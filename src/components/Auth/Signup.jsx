import { ArrowRight, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "./AuthLayout.jsx";

export default function Signup({ onSignup, onRequestCode, error }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const requestCode = async (event) => {
    event.preventDefault();
    await onRequestCode(email, { name });
    setCodeSent(true);
  };

  const submit = (event) => {
    event.preventDefault();
    onSignup({ name, email, code });
  };

  return (
    <AuthLayout>
      <form className="glass-auth-card" onSubmit={codeSent ? submit : requestCode}>
        <div className="auth-card-heading">
          <span className="eyebrow">Team signup</span>
          <h2>Create Account</h2>
          <p>{codeSent ? "Enter the code from your email to finish signup." : "Join the workspace with email verification."}</p>
        </div>
        <label>
          Full name
          <span className="input-icon translucent">
            <UserRound size={17} />
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" required disabled={codeSent} />
          </span>
        </label>
        <label>
          Email
          <span className="input-icon translucent">
            <Mail size={17} />
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email ID" required disabled={codeSent} />
          </span>
        </label>
        {codeSent && (
          <label>
            Verification code
            <span className="input-icon translucent">
              <ShieldCheck size={17} />
              <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="6 digit code" required autoFocus />
            </span>
          </label>
        )}
        {error && <p className="auth-error">{error}</p>}
        <button className="button primary login-button" type="submit">
          {codeSent ? "Verify Code" : "Send Code"}
          <ArrowRight size={17} />
        </button>
        <div className="auth-links">
          <span>
            Already verified? <Link to="/login">Sign In</Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
}
