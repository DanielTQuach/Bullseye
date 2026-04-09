import { useEffect, useState } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { TryRouter } from './components/TryRouter'
import { WaitlistForm } from './components/WaitlistForm'
import './App.css'

const ease = [0.16, 1, 0.3, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
}

const stagger = {
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const brands = [
  'OpenAI',
  'Anthropic',
  'Google',
  'Meta',
  'Mistral',
  'Cohere',
  'xAI',
  'Amazon',
  'IBM',
  'DeepSeek',
]

/** Concentric bullseye: teal + white (on-brand); reads as “target” without classic red. */
function LogoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" fill="#f0fdfa" />
      <circle cx="12" cy="12" r="8" fill="#0f766e" />
      <circle cx="12" cy="12" r="6" fill="#f0fdfa" />
      <circle cx="12" cy="12" r="4" fill="#14b8a6" />
      <circle cx="12" cy="12" r="2.25" fill="#ffffff" />
    </svg>
  )
}

function FloatingOrbs({ reduced }: { reduced: boolean }) {
  if (reduced) return null
  return (
    <>
      <motion.div
        className="orb orb--teal"
        animate={{ y: [0, -18, 0], x: [0, 8, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="orb orb--emerald"
        animate={{ y: [0, 14, 0], x: [0, -10, 0] }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
      <motion.div
        className="orb orb--sky"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  )
}

export default function App() {
  const reducedMotion = useReducedMotion()
  const reduced = reducedMotion === true
  const [navSolid, setNavSolid] = useState(false)

  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 400], [0, reduced ? 0 : 48])

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navStyle = navSolid
    ? {
        background: 'rgba(5, 5, 8, 0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }
    : {
        background: 'transparent',
        backdropFilter: 'none',
        borderBottom: '1px solid transparent',
      }

  return (
    <div className="page">
      <div className="ambient" aria-hidden>
        <FloatingOrbs reduced={reduced} />
      </div>
      <div className="grain" aria-hidden />

      <motion.nav className="nav" style={navStyle}>
        <div className="nav__inner">
          <a className="nav__logo" href="#top">
            <span className="nav__logo-mark">
              <LogoIcon />
            </span>
            Bullseye
          </a>
          <div className="nav__links">
            <a href="#try">Try it</a>
            <a href="#product">Product</a>
            <a href="#impact">Impact</a>
            <a href="#features">Why Bullseye</a>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <a
              href="#cta"
              className="btn btn--secondary btn--sm nav__cta-secondary"
            >
              Talk to us
            </a>
            <a href="#try" className="btn btn--primary btn--sm">
              Try it
            </a>
          </div>
        </div>
      </motion.nav>

      <main id="top">
        <motion.section className="hero" style={{ y: heroY }}>
          <div className="content">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              style={{ textAlign: 'center' }}
            >
              <motion.div variants={fadeUp}>
                <span className="pill">
                  <span className="pill__dot" />
                  Live demo · scores 10 models in-browser
                </span>
              </motion.div>
              <motion.h1 className="display" variants={fadeUp}>
                The right LLM,
                <br />
                <em>on the first try.</em>
              </motion.h1>
              <motion.p className="lede" variants={fadeUp}>
                Bullseye scores every viable model against your task—latency,
                quality, cost, and footprint—then routes to the single best
                option. Stop burning tokens running the same prompt everywhere.
              </motion.p>
              <motion.div className="hero__actions" variants={fadeUp}>
                <a href="#try" className="btn btn--primary">
                  Try the router
                </a>
                <a href="#product" className="btn btn--secondary">
                  See how it works
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              className="mock-wrap"
              initial={{
                opacity: 0,
                y: reduced ? 12 : 32,
                rotateX: reduced ? 0 : 8,
              }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: reduced ? 0.35 : 0.9, ease, delay: 0.15 }}
            >
              <div className="mock" id="product">
                <div className="mock__chrome">
                  <div className="mock__dots" aria-hidden>
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="mock__url">app.bullseye.ai / route</div>
                </div>
                <div className="mock__body">
                  <div className="mock__panel">
                    <div className="mock__label">Incoming prompt</div>
                    <p className="mock__prompt">
                      Refactor this React hook for fewer re-renders and add
                      error boundaries. Keep bundle size flat.
                    </p>
                  </div>
                  <div className="mock__panel">
                    <div className="mock__label">Bullseye selection</div>
                    <div className="mock__result">
                      <span className="mock__model-name">Claude 3.7 Sonnet</span>
                      <span className="mock__badge">Best fit · 0.94</span>
                    </div>
                    <div className="mock__stats">
                      <div className="mock__stat">
                        <strong>−62%</strong>
                        vs. multi-run
                        <br />
                        est. cost
                      </div>
                      <div className="mock__stat">
                        <strong>−48%</strong>
                        energy
                      </div>
                      <div className="mock__stat">
                        <strong>−51%</strong>
                        water equiv.
                      </div>
                    </div>
                    <p className="mock__fineprint">
                      Illustrative UI — not live metering
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <section className="marquee-section" aria-label="Model providers">
          <div className="content">
            <p className="marquee-label">Works across major providers</p>
            <div className="marquee">
              <div className="marquee__track">
                {[...brands, ...brands].map((name, i) => (
                  <span key={`${name}-${i}`} className="marquee__item">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <TryRouter />

        <section id="features" className="content">
          <motion.div
            className="section-head"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <h2>Precision routing, not guesswork</h2>
            <p>
              A single evaluation pass compares models on what matters for your
              workload—so you skip the wasteful “spray and pray” loop.
            </p>
          </motion.div>

          <motion.div
            className="bento"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            <motion.article
              className="bento__card bento__card--wide"
              variants={fadeUp}
            >
              <div className="bento__icon">◎</div>
              <h3>One decision, every viable model</h3>
              <p>
                Bullseye maintains a live registry of API-available models with
                capability tags, pricing tiers, and environmental factors—then
                scores them for your specific prompt class.
              </p>
            </motion.article>
            <motion.article
              className="bento__card bento__card--tall"
              variants={fadeUp}
            >
              <div className="bento__icon bento__icon--emerald">◇</div>
              <h3>Compared to multi-model runs</h3>
              <p>
                Running N models for every task multiplies cost, energy, and
                cooling water footprint. Routing once collapses that waste while
                preserving quality where it counts.
              </p>
            </motion.article>
            <motion.article
              className="bento__card bento__card--half"
              variants={fadeUp}
            >
              <div className="bento__icon bento__icon--sky">↗</div>
              <h3>Metrics you can stand behind</h3>
              <p>
                Estimated spend, kWh, and liters H₂O equivalent—reported per
                route so finance and sustainability teams get the same story.
              </p>
            </motion.article>
            <motion.article
              className="bento__card bento__card--half"
              variants={fadeUp}
            >
              <div className="bento__icon">⚡</div>
              <h3>Latency-aware</h3>
              <p>
                When speed wins, Bullseye can bias toward edge-fast models; when
                accuracy wins, it goes deep—without you micromanaging per call.
              </p>
            </motion.article>
            <motion.article
              className="bento__card bento__card--third"
              variants={fadeUp}
            >
              <h3>Drop-in API</h3>
              <p>
                One endpoint replaces scattered provider integrations for the
                routing layer.
              </p>
            </motion.article>
            <motion.article
              className="bento__card bento__card--third"
              variants={fadeUp}
            >
              <h3>Audit trail</h3>
              <p>
                Every choice is logged with inputs to the scorer for compliance
                and debugging.
              </p>
            </motion.article>
            <motion.article
              className="bento__card bento__card--third"
              variants={fadeUp}
            >
              <h3>Private eval</h3>
              <p>
                Optional on-prem calibration so your data never leaves your
                boundary.
              </p>
            </motion.article>
          </motion.div>
        </section>

        <section id="impact" className="metrics">
          <div className="content">
            <motion.div
              className="section-head"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
            >
              <h2>Impact you could measure</h2>
              <p>
                The numbers below are <strong>marketing examples</strong>, not live
                measurements. Real dashboards need your token counts, provider
                prices, and (for footprint) published intensity factors—still models,
                not household water meters.
              </p>
            </motion.div>
            <motion.div
              className="metrics__grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={stagger}
            >
              {[
                {
                  value: '62',
                  suffix: '%',
                  label: 'Lower est. cost',
                  hint: 'Example scenario—not pulled from your API usage.',
                },
                {
                  value: '48',
                  suffix: '%',
                  label: 'Less energy',
                  hint: 'Example only—would tie to indices or grid + token math.',
                },
                {
                  value: '51',
                  suffix: '%',
                  label: 'Water saved',
                  hint: 'Example only—real claims need provider LCAs + your usage.',
                },
                {
                  value: '1',
                  suffix: '×',
                  label: 'Single hop',
                  hint: 'One scored decision per request—no retry grid.',
                },
              ].map((m) => (
                <motion.article
                  key={m.label}
                  className="metric-card"
                  variants={fadeUp}
                >
                  <div className="metric-card__value">
                    {m.value}
                    <span className="suffix">{m.suffix}</span>
                  </div>
                  <div className="metric-card__label">{m.label}</div>
                  <p className="metric-card__hint">{m.hint}</p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="cta" id="cta">
          <div className="content">
            <motion.div
              className="cta__box"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
            >
              <h2>Ship the right model, every time</h2>
              <p>
                We’re onboarding design partners who want intelligent routing
                without the overhead of multi-vendor trial runs.
              </p>
              <WaitlistForm />
              <div className="cta__actions">
                <a href="mailto:hello@bullseye.ai" className="btn btn--primary">
                  Request access
                </a>
                <a href="#top" className="btn btn--secondary">
                  Back to top
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          Built by Daniel Quach (2026) ·{' '}
          <a
            href="https://github.com/DanielTQuach/Bullseye"
            target="_blank"
            rel="noreferrer"
          >
            Source code on GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}
