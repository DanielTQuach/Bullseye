import { useMemo, useState, type MouseEvent } from 'react'

/** Inbox for waitlist signups — change this to your address. */
const WAITLIST_EMAIL = 'hello@bullseye.ai'

export function WaitlistForm() {
  const [email, setEmail] = useState('')

  const mailtoHref = useMemo(() => {
    const params = new URLSearchParams()
    params.set('subject', 'Bullseye waitlist')
    const body = email.trim()
      ? `Please add me to the waitlist: ${email.trim()}`
      : 'Please add me to the Bullseye waitlist.'
    params.set('body', body)
    return `mailto:${WAITLIST_EMAIL}?${params.toString()}`
  }, [email])

  const onJoinClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById('waitlist-email') as HTMLInputElement | null
    if (el && !el.checkValidity()) {
      e.preventDefault()
      el.reportValidity()
    }
  }

  return (
    <div className="waitlist">
      <label className="visually-hidden" htmlFor="waitlist-email">
        Email
      </label>
      <input
        id="waitlist-email"
        className="waitlist__input"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="you@company.com"
        autoComplete="email"
      />
      <a
        href={mailtoHref}
        className="btn btn--secondary"
        onClick={onJoinClick}
      >
        Join waitlist
      </a>
    </div>
  )
}
