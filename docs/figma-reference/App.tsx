import { useMemo, useState, type ReactNode } from "react";

type IconName =
  | "calendar"
  | "clock"
  | "copy"
  | "check"
  | "chevron"
  | "dashboard"
  | "services"
  | "settings"
  | "sun"
  | "moon"
  | "menu"
  | "plus"
  | "more"
  | "share"
  | "arrow"
  | "x"
  | "user"
  | "logout"
  | "external"
  | "alert"
  | "spark";

const iconPaths: Record<IconName, ReactNode> = {
  calendar: (
    <>
      <path d="M6 2v4M18 2v4M3 9h18" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  services: (
    <>
      <path d="M4 7h16M4 17h16" />
      <circle cx="9" cy="7" r="2" />
      <circle cx="15" cy="17" r="2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.2 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2v-4h.5A1.7 1.7 0 0 0 4.2 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.6 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.16.37.38.7.68.96.3.26.68.4 1.08.4H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />,
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  more: (
    <>
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="2" />
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="19" r="2" />
      <path d="m8 11 8-5M8 13l8 5" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  x: <path d="m6 6 12 12M18 6 6 18" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  logout: (
    <>
      <path d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    </>
  ),
  external: (
    <>
      <path d="M14 3h7v7M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 3.6 2.4 18a2 2 0 0 0 1.8 3h15.6a2 2 0 0 0 1.8-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  spark: (
    <path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3ZM19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />
  ),
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

function Logo() {
  return (
    <button className="logo" onClick={() => location.reload()} aria-label="SlotBook home">
      <span className="logo-mark">
        <Icon name="calendar" size={17} />
      </span>
      <span>SlotBook</span>
    </button>
  );
}

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit";
};

function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  onClick,
  disabled,
  loading,
  className = "",
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`button button-${variant} button-${size} ${className}`}
    >
      {loading ? (
        <span className="spinner" />
      ) : icon ? (
        <Icon name={icon} size={size === "sm" ? 15 : 17} />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "primary" | "success" | "warning" | "neutral";
}) {
  return (
    <span className={`badge badge-${tone}`}>
      <span className="badge-dot" />
      {children}
    </span>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      className={`switch ${checked ? "switch-on" : ""}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
    >
      <span />
    </button>
  );
}

const services = [
  { name: "Women's haircut", duration: "60 min", price: "₴900", active: true },
  { name: "Men's haircut", duration: "30 min", price: "₴500", active: true },
  { name: "Hair coloring", duration: "120 min", price: "₴2,400", active: true },
  { name: "Blow-dry and styling", duration: "45 min", price: "₴600", active: false },
];

const bookings = [
  {
    time: "09:00",
    client: "Daria Kovalenko",
    service: "Women's haircut",
    price: "₴900",
    status: "Completed",
    tone: "success" as const,
  },
  {
    time: "10:30",
    client: "Maksym Shevchenko",
    service: "Men's haircut",
    price: "₴500",
    status: "Confirmed",
    tone: "primary" as const,
  },
  {
    time: "11:00",
    client: "Iryna Bondar",
    service: "Hair coloring",
    price: "₴2,400",
    status: "Confirmed",
    tone: "primary" as const,
  },
  {
    time: "13:30",
    client: "Andrii Melnyk",
    service: "Men's haircut",
    price: "₴500",
    status: "No-show",
    tone: "warning" as const,
  },
  {
    time: "14:30",
    client: "Sofia Tkachenko",
    service: "Blow-dry and styling",
    price: "₴600",
    status: "Confirmed",
    tone: "primary" as const,
  },
  {
    time: "16:00",
    client: "Olena Moroz",
    service: "Women's haircut",
    price: "₴900",
    status: "Cancelled",
    tone: "neutral" as const,
  },
];

const nav = [
  { label: "Overview", icon: "dashboard" as const },
  { label: "Bookings", icon: "calendar" as const },
  { label: "Services", icon: "services" as const },
  { label: "Schedule", icon: "clock" as const },
  { label: "Settings", icon: "settings" as const },
];

function Landing({
  openApp,
  openBooking,
  openAuth,
}: {
  openApp: () => void;
  openBooking: () => void;
  openAuth: () => void;
}) {
  return (
    <div className="landing">
      <header className="site-header">
        <div className="site-header-inner">
          <Logo />
          <div className="header-actions">
            <button className="text-button" onClick={openAuth}>
              Sign in
            </button>
            <Button size="sm" onClick={openAuth}>
              Get started
            </Button>
          </div>
        </div>
      </header>
      <main>
        <section className="hero section">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            Simple scheduling for independent professionals
          </div>
          <h1>
            Your booking page,
            <br />
            ready in five minutes
          </h1>
          <p>
            Share one simple link. Clients choose a free time and book instantly—no account, no
            back-and-forth, no double bookings.
          </p>
          <div className="hero-actions">
            <Button size="lg" onClick={openAuth}>
              Get started free <Icon name="arrow" size={17} />
            </Button>
            <Button size="lg" variant="outline" onClick={openBooking}>
              Try the demo
            </Button>
          </div>
          <div className="trust-line">
            <Icon name="check" size={15} /> Free to start <span>·</span>
            <Icon name="check" size={15} /> No credit card
          </div>
          <DashboardPreview />
        </section>
        <section className="steps section">
          <div className="section-heading">
            <span>How it works</span>
            <h2>From setup to booked in three steps</h2>
            <p>Spend less time coordinating calendars and more time with your clients.</p>
          </div>
          <div className="three-grid">
            {[
              [
                "01",
                "Add your services",
                "Set a name, duration and price for each service you offer.",
              ],
              [
                "02",
                "Share your link",
                "Add your personal booking link to Instagram, your website or messages.",
              ],
              [
                "03",
                "Get booked",
                "Clients see only real availability. You both get instant confirmation.",
              ],
            ].map(([num, title, copy]) => (
              <article className="step-card" key={num}>
                <span className="step-num">{num}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="feature-section section">
          <div className="feature-copy">
            <span className="section-kicker">Built for your working day</span>
            <h2>A clear calendar, always up to date</h2>
            <p>
              SlotBook turns your hours and service durations into real availability automatically.
            </p>
            <ul>
              {[
                "Automatic time slots",
                "No double bookings",
                "No client sign-up",
                "Works beautifully on any phone",
              ].map((x) => (
                <li key={x}>
                  <span>
                    <Icon name="check" size={15} />
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <BookingPhone />
        </section>
        <section className="final-cta section">
          <div>
            <span className="section-kicker">Start today</span>
            <h2>Your next booking is one link away.</h2>
            <p>Set up your page in five minutes. Keep your calendar calm for good.</p>
          </div>
          <Button size="lg" onClick={openAuth}>
            Create your booking page <Icon name="arrow" size={17} />
          </Button>
        </section>
      </main>
      <footer>
        <div>
          <Logo />
          <p>Simple online booking for independent professionals.</p>
        </div>
        <div className="footer-links">
          <button>Product</button>
          <button>Privacy</button>
          <button>Terms</button>
          <span>© 2026 SlotBook</span>
        </div>
      </footer>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="preview-shell">
      <div className="preview-sidebar">
        <Logo />
        <div className="preview-nav-lines">
          {[72, 88, 68, 80].map((w, i) => (
            <span key={i} style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
      <div className="preview-main">
        <div className="preview-top">
          <div>
            <small>Good morning, Olha</small>
            <strong>Here’s your day at a glance.</strong>
          </div>
          <span className="preview-avatar">OK</span>
        </div>
        <div className="preview-stats">
          {[
            ["6", "Today's bookings"],
            ["34", "This week"],
            ["₴28,400", "This month"],
          ].map(([v, l]) => (
            <div key={l}>
              <span>{l}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
        <div className="preview-content">
          <div className="mini-schedule">
            <div className="mini-title">
              <strong>Today’s schedule</strong>
              <span>November 10</span>
            </div>
            {bookings.slice(0, 4).map((b) => (
              <div className="mini-row" key={b.time}>
                <time>{b.time}</time>
                <span className="mini-avatar">
                  {b.client
                    .split(" ")
                    .map((x) => x[0])
                    .join("")}
                </span>
                <div>
                  <strong>{b.client}</strong>
                  <small>{b.service}</small>
                </div>
                <Badge tone={b.tone}>{b.status}</Badge>
              </div>
            ))}
          </div>
          <div className="mini-chart">
            <strong>Bookings</strong>
            <span>Last 7 days</span>
            <div className="bars">
              {[45, 68, 52, 84, 70, 92, 60].map((v, i) => (
                <i key={i} style={{ height: `${v}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingPhone() {
  return (
    <div className="phone-wrap">
      <div className="phone">
        <div className="phone-notch" />
        <div className="phone-brand">
          <span className="avatar">OH</span>
          <div>
            <strong>Olha Hair Studio</strong>
            <span>Kyiv, Ukraine</span>
          </div>
        </div>
        <div className="phone-step">
          <span>2 of 3</span>
          <div>
            <i />
            <i className="active" />
            <i />
          </div>
        </div>
        <strong className="phone-title">Choose a time</strong>
        <div className="phone-dates">
          {["MON\n9", "TUE\n10", "WED\n11", "THU\n12"].map((d, i) => (
            <span className={i === 1 ? "active" : ""} key={d}>
              {d.split("\n").map((x) => (
                <b key={x}>{x}</b>
              ))}
            </span>
          ))}
        </div>
        <small className="timezone">Times shown in Kyiv time (EET)</small>
        <div className="phone-slots">
          {["09:00", "09:30", "10:00", "12:00", "13:30", "15:00"].map((x, i) => (
            <span className={i === 3 ? "active" : ""} key={x}>
              {x}
            </span>
          ))}
        </div>
        <Button>Continue</Button>
      </div>
    </div>
  );
}

function AuthModal({ close, enterApp }: { close: () => void; enterApp: () => void }) {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [loading, setLoading] = useState(false);
  const submit = () => {
    setLoading(true);
    window.setTimeout(enterApp, 700);
  };
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div className="auth-card" onMouseDown={(e) => e.stopPropagation()}>
        <button className="icon-button close-button" onClick={close} aria-label="Close">
          <Icon name="x" />
        </button>
        <Logo />
        <div className="auth-heading">
          <h2>{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
          <p>
            {mode === "signup"
              ? "Set up your booking page in a few minutes."
              : "Sign in to manage your bookings."}
          </p>
        </div>
        {mode === "signup" && <Field label="Your name" placeholder="Olha Kovalenko" />}
        <Field label="Email address" placeholder="olha@example.com" type="email" />
        <Field
          label="Password"
          placeholder="At least 8 characters"
          type="password"
          hint={mode === "signup" ? "Use 8 or more characters with a number." : undefined}
        />
        <Button className="full-button" loading={loading} onClick={submit}>
          {mode === "signup" ? "Create account" : "Sign in"}
        </Button>
        <div className="auth-divider">
          <span>or</span>
        </div>
        <Button className="full-button" variant="outline" onClick={enterApp}>
          <Icon name="spark" size={17} /> Try the demo
        </Button>
        <p className="auth-switch">
          {mode === "signup" ? "Already have an account?" : "New to SlotBook?"}{" "}
          <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
            {mode === "signup" ? "Sign in" : "Create an account"}
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  hint,
  error,
}: {
  label: string;
  placeholder: string;
  type?: string;
  hint?: string;
  error?: string;
}) {
  return (
    <label className={`field ${error ? "field-error" : ""}`}>
      <span>{label}</span>
      <input type={type} placeholder={placeholder} />
      <small>{error || hint}</small>
    </label>
  );
}

type AppPage = "Overview" | "Bookings" | "Services" | "Schedule" | "Settings";

function OwnerApp({ exit, openBooking }: { exit: () => void; openBooking: () => void }) {
  const [page, setPage] = useState<AppPage>("Overview");
  const [dark, setDark] = useState(false);
  const [toast, setToast] = useState("");
  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 2200);
  };
  return (
    <div className={`app-shell ${dark ? "dark" : ""}`}>
      <aside className="sidebar">
        <Logo />
        <nav>
          {nav.map((item) => (
            <button
              key={item.label}
              className={page === item.label ? "active" : ""}
              onClick={() => setPage(item.label as AppPage)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.label === "Bookings" && <b>6</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => setDark(!dark)}>
            <Icon name={dark ? "sun" : "moon"} />
            <span>{dark ? "Light mode" : "Dark mode"}</span>
          </button>
          <button className="account">
            <span className="avatar">OK</span>
            <span>
              <strong>Olha</strong>
              <small>Free plan</small>
            </span>
            <Icon name="more" />
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <div className="mobile-logo">
            <Logo />
          </div>
          <span className="page-label">{page}</span>
          <div className="top-actions">
            <button
              className="icon-button"
              onClick={() => setDark(!dark)}
              aria-label="Toggle theme"
            >
              <Icon name={dark ? "sun" : "moon"} />
            </button>
            <Button size="sm" variant="outline" icon="external" onClick={openBooking}>
              View booking page
            </Button>
            <button className="avatar top-avatar">OK</button>
          </div>
        </header>
        <main className="app-content">
          {page === "Overview" && <Overview onCopy={() => showToast("Link copied")} />}
          {page === "Bookings" && <BookingsPage />}
          {page === "Services" && <ServicesPage onSaved={() => showToast("Service saved")} />}
          {page === "Schedule" && <SchedulePage onSaved={() => showToast("Schedule saved")} />}
          {page === "Settings" && <SettingsPage dark={dark} setDark={setDark} exit={exit} />}
        </main>
      </div>
      <nav className="bottom-nav">
        {nav.slice(0, 4).map((item) => (
          <button
            key={item.label}
            className={page === item.label ? "active" : ""}
            onClick={() => setPage(item.label as AppPage)}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      {toast && (
        <div className="toast">
          <span>
            <Icon name="check" size={15} />
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}

function PageHead({ title, copy, action }: { title: string; copy: string; action?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      {action}
    </div>
  );
}

function Overview({ onCopy }: { onCopy: () => void }) {
  const chart = [
    4, 6, 5, 8, 7, 9, 5, 6, 10, 7, 8, 11, 9, 6, 7, 12, 10, 8, 9, 13, 11, 7, 9, 12, 10, 14, 9, 11,
    13, 12,
  ];
  return (
    <>
      <PageHead title="Good morning, Olha" copy="Tuesday, November 10, 2026" />
      <section className="share-card">
        <div className="share-icon">
          <Icon name="share" />
        </div>
        <div>
          <strong>Your booking page is live</strong>
          <span>slotbook.app/book/olha-hair-studio</span>
        </div>
        <Button variant="outline" size="sm" icon="copy" onClick={onCopy}>
          Copy link
        </Button>
      </section>
      <section className="stat-grid">
        {[
          ["Today's bookings", "6", "+2 from yesterday"],
          ["This week", "34", "+12% from last week"],
          ["Revenue this month", "₴28,400", "+8% from October"],
          ["No-show rate", "3%", "Down 1.2% this month"],
        ].map(([l, v, s], i) => (
          <article className="stat-card" key={l}>
            <div>
              <span>{l}</span>
              <small className={i === 3 ? "neutral" : ""}>{s}</small>
            </div>
            <strong>{v}</strong>
          </article>
        ))}
      </section>
      <div className="dashboard-grid">
        <section className="card schedule-card">
          <div className="card-head">
            <div>
              <h2>Today’s schedule</h2>
              <p>6 bookings · 5h 15m booked</p>
            </div>
            <button className="link-button">
              View all <Icon name="arrow" size={14} />
            </button>
          </div>
          <div className="timeline">
            {bookings.map((b) => (
              <div className="timeline-row" key={b.time}>
                <time>{b.time}</time>
                <span className={`timeline-mark mark-${b.tone}`} />
                <div className="client">
                  <span className="mini-avatar">
                    {b.client
                      .split(" ")
                      .map((x) => x[0])
                      .join("")}
                  </span>
                  <div>
                    <strong>{b.client}</strong>
                    <small>{b.service}</small>
                  </div>
                </div>
                <Badge tone={b.tone}>{b.status}</Badge>
              </div>
            ))}
          </div>
        </section>
        <section className="card chart-card">
          <div className="card-head">
            <div>
              <h2>Bookings</h2>
              <p>Last 30 days</p>
            </div>
            <strong className="chart-total">
              124 <small>+12%</small>
            </strong>
          </div>
          <div className="chart-area">
            <div className="y-labels">
              <span>15</span>
              <span>10</span>
              <span>5</span>
              <span>0</span>
            </div>
            <div className="chart-bars">
              {chart.map((v, i) => (
                <i key={i} style={{ height: `${(v / 15) * 100}%` }} />
              ))}
            </div>
          </div>
          <div className="x-labels">
            <span>Oct 12</span>
            <span>Oct 19</span>
            <span>Oct 26</span>
            <span>Nov 2</span>
            <span>Nov 10</span>
          </div>
        </section>
      </div>
    </>
  );
}

function BookingsPage() {
  const [tab, setTab] = useState("Upcoming");
  const [selected, setSelected] = useState<(typeof bookings)[number] | null>(null);
  const [view, setView] = useState("List");
  const shown =
    tab === "Cancelled"
      ? bookings.filter((b) => b.status === "Cancelled")
      : tab === "Past"
        ? bookings.filter((b) => b.status === "Completed" || b.status === "No-show")
        : bookings.filter((b) => b.status === "Confirmed");
  return (
    <>
      <PageHead
        title="Bookings"
        copy="View and manage every client appointment."
        action={<Button icon="plus">Add booking</Button>}
      />
      <div className="toolbar">
        <div className="tabs">
          {["Upcoming", "Past", "Cancelled"].map((x) => (
            <button className={tab === x ? "active" : ""} onClick={() => setTab(x)} key={x}>
              {x}
              {x === "Upcoming" && <span>3</span>}
            </button>
          ))}
        </div>
        <div className="view-toggle">
          <button className={view === "Week" ? "active" : ""} onClick={() => setView("Week")}>
            <Icon name="calendar" /> Week
          </button>
          <button className={view === "List" ? "active" : ""} onClick={() => setView("List")}>
            <Icon name="menu" /> List
          </button>
        </div>
      </div>
      <div className="filters">
        <button>
          All services <Icon name="chevron" size={14} />
        </button>
        <button>
          <Icon name="calendar" size={15} /> Nov 10 – Dec 10 <Icon name="chevron" size={14} />
        </button>
      </div>
      <section className="table-card">
        <div className="table-row table-head">
          <span>Date & time</span>
          <span>Client</span>
          <span>Service</span>
          <span>Price</span>
          <span>Status</span>
          <span />
        </div>
        {shown.map((b, i) => (
          <button className="table-row" onClick={() => setSelected(b)} key={b.time}>
            <span>
              <strong>Tue, Nov 10</strong>
              <small>{b.time}</small>
            </span>
            <span>
              <strong>{b.client}</strong>
              <small>{i % 2 ? "maksym@example.com" : "client@example.com"}</small>
            </span>
            <span>{b.service}</span>
            <span className="tabular">{b.price}</span>
            <span>
              <Badge tone={b.tone}>{b.status}</Badge>
            </span>
            <span className="row-action">
              <Icon name="more" />
            </span>
          </button>
        ))}
      </section>
      {shown.length === 0 && (
        <EmptyState
          title="No bookings here"
          copy="When appointments match this view, they’ll appear here."
        />
      )}
      {selected && <BookingModal booking={selected} close={() => setSelected(null)} />}
    </>
  );
}

function BookingModal({
  booking,
  close,
}: {
  booking: (typeof bookings)[number];
  close: () => void;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div className="detail-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <Badge tone={booking.tone}>{booking.status}</Badge>
            <h2>{booking.client}</h2>
            <p>Booking details</p>
          </div>
          <button className="icon-button" onClick={close} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        <div className="detail-list">
          <div>
            <Icon name="calendar" />
            <span>
              <small>Date & time</small>
              <strong>Tuesday, November 10 at {booking.time}</strong>
            </span>
          </div>
          <div>
            <Icon name="services" />
            <span>
              <small>Service</small>
              <strong>
                {booking.service} · {booking.service === "Hair coloring" ? "120" : "60"} min
              </strong>
            </span>
          </div>
          <div>
            <Icon name="user" />
            <span>
              <small>Contact</small>
              <strong>client@example.com</strong>
            </span>
          </div>
        </div>
        <div className="detail-total">
          <span>Total</span>
          <strong>{booking.price}</strong>
        </div>
        <div className="modal-actions">
          <Button variant="secondary">Mark completed</Button>
          <Button variant="outline">Mark no-show</Button>
          <Button variant="ghost">Cancel booking</Button>
        </div>
      </div>
    </div>
  );
}

function ServicesPage({ onSaved }: { onSaved: () => void }) {
  const [items, setItems] = useState(services);
  const [open, setOpen] = useState(false);
  const toggle = (index: number) =>
    setItems(items.map((x, i) => (i === index ? { ...x, active: !x.active } : x)));
  return (
    <>
      <PageHead
        title="Services"
        copy="Create and manage the services clients can book."
        action={
          <Button icon="plus" onClick={() => setOpen(true)}>
            Add service
          </Button>
        }
      />
      <section className="service-grid">
        {items.map((s, i) => (
          <article className={`service-card ${!s.active ? "inactive" : ""}`} key={s.name}>
            <div className="service-card-top">
              <span className="service-icon">
                <Icon name="services" />
              </span>
              <Toggle checked={s.active} onChange={() => toggle(i)} label={`Toggle ${s.name}`} />
            </div>
            <div>
              <h3>{s.name}</h3>
              <p>
                <Icon name="clock" size={15} /> {s.duration}
              </p>
            </div>
            <div className="service-bottom">
              <strong>{s.price}</strong>
              <button className="icon-button" aria-label="More actions">
                <Icon name="more" />
              </button>
            </div>
          </article>
        ))}
      </section>
      {open && (
        <ServiceModal
          close={() => setOpen(false)}
          save={() => {
            setOpen(false);
            onSaved();
          }}
        />
      )}
    </>
  );
}

function ServiceModal({ close, save }: { close: () => void; save: () => void }) {
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div className="form-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>Add service</h2>
            <p>Add a service clients can book online.</p>
          </div>
          <button className="icon-button" onClick={close}>
            <Icon name="x" />
          </button>
        </div>
        <Field label="Service name" placeholder="e.g. Women's haircut" />
        <div className="two-fields">
          <Field label="Duration" placeholder="60 minutes" />
          <Field label="Price" placeholder="₴900" />
        </div>
        <label className="textarea-field">
          <span>
            Description <small>Optional</small>
          </span>
          <textarea placeholder="A short description clients will see." rows={3} />
        </label>
        <div className="modal-footer">
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button onClick={save}>Save service</Button>
        </div>
      </div>
    </div>
  );
}

function SchedulePage({ onSaved }: { onSaved: () => void }) {
  const [days, setDays] = useState([true, true, true, true, true, true, false]);
  const [dirty, setDirty] = useState(false);
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const toggle = (i: number) => {
    setDays(days.map((d, x) => (x === i ? !d : d)));
    setDirty(true);
  };
  return (
    <>
      <PageHead title="Schedule" copy="Set the hours clients can book with you." />
      <div className="schedule-layout">
        <section className="card hours-card">
          <div className="card-head">
            <div>
              <h2>Working hours</h2>
              <p>Your regular weekly availability.</p>
            </div>
          </div>
          {dayNames.map((day, i) => (
            <div className="hours-row" key={day}>
              <Toggle checked={days[i]} onChange={() => toggle(i)} label={`Toggle ${day}`} />
              <strong>{day}</strong>
              {days[i] ? (
                <>
                  <button className="time-select">
                    {i === 5 ? "10:00" : "09:00"} <Icon name="chevron" size={13} />
                  </button>
                  <span>to</span>
                  <button className="time-select">
                    {i === 5 ? "15:00" : "18:00"} <Icon name="chevron" size={13} />
                  </button>
                </>
              ) : (
                <em>Closed</em>
              )}
            </div>
          ))}
        </section>
        <section className="card days-off">
          <div className="card-head">
            <div>
              <h2>Days off</h2>
              <p>Block dates when you’re unavailable.</p>
            </div>
            <Button size="sm" variant="outline" icon="plus">
              Add date
            </Button>
          </div>
          <div className="off-date">
            <span>
              <strong>Dec 24 – 26, 2026</strong>
              <small>Christmas break</small>
            </span>
            <button className="icon-button">
              <Icon name="x" />
            </button>
          </div>
          <div className="off-date">
            <span>
              <strong>Jan 1, 2027</strong>
              <small>New Year’s Day</small>
            </span>
            <button className="icon-button">
              <Icon name="x" />
            </button>
          </div>
        </section>
      </div>
      {dirty && (
        <div className="save-bar">
          <span>You have unsaved changes</span>
          <div>
            <Button size="sm" variant="ghost" onClick={() => setDirty(false)}>
              Discard
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setDirty(false);
                onSaved();
              }}
            >
              Save changes
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function SettingsPage({
  dark,
  setDark,
  exit,
}: {
  dark: boolean;
  setDark: (v: boolean) => void;
  exit: () => void;
}) {
  const [tab, setTab] = useState("Profile");
  return (
    <>
      <PageHead title="Settings" copy="Manage your account and booking page." />
      <div className="settings-tabs">
        {["Profile", "Business", "Appearance"].map((x) => (
          <button className={tab === x ? "active" : ""} onClick={() => setTab(x)} key={x}>
            {x}
          </button>
        ))}
      </div>
      <section className="card settings-card">
        {tab === "Profile" && (
          <>
            <div className="settings-title">
              <h2>Personal information</h2>
              <p>Update your photo and personal details.</p>
            </div>
            <div className="avatar-edit">
              <span className="avatar large">OK</span>
              <Button size="sm" variant="outline">
                Change photo
              </Button>
            </div>
            <div className="settings-fields">
              <Field label="Full name" placeholder="Olha Kovalenko" />
              <Field label="Email address" placeholder="olha@example.com" />
            </div>
            <div className="settings-actions">
              <Button>Save changes</Button>
            </div>
          </>
        )}
        {tab === "Business" && (
          <>
            <div className="settings-title">
              <h2>Business details</h2>
              <p>These details appear on your public booking page.</p>
            </div>
            <div className="settings-fields">
              <Field label="Business name" placeholder="Olha Hair Studio" />
              <Field label="Public link" placeholder="slotbook.app/book/olha-hair-studio" />
              <Field label="Timezone" placeholder="Europe/Kyiv" />
            </div>
            <div className="settings-actions">
              <Button>Save changes</Button>
            </div>
          </>
        )}
        {tab === "Appearance" && (
          <>
            <div className="settings-title">
              <h2>Appearance</h2>
              <p>Choose how SlotBook looks on this device.</p>
            </div>
            <div className="theme-grid">
              {[
                ["Light", false],
                ["Dark", true],
                ["System", dark],
              ].map(([name, value]) => (
                <button
                  key={String(name)}
                  className={
                    (name === "Dark" && dark) || (name === "Light" && !dark) ? "active" : ""
                  }
                  onClick={() => name !== "System" && setDark(Boolean(value))}
                >
                  <span className={`theme-preview ${name === "Dark" ? "dark-preview" : ""}`}>
                    <i />
                    <b />
                    <b />
                    <b />
                  </span>
                  <strong>{name}</strong>
                  <span className="radio" />
                </button>
              ))}
            </div>
          </>
        )}
      </section>
      <section className="danger-card">
        <div>
          <h3>Delete account</h3>
          <p>Permanently delete your account and all booking data.</p>
        </div>
        <Button variant="destructive">Delete account</Button>
      </section>
      <button className="mobile-logout" onClick={exit}>
        <Icon name="logout" /> Sign out
      </button>
    </>
  );
}

function EmptyState({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="empty-state">
      <span>
        <Icon name="calendar" />
      </span>
      <h3>{title}</h3>
      <p>{copy}</p>
    </div>
  );
}

function PublicBooking({ close }: { close: () => void }) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState(services[0]);
  const [slot, setSlot] = useState("12:00");
  const [confirmed, setConfirmed] = useState(false);
  const slots = ["09:00", "09:30", "10:00", "12:00", "13:30", "15:00", "16:30", "17:00"];
  if (confirmed)
    return (
      <div className="public-page">
        <PublicHeader close={close} />
        <main className="confirmation">
          <div className="success-mark">
            <Icon name="check" size={30} />
          </div>
          <span className="section-kicker">Booking confirmed</span>
          <h1>You’re all set, Daria.</h1>
          <p>We sent the details to daria@example.com.</p>
          <div className="confirmation-card">
            <div>
              <span>Service</span>
              <strong>{service.name}</strong>
            </div>
            <div>
              <span>Date & time</span>
              <strong>Tuesday, November 10 at {slot}</strong>
            </div>
            <div>
              <span>Location</span>
              <strong>14 Saksahanskoho St, Kyiv</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{service.price}</strong>
            </div>
          </div>
          <div className="confirmation-actions">
            <Button icon="calendar">Add to calendar</Button>
            <Button variant="outline">Manage booking</Button>
          </div>
          <small>Need to make a change? You can cancel your booking up to 24 hours before.</small>
        </main>
      </div>
    );
  return (
    <div className="public-page">
      <PublicHeader close={close} />
      <main className="booking-main">
        <section className="booking-form">
          <div className="business-head">
            <span className="business-avatar">OH</span>
            <div>
              <h1>Olha Hair Studio</h1>
              <p>Thoughtful cuts, color and styling in the heart of Kyiv.</p>
              <span>14 Saksahanskoho St, Kyiv</span>
            </div>
          </div>
          <div className="booking-stepper">
            {[1, 2, 3].map((n) => (
              <div className={n === step ? "active" : n < step ? "done" : ""} key={n}>
                <span>{n < step ? <Icon name="check" size={13} /> : n}</span>
                <b>{["Service", "Date & time", "Your details"][n - 1]}</b>
              </div>
            ))}
          </div>
          {step === 1 && (
            <div className="booking-section">
              <div className="booking-title">
                <span>Step 1 of 3</span>
                <h2>Choose a service</h2>
                <p>Select what you’d like to book.</p>
              </div>
              <div className="service-options">
                {services.map((s, i) => (
                  <button
                    key={s.name}
                    className={service.name === s.name ? "active" : ""}
                    onClick={() => setService(s)}
                  >
                    <span className="radio" />
                    <div>
                      <strong>{s.name}</strong>
                      <span>{s.duration}</span>
                    </div>
                    <b>{s.price}</b>
                    {i === 3 && <small>Popular</small>}
                  </button>
                ))}
              </div>
              <Button className="booking-next" onClick={() => setStep(2)}>
                Continue <Icon name="arrow" />
              </Button>
            </div>
          )}
          {step === 2 && (
            <div className="booking-section">
              <div className="booking-title">
                <span>Step 2 of 3</span>
                <h2>Choose a date and time</h2>
                <p>All available times are shown below.</p>
              </div>
              <Calendar />
              <div className="slot-heading">
                <strong>Tuesday, November 10</strong>
                <span>Times shown in Kyiv time (EET)</span>
              </div>
              <div className="slot-grid">
                {slots.map((x) => (
                  <button className={slot === x ? "active" : ""} onClick={() => setSlot(x)} key={x}>
                    {x}
                  </button>
                ))}
              </div>
              <div className="booking-actions">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>
                  Continue <Icon name="arrow" />
                </Button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="booking-section">
              <div className="booking-title">
                <span>Step 3 of 3</span>
                <h2>Your details</h2>
                <p>We’ll only use these to confirm your booking.</p>
              </div>
              <Field label="Your name" placeholder="Daria Kovalenko" />
              <Field label="Email address" placeholder="daria@example.com" type="email" />
              <label className="textarea-field">
                <span>
                  Note <small>Optional</small>
                </span>
                <textarea rows={3} placeholder="Anything Olha should know?" />
              </label>
              <div className="booking-actions">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setConfirmed(true)}>Confirm booking</Button>
              </div>
            </div>
          )}
        </section>
        <aside className="booking-summary">
          <span className="section-kicker">Your booking</span>
          <h2>{service.name}</h2>
          <div>
            <Icon name="calendar" />
            <span>
              <small>Date</small>
              <strong>Tuesday, November 10</strong>
            </span>
          </div>
          <div>
            <Icon name="clock" />
            <span>
              <small>Time</small>
              <strong>
                {slot} · {service.duration}
              </strong>
            </span>
          </div>
          <div>
            <Icon name="user" />
            <span>
              <small>With</small>
              <strong>Olha Kovalenko</strong>
            </span>
          </div>
          <hr />
          <p>
            <span>Total</span>
            <strong>{service.price}</strong>
          </p>
          <small>No payment required today.</small>
        </aside>
      </main>
      {step === 3 && (
        <div className="mobile-summary">
          <div>
            <span>{service.name}</span>
            <strong>{service.price}</strong>
            <small>Nov 10 · {slot}</small>
          </div>
          <Button onClick={() => setConfirmed(true)}>Confirm</Button>
        </div>
      )}
    </div>
  );
}

function PublicHeader({ close }: { close: () => void }) {
  return (
    <header className="public-header">
      <Logo />
      <button className="text-button" onClick={close}>
        For businesses <Icon name="arrow" size={14} />
      </button>
    </header>
  );
}

function Calendar() {
  const days = Array.from({ length: 35 }, (_, i) => i - 1);
  return (
    <div className="calendar">
      <div className="calendar-head">
        <button className="icon-button">
          <Icon name="chevron" />
        </button>
        <strong>November 2026</strong>
        <button className="icon-button next">
          <Icon name="chevron" />
        </button>
      </div>
      <div className="calendar-grid">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <b key={i}>{d}</b>
        ))}
        {days.map((d, i) => (
          <button
            key={i}
            disabled={d < 1 || d === 8 || d === 15}
            className={d === 10 ? "active" : d === 3 ? "today" : ""}
          >
            {d > 0 && d <= 30 ? d : ""}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<"landing" | "app" | "booking">("landing");
  const [auth, setAuth] = useState(false);
  const content = useMemo(() => {
    if (view === "app")
      return <OwnerApp exit={() => setView("landing")} openBooking={() => setView("booking")} />;
    if (view === "booking") return <PublicBooking close={() => setView("landing")} />;
    return (
      <Landing
        openApp={() => setView("app")}
        openBooking={() => setView("booking")}
        openAuth={() => setAuth(true)}
      />
    );
  }, [view]);
  return (
    <>
      {content}
      {auth && (
        <AuthModal
          close={() => setAuth(false)}
          enterApp={() => {
            setAuth(false);
            setView("app");
          }}
        />
      )}
    </>
  );
}
