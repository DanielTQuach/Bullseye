const FORMSPREE = import.meta.env.VITE_FORMSPREE_ACTION

export function WaitlistForm() {
  if (!FORMSPREE) {
    return (
      <p className="cta__waitlist-fallback">
        Set <code className="cta__code">VITE_FORMSPREE_ACTION</code> to your
        Formspree endpoint to collect emails on deploy. Until then, use{' '}
        <a href="mailto:hello@bullseye.ai">email</a>.
      </p>
    )
  }

  return (
    <form
      className="waitlist"
      action={FORMSPREE}
      method="POST"
    >
      <label className="visually-hidden" htmlFor="waitlist-email">
        Email
      </label>
      <input
        id="waitlist-email"
        className="waitlist__input"
        type="email"
        name="email"
        required
        placeholder="you@company.com"
        autoComplete="email"
      />
      <input type="hidden" name="_subject" value="Bullseye waitlist" />
      <button type="submit" className="btn btn--secondary">
        Join waitlist
      </button>
    </form>
  )
}
