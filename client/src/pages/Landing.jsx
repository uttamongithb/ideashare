import React, { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'

import videoOnly from '../assets/Kids_Innovative_Ideas_Video_Generated.mp4'

export default function Landing(){
  const heroRef = useRef(null)

  useEffect(()=>{
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current.querySelectorAll('.lp-badge, .lp-title, .lp-ctas'),
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.14, duration: 1.2, ease: 'power3.out' }
      )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const [isLogged, setIsLogged] = useState(false)
  useEffect(() => {
    try {
      setIsLogged(!!localStorage.getItem('token'))
    } catch (e) {
      setIsLogged(false)
    }
  }, [])

  return (
    <div className="landing-root">
      <main className="hero-landing container" ref={heroRef}>
        <section className="hero-left">
          <div className="lp-badge font-spot font-bold text-[18px]">Ideas • Teams • Creators</div>
          <h1 className="lp-title font-rethink font-semibold">Turn sparks into ship-ready ideas.</h1>
          <p className="lp-sub">Share short idea drafts, get instant feedback, and build together.</p>
          <div className="lp-ctas">
            {!isLogged && <Link to="/signup" className="btn-primary">Get Started</Link>}
            <Link to="/explore" className="btn-ghost">Explore ideas</Link>
          </div>
        </section>

        <section className="hero-right">
          <div className="image-collage single-video">
            <div className="img-wrap card">
              <video src={videoOnly} autoPlay muted loop playsInline playsinline />
            </div>
          </div>
        </section>
      </main>

      <section className="features-expanded container">
        <h2 className="section-heading font-rethink">Everything you need to move an idea forward</h2>
        <div className="features-grid-expanded">
          <div className="feature-card">
            <h3 className="font-rethink">Share ideas</h3>
            <p>Post quick idea drafts with tags and short descriptions so others can build on them.</p>
          </div>
          <div className="feature-card">
            <h3 className="font-rethink">Realtime feedback</h3>
            <p>Likes and comments update instantly across collaborators so teams can iterate fast.</p>
          </div>
          <div className="feature-card">
            <h3 className="font-rethink">Discover & explore</h3>
            <p>Search, filter and find ideas that match your interests and skill set.</p>
          </div>
        </div>
      </section>

      

      <section className="how-section container">
        <div className="how-left">
          <h3 className="font-rethink">How it works</h3>
          <ol>
            <li>Quickly jot an idea with a title and short context.</li>
            <li>Share and gather feedback with likes and comments.</li>
            <li>Iterate and turn ideas into projects with collaborators.</li>
          </ol>
          <div className="lp-ctas" style={{marginTop:18}}>
            {!isLogged && <Link to="/signup" className="btn-primary">Get Started</Link>}
            <Link to="/explore" className="btn-ghost">Explore ideas</Link>
          </div>
        </div>
        <div className="how-right">
          <div className="testimonial-card">
            “This app helped our team surface the best ideas in hours — not days.”
            <cite>- Product Team, Acme</cite>
          </div>
        </div>
      </section>

      <section className="cert-section container">
        <div className="cert-left">© 2025 IdeaShare — Built with ❤️ by Uttam</div>
        <div className="cert-right">
          <a href="https://www.instagram.com/uttamoninsta/" target="_blank" rel="noopener noreferrer" className="social-link">Instagram</a>
          <a href="https://x.com/uttamonx" target="_blank" rel="noopener noreferrer" className="social-link">X</a>
          <a href="https://www.linkedin.com/in/uttam-kb/" target="_blank" rel="noopener noreferrer" className="social-link">LinkedIn</a>
          <a href="https://github.com/uttamongithb/" target="_blank" rel="noopener noreferrer" className="social-link">GitHub</a>
        </div>
      </section>
    </div>
  )
}
