import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "./AuthLayout.jsx";

export default function Login({ onLogin, onRequestCode, error }) {
  const [email, setEmail] = useState("amir@codeink.com");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const requestCode = async (event) => {
    event.preventDefault();
    await onRequestCode(email);
    setCodeSent(true);
  };

  const submit = (event) => {
    event.preventDefault();
    onLogin({ email, code });
  };

  return (
    <AuthLayout>
      <form className="glass-auth-card" onSubmit={codeSent ? submit : requestCode}>
        <div className="auth-card-heading">
          <span className="eyebrow">Member login</span>
          <h2>Email Verification</h2>
          <p>{codeSent ? "Enter the verification code sent to your email." : "Sign in with a secure code sent to your email."}</p>
        </div>
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
            New teammate? <Link to="/signup/new">Create account</Link>
          </span>
          {codeSent && <button type="button" onClick={() => setCodeSent(false)}>Use another email</button>}
        </div>
      </form>
    </AuthLayout>
  );
}
