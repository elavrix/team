function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 21) return "Good Evening";
  return "Good Night";
}

export default function AuthLayout({ children }) {
  return (
    <main className="login-page">
      <section className="auth-stage" aria-label="Workspace access">
        <div className="landscape-panel">
          <div className="creator-credit">
            <span>Amir Sharif</span>
            <img src="/codeink-logo.png" alt="Codeink logo" />
          </div>
          <div className="greeting-copy">
            <h1>{getGreeting()}</h1>
            <p>Have a focused journey ahead.</p>
          </div>
        </div>
        {children}
      </section>
    </main>
  );
}
