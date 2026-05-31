import { useEffect, useId, useRef, useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Home,
} from "lucide-react";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Research", path: "/research" },
  { label: "Ceramics", path: "/ceramics" },
  { label: "Photography", path: "/photography" },
  { label: "Travel", path: "/travel" },
];

const sections = [
  {
    id: "research",
    title: "Research",
    path: "/research",
    description:
      "Close looking, careful questions, and the kind of thinking that keeps unfolding after the page ends.",
    Icon: ResearchIcon,
  },
  {
    id: "ceramics",
    title: "Ceramics",
    path: "/ceramics",
    description:
      "Hand-built forms, quiet surfaces, and objects with evidence of touch still held inside them.",
    Icon: CeramicsIcon,
  },
  {
    id: "photography",
    title: "Photography",
    path: "/photography",
    description:
      "Light, place, memory, and small compositions that make ordinary moments feel newly seen.",
    Icon: PhotographyIcon,
  },
  {
    id: "travel",
    title: "Travel",
    path: "/travel",
    description:
      "Fragments from elsewhere: streets, meals, landscapes, textures, and the mood of being in motion.",
    Icon: TravelIcon,
  },
];

const SWOOSH_WIDTH = 1440;
const SWOOSH_HEIGHT = 360;
const SECTION_MOTION_SETTLE_MS = 420;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createCurve(points) {
  return points
    .slice(1)
    .map((point, index) => {
      const previous = points[index];
      const controlX = (previous.x + point.x) / 2;

      return `C ${controlX} ${previous.y} ${controlX} ${point.y} ${point.x} ${point.y}`;
    })
    .join(" ");
}

function createSwooshPath() {
  const segmentCount = 8;
  const topPoints = [];
  const bottomPoints = [];
  const startsHigh = Math.random() > 0.5;

  for (let index = 0; index <= segmentCount; index += 1) {
    const x = (SWOOSH_WIDTH / segmentCount) * index;
    const waveIsHigh = index % 2 === (startsHigh ? 0 : 1);
    const baseTop = waveIsHigh ? randomBetween(54, 84) : randomBetween(142, 178);
    const top = baseTop + randomBetween(-12, 12);
    const thickness = waveIsHigh ? randomBetween(126, 158) : randomBetween(112, 146);

    topPoints.push({ x, y: top });
    bottomPoints.push({
      x,
      y: Math.min(SWOOSH_HEIGHT - 18, top + thickness + randomBetween(-8, 12)),
    });
  }

  const bottomReverse = [...bottomPoints].reverse();

  return [
    `M ${topPoints[0].x} ${topPoints[0].y}`,
    createCurve(topPoints),
    `L ${bottomReverse[0].x} ${bottomReverse[0].y}`,
    createCurve(bottomReverse),
    "Z",
  ].join(" ");
}

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="page-frame">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {sections.map((section) => (
            <Route
              key={section.path}
              path={section.path}
              element={<PlaceholderPage section={section} />}
            />
          ))}
        </Routes>
      </main>
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="site-header">
      <NavLink className="brand-mark" to="/" aria-label="Shevya home">
        <span className="brand-symbol" aria-hidden="true">
          S
        </span>
        <span>Shevya</span>
      </NavLink>

      <nav className="top-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "nav-link nav-link-active" : "nav-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

function HomePage() {
  const [swooshPath] = useState(() => createSwooshPath());
  const [activeSection, setActiveSection] = useState("");
  const [motionPhases, setMotionPhases] = useState({});
  const motionTimeoutsRef = useRef({});
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const setSectionMotion = (sectionId, phase) => {
    window.clearTimeout(motionTimeoutsRef.current[sectionId]);
    setMotionPhases((currentPhases) => ({
      ...currentPhases,
      [sectionId]: phase,
    }));
    motionTimeoutsRef.current[sectionId] = window.setTimeout(() => {
      setMotionPhases((currentPhases) => {
        const nextPhases = { ...currentPhases };
        delete nextPhases[sectionId];
        return nextPhases;
      });
      delete motionTimeoutsRef.current[sectionId];
    }, SECTION_MOTION_SETTLE_MS);
  };
  const activateSection = (sectionId) => {
    setActiveSection(sectionId);
    setSectionMotion(sectionId, "enter");
  };
  const deactivateSection = (sectionId) => {
    setActiveSection((currentSection) =>
      currentSection === sectionId ? "" : currentSection,
    );
    setSectionMotion(sectionId, "exit");
  };

  useEffect(() => {
    return () => {
      Object.values(motionTimeoutsRef.current).forEach((timeoutId) =>
        window.clearTimeout(timeoutId),
      );
    };
  }, []);

  return (
    <section id="landing" className="home-page" aria-labelledby="home-title">
      <div className="landing-panel">
        <div className="profile-grid">
          <svg
            className="hero-swoosh"
            viewBox={`0 0 ${SWOOSH_WIDTH} ${SWOOSH_HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path d={swooshPath} />
          </svg>
          <PortraitPanel />
          <div className="profile-copy">
            <h1 id="home-title">Shevya</h1>
            <p className="intro-copy">
              A portfolio for a curious maker and observer: a place for her
              research, clay work, photographs, and notes from the world as she
              sees it.
            </p>
          </div>
        </div>

        <a
          href="#portfolio-sections"
          className="hero-scroll-link"
          aria-label="Scroll to portfolio sections"
        >
          <ChevronDown size={34} strokeWidth={1.5} aria-hidden="true" />
        </a>
      </div>

      <section
        id="portfolio-sections"
        className="section-box-screen"
        aria-label="Portfolio sections"
      >
        <button
          type="button"
          className="section-scroll-top"
          aria-label="Scroll back to landing page"
          onClick={scrollToTop}
        >
          <ChevronUp size={28} strokeWidth={1.6} aria-hidden="true" />
        </button>
        <div className="section-box-grid">
          {sections.map((section) => (
            <SectionBox
              key={section.id}
              isActive={activeSection === section.id}
              motionPhase={motionPhases[section.id] || ""}
              section={section}
              onActivate={() => activateSection(section.id)}
              onDeactivate={() => deactivateSection(section.id)}
            />
          ))}
        </div>
      </section>
    </section>
  );
}

function PortraitPanel() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <figure className="portrait-panel">
      {!imageFailed && (
        <img
          src="/shevya-portrait.PNG"
          alt="Shevya"
          className="portrait-image"
          onError={() => setImageFailed(true)}
        />
      )}
      {imageFailed && (
        <div className="portrait-fallback" role="img" aria-label="Shevya">
          <span>Shevya</span>
          <span>Portrait image</span>
        </div>
      )}
    </figure>
  );
}

function SectionBox({
  section,
  isActive,
  motionPhase,
  onActivate,
  onDeactivate,
}) {
  const { Icon } = section;
  const iconProps = {
    size: 22,
    strokeWidth: 1.7,
    "aria-hidden": "true",
  };

  return (
    <NavLink
      to={section.path}
      className={[
        `section-box section-box-${section.id}`,
        isActive ? "section-box-active" : "",
        motionPhase ? `section-box-motion-${motionPhase}` : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onBlur={onDeactivate}
      onFocus={onActivate}
      onPointerEnter={onActivate}
      onPointerLeave={onDeactivate}
    >
      <div className="section-box-heading">
        <Icon {...iconProps} />
        <h2>{section.title}</h2>
      </div>
      <p>{section.description}</p>
      <span className="section-box-link">
        Open {section.title}
        <ArrowUpRight size={18} strokeWidth={1.7} aria-hidden="true" />
      </span>
    </NavLink>
  );
}

function ResearchIcon({
  className = "",
  size = 24,
  strokeWidth = 1.7,
  ...props
}) {
  const rawId = useId();
  const clipId = `${rawId.replace(/:/g, "")}-research-liquid`;

  return (
    <svg
      {...props}
      className={["research-motion-icon", className].filter(Boolean).join(" ")}
      width={size}
      height={size}
      viewBox="8 4 48 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M26 12v17L13.6 52.4C12.4 54.6 14 57 16.5 57h31c2.5 0 4.1-2.4 2.9-4.6L38 29V12H26Z" />
        </clipPath>
      </defs>
      <g className="research-liquid-clip" clipPath={`url(#${clipId})`}>
        <path
          className="research-liquid"
          d="M8 41.5C16.4 37.7 23.8 46.7 31.4 42.2C39.2 37.6 46.3 39.6 56 44.2V66H8V41.5Z"
        />
        <circle
          className="research-bubble"
          cx="33"
          cy="38.5"
          r="2"
        />
      </g>
      <g
        className="research-beaker-shell"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <path d="M24 8h16" />
        <path d="M27 8v20.3L13.6 52.4C12.4 54.6 14 57 16.5 57h31c2.5 0 4.1-2.4 2.9-4.6L37 28.3V8" />
        <path d="M21 47h22" />
      </g>
    </svg>
  );
}

function CeramicsIcon({
  className = "",
  size = 24,
  strokeWidth = 1.7,
  ...props
}) {
  return (
    <svg
      {...props}
      className={["ceramics-motion-icon", className].filter(Boolean).join(" ")}
      width={size}
      height={size}
      viewBox="8 0 48 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        className="ceramics-vase ceramics-vase-back"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path className="ceramics-vase-rim-back" d="M26.6 22C29.2 20.4 34.8 20.4 37.4 22C34.8 23.3 29.2 23.3 26.6 22Z" />
      </g>
      <g
        className="ceramics-flower"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth * 0.88}
      >
        <path className="ceramics-flower-stem" d="M32 -0.2C31.4 6.2 31.4 14.2 32 21.8" />
        <path className="ceramics-flower-leaf" d="M31.9 8.9C28 6.3 24.9 6.8 23.1 9.8C26.4 11.6 29.3 11.5 31.9 8.9Z" />
        <path className="ceramics-flower-leaf" d="M32.2 9.8C35.7 7.1 38.5 7.5 40.5 10.2C37.6 12 34.8 11.9 32.2 9.8Z" />
        <path className="ceramics-flower-petal" d="M32 -1C29.8 -4 30.6 -6.4 32 -7.7C33.4 -6.4 34.2 -4 32 -1Z" />
        <path className="ceramics-flower-petal" d="M32 -1C28.5 -2 27.2 -4.1 27.4 -6.1C29.4 -5.9 31.2 -4.5 32 -1Z" />
        <path className="ceramics-flower-petal" d="M32 -1C35.5 -2 36.8 -4.1 36.6 -6.1C34.6 -5.9 32.8 -4.5 32 -1Z" />
        <circle className="ceramics-flower-center" cx="32" cy="-0.8" r="1.2" />
      </g>
      <g
        className="ceramics-vase ceramics-vase-front"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path className="ceramics-vase-fill" d="M28.3 23.4C28.9 29.8 28.4 34.8 24 39C16.3 46.1 16 56.4 25.5 60C29.7 61.6 34.5 61.6 38.5 60C48 56.4 47.7 46.1 40 39C35.6 34.8 35.1 29.8 35.7 23.4C33.7 24.4 30.3 24.4 28.3 23.4Z" />
        <path className="ceramics-vase-lip-fill" d="M26.6 22C29.2 23.6 34.8 23.6 37.4 22C36.5 24.3 27.5 24.3 26.6 22Z" />
        <path className="ceramics-vase-rim-front" d="M37.4 22C34.8 23.6 29.2 23.6 26.6 22" />
        <path className="ceramics-vase-neck" d="M28.6 23.6C29.2 29.9 28.5 35 24 39" />
        <path className="ceramics-vase-neck" d="M35.4 23.6C34.8 29.9 35.5 35 40 39" />
        <path className="ceramics-vase-body" d="M24 39C16.3 46.1 16 56.4 25.5 60C29.7 61.6 34.5 61.6 38.5 60C48 56.4 47.7 46.1 40 39" />
        <path className="ceramics-vase-foot" d="M25.8 59.8C25.4 61.2 23.6 61.4 22.7 62.2C27.2 63 36.8 63 41.3 62.2C40.4 61.4 38.6 61.2 38.2 59.8" />
      </g>
    </svg>
  );
}

function PhotographyIcon({
  className = "",
  size = 24,
  strokeWidth = 1.7,
  ...props
}) {
  return (
    <svg
      {...props}
      className={["photography-motion-icon", className]
        .filter(Boolean)
        .join(" ")}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        className="photography-camera-shell"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <rect
          className="photography-shutter-button"
          x="15"
          y="18"
          width="7"
          height="7"
          rx="1.4"
        />
        <path
          className="photography-camera-mask"
          d="M15 25h9l4-6h9l4 6h8c3 0 5 2 5 5v20c0 3-2 5-5 5H15c-3 0-5-2-5-5V30c0-3 2-5 5-5Z"
        />
        <path
          className="photography-camera-body"
          d="M15 25h9l4-6h9l4 6h8c3 0 5 2 5 5v20c0 3-2 5-5 5H15c-3 0-5-2-5-5V30c0-3 2-5 5-5Z"
        />
        <rect
          className="photography-flash-bulb"
          x="43"
          y="28"
          width="6"
          height="5"
          rx="1.5"
        />
        <circle className="photography-lens" cx="32" cy="40" r="10" />
        <circle className="photography-lens-core" cx="32" cy="40" r="3.7" />
      </g>
      <path
        className="photography-flash"
        d="M46 20.5L48 26.4L54 28.4L48 30.5L46 36.5L44 30.5L38 28.4L44 26.4L46 20.5Z"
      />
    </svg>
  );
}

function TravelIcon({
  className = "",
  size = 24,
  strokeWidth = 1.7,
  ...props
}) {
  return (
    <svg
      {...props}
      className={["travel-motion-icon", className].filter(Boolean).join(" ")}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        className="travel-runway"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <path className="travel-runway-line" d="M6 52H58" />
      </g>
      <g
        className="travel-plane"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <path
          className="travel-plane-outline"
          d="M12.5 37C14.2 37.1 16.4 38.2 20 40H47C52 40 56 38.6 56 36.2C56 34.3 52.9 33.5 48.5 33.5H37L25.4 23H20L27 33.5H18.2L13.2 29H8.8C9.4 32.3 10.8 35.4 12.5 37Z"
        />

      </g>
    </svg>
  );
}

function PlaceholderPage({ section }) {
  const { Icon } = section;

  return (
    <section className="placeholder-page" aria-labelledby={`${section.title}-title`}>
      <div className="placeholder-hero">
        <div className="placeholder-title">
          <Icon size={34} strokeWidth={1.4} />
          <h1 id={`${section.title}-title`}>{section.title}</h1>
        </div>
        <p>{section.description}</p>
        <NavLink to="/" className="text-link">
          <Home size={18} strokeWidth={1.7} aria-hidden="true" />
          Back home
        </NavLink>
      </div>
    </section>
  );
}

export default App;
