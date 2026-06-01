import { useEffect, useId, useRef, useState } from "react";
import {
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Matter from "matter-js";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Github,
  Home,
  Instagram,
  Linkedin,
  Mail,
} from "lucide-react";

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

const shevyaSocialLinks = [
  {
    label: "Shevya on LinkedIn",
    href: "https://linkedin.com/in/shevya",
    Icon: Linkedin,
  },
  {
    label: "Shevya on Instagram",
    href: "https://instagram.com/036.panda",
    Icon: Instagram,
  },
  {
    label: "Email Shevya",
    href: "mailto:spanda7@jh.edu",
    Icon: Mail,
  },
];

const creditLinks = [
  {
    label: "Bay Wiggins on LinkedIn",
    href: "https://linkedin.com/in/bayw",
    Icon: Linkedin,
  },
  {
    label: "Bay Wiggins on GitHub",
    href: "https://github.com/baywiggins",
    Icon: Github,
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
  const navigate = useNavigate();
  const [routeTransition, setRouteTransition] = useState(null);
  const routeTransitionTimeoutsRef = useRef([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      routeTransitionTimeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId),
      );
    };
  }, []);

  const startRouteTransition = ({ path, rect, title }) => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || !rect) {
      navigate(path);
      return;
    }

    routeTransitionTimeoutsRef.current.forEach((timeoutId) =>
      window.clearTimeout(timeoutId),
    );
    routeTransitionTimeoutsRef.current = [];

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const startCenterX = rect.left + rect.width / 2;
    const fallDrift = Math.max(
      -36,
      Math.min(36, (viewportWidth / 2 - startCenterX) * 0.05),
    );
    const fallLeft = rect.left + fallDrift;
    const fallTop = viewportHeight / 2 - rect.height / 2;
    const fallCenterX = fallLeft + rect.width / 2;
    const fallCenterY = fallTop + rect.height / 2;
    const coverRadius = Math.max(
      Math.hypot(fallCenterX, fallCenterY),
      Math.hypot(viewportWidth - fallCenterX, fallCenterY),
      Math.hypot(fallCenterX, viewportHeight - fallCenterY),
      Math.hypot(viewportWidth - fallCenterX, viewportHeight - fallCenterY),
    );
    const coverSize = Math.ceil(coverRadius * 2.16);
    const transition = {
      coverSize,
      fallLeft,
      fallTop,
      key: `${path}-${Date.now()}`,
      path,
      phase: "drop",
      rect,
      sectionId: title.toLowerCase(),
      title,
      viewportHeight,
      viewportWidth,
    };

    window.scrollTo({ top: 0, behavior: "auto" });
    setRouteTransition(transition);

    routeTransitionTimeoutsRef.current = [
      window.setTimeout(() => {
        setRouteTransition((currentTransition) =>
          currentTransition
            ? { ...currentTransition, phase: "expand" }
            : currentTransition,
        );
      }, 760),
      window.setTimeout(() => {
        navigate(path);
        window.scrollTo({ top: 0, behavior: "auto" });
      }, 1500),
      window.setTimeout(() => {
        setRouteTransition((currentTransition) =>
          currentTransition
            ? { ...currentTransition, phase: "fade" }
            : currentTransition,
        );
      }, 1620),
      window.setTimeout(() => {
        setRouteTransition(null);
        routeTransitionTimeoutsRef.current = [];
      }, 2100),
    ];
  };

  return (
    <div
      className={[
        "site-shell",
        routeTransition ? "site-shell-route-transitioning" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <main className="page-frame">
        <Routes>
          <Route
            path="/"
            element={<HomePage onPageLinkClick={startRouteTransition} />}
          />
          {sections.map((section) => (
            <Route
              key={section.path}
              path={section.path}
              element={
                section.id === "ceramics" ? (
                  <CeramicsPage section={section} />
                ) : (
                  <PlaceholderPage section={section} />
                )
              }
            />
          ))}
        </Routes>
      </main>
      <RouteTransitionOverlay transition={routeTransition} />
    </div>
  );
}

function RouteTransitionOverlay({ transition }) {
  if (!transition) {
    return null;
  }

  const { coverSize, fallLeft, fallTop, phase, rect, sectionId, title } =
    transition;
  const coverLeft = fallLeft + rect.width / 2 - coverSize / 2;
  const coverTop = fallTop + rect.height / 2 - coverSize / 2;

  return (
    <div
      key={transition.key}
      className={[
        "route-transition-overlay",
        `route-transition-overlay-${phase}`,
        `route-transition-section-${sectionId}`,
      ].join(" ")}
      aria-hidden="true"
      style={{
        "--cover-left": `${coverLeft}px`,
        "--cover-size": `${coverSize}px`,
        "--cover-top": `${coverTop}px`,
        "--fall-left": `${fallLeft}px`,
        "--fall-top": `${fallTop}px`,
        "--start-height": `${rect.height}px`,
        "--start-left": `${rect.left}px`,
        "--start-top": `${rect.top}px`,
        "--start-width": `${rect.width}px`,
      }}
    >
      <div className="route-transition-orb">
        <span>{title}</span>
      </div>
    </div>
  );
}

function HomePage({ onPageLinkClick }) {
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
        <FloatingPageLinks items={sections} onNavigate={onPageLinkClick} />

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
            <SocialIconLinks
              className="profile-socials"
              links={shevyaSocialLinks}
            />
          </div>
        </div>

        <MadeByCredit />

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

function SocialIconLinks({ className = "", iconSize = 20, links }) {
  return (
    <nav
      className={["icon-link-row", className].filter(Boolean).join(" ")}
      aria-label="Social links"
    >
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          className="icon-link"
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
        >
          <Icon size={iconSize} strokeWidth={1.8} aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}

function MadeByCredit() {
  return (
    <div className="site-credit">
      <span>
        made with ❤︎⁠ by bay wiggins
      </span>
      <SocialIconLinks
        className="site-credit-links"
        iconSize={17}
        links={creditLinks}
      />
    </div>
  );
}

function FloatingPageLinks({ items, onNavigate }) {
  const [detachedLinkId, setDetachedLinkId] = useState("");
  const fieldRef = useRef(null);
  const linkRefs = useRef([]);
  const ropeRefs = useRef([]);

  useEffect(() => {
    const field = fieldRef.current;

    if (!field) {
      return undefined;
    }

    const { Bodies, Body, Composite, Constraint, Engine } = Matter;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const engine = Engine.create();
    const particles = [];
    let animationFrame = 0;
    let lastFrameTime = performance.now();
    let lastWindow = {
      height: window.innerHeight,
      screenX: window.screenX || 0,
      screenY: window.screenY || 0,
      width: window.innerWidth,
    };

    engine.gravity.y = 1.36;
    engine.gravity.scale = 0.00155;

    const createRopePath = (points) => {
      if (points.length < 2) {
        return "";
      }

      let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

      for (let index = 1; index < points.length - 1; index += 1) {
        const current = points[index];
        const next = points[index + 1];
        const midX = (current.x + next.x) / 2;
        const midY = (current.y + next.y) / 2;
        path += ` Q ${current.x.toFixed(1)} ${current.y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
      }

      const last = points[points.length - 1];
      path += ` T ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
      return path;
    };

    const measure = () => {
      const fieldRect = field.getBoundingClientRect();
      const laneWidth = fieldRect.width / items.length;
      const isCompact = fieldRect.width < 640;
      let shouldRebuild = particles.length !== items.length;

      items.forEach((_, index) => {
        const orbSize = isCompact ? 94 : 118;
        const ropeLength = isCompact
          ? 78 + (index % 2) * 9
          : 116 + (index % 2) * 12;
        const segmentCount = isCompact ? 6 : 7;
        const segmentLength = ropeLength / (segmentCount + 1);
        const anchor = {
          x: laneWidth * (index + 0.5),
          y: isCompact ? -7 : -14,
        };
        const previous = particles[index];

        if (
          previous &&
          (previous.orbSize !== orbSize ||
            previous.segmentCount !== segmentCount)
        ) {
          shouldRebuild = true;
        }

        if (previous) {
          previous.anchor = anchor;
          previous.orbSize = orbSize;
          previous.ropeLength = ropeLength;
          previous.segmentCount = segmentCount;
          previous.segmentLength = segmentLength;

          previous.constraints.forEach((constraint, constraintIndex) => {
            if (constraintIndex === 0) {
              constraint.pointA = anchor;
            }

            if (constraintIndex === previous.constraints.length - 1) {
              constraint.length = ropeLength + orbSize * 0.56;
            } else if (constraintIndex === previous.constraints.length - 2) {
              constraint.length = segmentLength + orbSize * 0.48;
            } else {
              constraint.length = segmentLength;
            }
          });
        }
      });

      if (shouldRebuild) {
        Composite.clear(engine.world, false);
        particles.length = 0;

        items.forEach((_, index) => {
          const orbSize = isCompact ? 94 : 118;
          const radius = orbSize / 2;
          const ropeLength = isCompact
            ? 78 + (index % 2) * 9
            : 116 + (index % 2) * 12;
          const segmentCount = isCompact ? 6 : 7;
          const segmentLength = ropeLength / (segmentCount + 1);
          const anchor = {
            x: laneWidth * (index + 0.5),
            y: isCompact ? -7 : -14,
          };
          const startSide = index % 2 === 0 ? -1 : 1;
          const collisionGroup = -1 - index;
          const ropeBodies = Array.from({ length: segmentCount }, (_, nodeIndex) =>
            Bodies.circle(
              anchor.x + startSide * randomBetween(12, 34),
              anchor.y + segmentLength * (nodeIndex + 1) - randomBetween(90, 150),
              3.2,
              {
                collisionFilter: { group: collisionGroup },
                density: 0.00055,
                frictionAir: 0.044,
                isSensor: true,
              },
            ),
          );
          const body = Bodies.circle(
            anchor.x + startSide * randomBetween(30, 68),
            anchor.y + ropeLength + radius - randomBetween(135, 200),
            radius,
            {
              collisionFilter: { group: collisionGroup },
              density: 0.0019,
              frictionAir: 0.048,
              restitution: 0.28,
            },
          );

          const constraints = [
            Constraint.create({
              bodyB: ropeBodies[0],
              damping: 0.18,
              length: segmentLength,
              pointA: anchor,
              stiffness: 0.42,
            }),
          ];

          ropeBodies.slice(1).forEach((ropeBody, nodeIndex) => {
            constraints.push(
              Constraint.create({
                bodyA: ropeBodies[nodeIndex],
                bodyB: ropeBody,
                damping: 0.16,
                length: segmentLength,
                stiffness: 0.4,
              }),
            );
          });

          constraints.push(
            Constraint.create({
              bodyA: ropeBodies[ropeBodies.length - 1],
              bodyB: body,
              damping: 0.16,
              length: segmentLength + orbSize * 0.48,
              stiffness: 0.38,
            }),
          );

          const driftConstraint = Constraint.create({
            bodyB: body,
            damping: 0.075,
            length: ropeLength + orbSize * 0.56,
            pointA: anchor,
            stiffness: 0.04,
          });
          constraints.push(driftConstraint);

          Body.setVelocity(body, {
            x: startSide * randomBetween(1.1, 2),
            y: randomBetween(0.9, 1.6),
          });

          particles[index] = {
            anchor,
            body,
            constraints,
            orbSize,
            ropeBodies,
            ropeLength,
            segmentCount,
            segmentLength,
          };

          Composite.add(engine.world, [body, ...ropeBodies, ...constraints]);
        });
      }
    };

    const render = () => {
      particles.forEach((particle, index) => {
        const link = linkRefs.current[index];
        const rope = ropeRefs.current[index];

        if (!link || !rope) {
          return;
        }

        const { anchor, body, orbSize, ropeBodies } = particle;
        const finalNode = ropeBodies[ropeBodies.length - 1];
        const dx = body.position.x - finalNode.position.x;
        const dy = body.position.y - finalNode.position.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const attachRadius = orbSize * 0.48;
        const attachPoint = {
          x: body.position.x - (dx / distance) * attachRadius,
          y: body.position.y - (dy / distance) * attachRadius,
        };
        const ropePoints = [
          anchor,
          ...ropeBodies.map((ropeBody) => ropeBody.position),
          attachPoint,
        ];
        const isDetached = link.dataset.detached === "true";

        link.style.setProperty("--orb-size", `${orbSize}px`);
        link.style.opacity = isDetached ? "0" : "1";
        link.style.transform = `translate3d(${body.position.x - orbSize / 2}px, ${body.position.y - orbSize / 2}px, 0) rotate(${body.angle * 0.36}rad)`;
        rope.setAttribute("d", createRopePath(ropePoints));
        rope.style.opacity = isDetached ? "0.28" : "1";
      });
    };

    const step = (time) => {
      const elapsed = Math.min(time - lastFrameTime, 34);
      lastFrameTime = time;

      const currentWindow = {
        height: window.innerHeight,
        screenX: window.screenX || 0,
        screenY: window.screenY || 0,
        width: window.innerWidth,
      };
      const movedX = currentWindow.screenX - lastWindow.screenX;
      const movedY = currentWindow.screenY - lastWindow.screenY;
      const resizedX = currentWindow.width - lastWindow.width;
      const resizedY = currentWindow.height - lastWindow.height;

      if (resizedX !== 0 || resizedY !== 0) {
        measure();
      }

      const impulseX = Math.max(-3.1, Math.min(3.1, movedX * -0.018 + resizedX * -0.011));
      const impulseY = Math.max(-2.8, Math.min(2.8, movedY * -0.014 + resizedY * -0.01));
      const hasWindowImpulse = Math.abs(impulseX) > 0.03 || Math.abs(impulseY) > 0.03;

      particles.forEach((particle, index) => {
        const { anchor, body, orbSize, ropeBodies, ropeLength } = particle;

        if (reducedMotion.matches) {
          ropeBodies.forEach((ropeBody, nodeIndex) => {
            Body.setPosition(ropeBody, {
              x: anchor.x,
              y: anchor.y + ((nodeIndex + 1) / (ropeBodies.length + 1)) * ropeLength,
            });
            Body.setVelocity(ropeBody, { x: 0, y: 0 });
          });
          Body.setPosition(body, {
            x: anchor.x,
            y: anchor.y + ropeLength + orbSize / 2,
          });
          Body.setVelocity(body, { x: 0, y: 0 });
          Body.setAngularVelocity(body, 0);
          return;
        }

        if (hasWindowImpulse) {
          ropeBodies.forEach((ropeBody, nodeIndex) => {
            Body.setVelocity(ropeBody, {
              x:
                ropeBody.velocity.x +
                impulseX * (0.16 + nodeIndex * 0.045),
              y: ropeBody.velocity.y + impulseY * 0.14,
            });
          });
          Body.setVelocity(body, {
            x: body.velocity.x + impulseX * (index % 2 === 0 ? 0.64 : 0.56),
            y: body.velocity.y + impulseY * 0.52,
          });
          Body.setAngularVelocity(
            body,
            body.angularVelocity + impulseX * 0.0035 * (index % 2 === 0 ? 1 : -1),
          );
        }

        const clampVelocity = (physicsBody, maxSpeed) => {
          const speed = Math.hypot(physicsBody.velocity.x, physicsBody.velocity.y);

          if (speed > maxSpeed) {
            const scale = maxSpeed / speed;
            Body.setVelocity(physicsBody, {
              x: physicsBody.velocity.x * scale,
              y: physicsBody.velocity.y * scale,
            });
          }
        };

        ropeBodies.forEach((ropeBody) => clampVelocity(ropeBody, 5.6));
        clampVelocity(body, 6.2);
      });

      if (!reducedMotion.matches) {
        Engine.update(engine, elapsed);
      }

      render();
      lastWindow = currentWindow;
      animationFrame = window.requestAnimationFrame(step);
    };

    measure();
    render();
    window.addEventListener("resize", measure);
    animationFrame = window.requestAnimationFrame(step);

    return () => {
      window.removeEventListener("resize", measure);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [items.length]);

  const handlePageLinkClick = (event, item, index) => {
    if (!onNavigate || detachedLinkId) {
      return;
    }

    const link = linkRefs.current[index];
    const orb = link?.querySelector(".hanging-link-orb");

    if (!orb) {
      return;
    }

    event.preventDefault();
    setDetachedLinkId(item.id);

    onNavigate({
      path: item.path,
      rect: orb.getBoundingClientRect(),
      title: item.title,
    });
  };

  return (
    <nav
      ref={fieldRef}
      className="floating-link-field"
      aria-label="Portfolio page links"
    >
      <svg
        className="hanging-rope-layer"
        aria-hidden="true"
        focusable="false"
      >
        {items.map((item, index) => (
          <path
            key={item.id}
            ref={(element) => {
              ropeRefs.current[index] = element;
            }}
            className={[
              "hanging-link-rope",
              `hanging-link-rope-${item.id}`,
              detachedLinkId === item.id ? "hanging-link-rope-detached" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </svg>
      {items.map((item, index) => (
        <NavLink
          key={item.id}
          to={item.path}
          ref={(element) => {
            linkRefs.current[index] = element;
          }}
          className={[
            "floating-page-link",
            `floating-page-link-${item.id}`,
            detachedLinkId === item.id ? "floating-page-link-detached" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          data-detached={detachedLinkId === item.id ? "true" : "false"}
          onClick={(event) => handlePageLinkClick(event, item, index)}
        >
          <span className="hanging-link-orb">
            <span className="floating-page-link-text">{item.title}</span>
          </span>
        </NavLink>
      ))}
    </nav>
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
    <section
      className={`placeholder-page route-page-${section.id}`}
      aria-labelledby={`${section.title}-title`}
    >
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

function CeramicsPage({ section }) {
  const { Icon } = section;
  const ceramicPieces = [
    "Moon jar study",
    "Handled cup study",
    "Bottle form study",
    "Low bowl study",
    "Small vase study",
    "Surface test study",
  ];

  return (
    <section
      className="ceramics-page route-page-ceramics"
      aria-labelledby="ceramics-page-title"
    >
      <header className="ceramics-page-header">
        <NavLink to="/" className="ceramics-home-link">
          <Home size={18} strokeWidth={1.7} aria-hidden="true" />
          Back home
        </NavLink>
        <div className="ceramics-header-copy">
          <Icon size={46} strokeWidth={1.35} aria-hidden="true" />
          <div>
            <h1 id="ceramics-page-title">Ceramics</h1>
            <p>
              A temporary wall of forms, glazes, and quiet objects while the
              real archive comes together.
            </p>
          </div>
        </div>
      </header>

      <div className="ceramics-gallery" aria-label="Ceramics preview images">
        {ceramicPieces.map((piece, index) => (
          <figure key={piece} className={`ceramics-preview ceramics-preview-${index + 1}`}>
            <div
              className="ceramics-preview-image"
              role="img"
              aria-label={piece}
            />
            <figcaption>{piece}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export default App;
