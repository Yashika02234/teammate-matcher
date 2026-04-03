import { Link } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Gradients */}
        <div style={{
          position: 'absolute', top: '-10%', left: '20%', width: '40vw', height: '40vw', 
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: -1
        }} />
        <div style={{
          position: 'absolute', top: '20%', right: '10%', width: '30vw', height: '30vw', 
          background: 'radial-gradient(circle, rgba(255, 0, 127, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: -1
        }} />

        <div className="animate-fade-in-up" style={{ maxWidth: '800px', zIndex: 1 }}>
          <h1 style={{ 
            fontSize: 'clamp(3rem, 8vw, 5rem)', 
            fontWeight: 800, 
            lineHeight: 1.05, 
            letterSpacing: '-0.04em',
            marginBottom: '24px' 
          }}>
            Find the perfect <br/>
            <span className="text-gradient">teammates & projects.</span>
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', 
            color: 'var(--text-secondary)',
            marginBottom: '48px',
            maxWidth: '600px',
            margin: '0 auto 48px'
          }}>
            SyncUp uses machine learning to match your skills, interests, and availability with the right people so you can build amazing things together.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth">
              <Button size="lg" variant="primary" style={{ padding: '16px 36px', fontSize: '1.1rem' }}>Get Started</Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="secondary" style={{ padding: '16px 36px', fontSize: '1.1rem' }}>Learn More</Button>
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '64px 24px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '8px' }}>10k+</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Students Matched</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '8px' }}>2.5k</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Projects Launched</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '8px' }}>98%</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" style={{ padding: '120px 24px', background: 'var(--bg-surface)' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span style={{ color: 'var(--accent-blue)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>The Process</span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '16px' }}>How it works</h2>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '32px' 
          }}>
            <FeatureCard 
              icon="⚡"
              title="Create your profile"
              desc="Tell us what you're good at, what you want to learn, and how you prefer to work."
            />
            <FeatureCard 
              icon="🤖"
              title="ML Powered Matching"
              desc="Our algorithm calculates cosine similarity and weighted scores to find the most complementary teammates."
            />
            <FeatureCard 
              icon="🚀"
              title="Build & Launch"
              desc="Post your project ideas, find those missing skillsets, and start collaborating instantly."
            />
          </div>
        </div>
      </section>

      {/* Testimonials / Benefits */}
      <section style={{ padding: '120px 24px' }}>
        <div className="container" style={{ maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '64px' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '48px' }}>
             <div style={{ flex: '1 1 400px' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '24px' }}>Stop settling for random groups.</h2>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                  Whether it's a semester-long capstone, a 48-hour hackathon, or a weekend side hustle—having the right team is everything. SyncUp looks at your exact tech stack and timezone to prevent mismatched expectations.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-primary)' }}>
                  <li>✓ Find teammates with complementary skills</li>
                  <li>✓ Filter by availability and work style</li>
                  <li>✓ Discover high-quality open projects</li>
                </ul>
             </div>
             <div style={{ flex: '1 1 400px' }} className="glass-panel">
               <div style={{ padding: '32px' }}>
                 <p style={{ fontSize: '1.2rem', fontStyle: 'italic', marginBottom: '24px' }}>"SyncUp completely changed how I approach hackathons. Instead of scrambling to find a backend dev on Discord, I was instantly matched with a perfect partner. We won first place!"</p>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-gradient)' }} />
                   <div>
                     <div style={{ fontWeight: 600 }}>Sarah Jenkins</div>
                     <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>CS Major, Class of '25</div>
                   </div>
                 </div>
               </div>
             </div>
          </div>

        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: '120px 24px', background: 'radial-gradient(circle at center, rgba(138, 43, 226, 0.2) 0%, var(--bg-surface) 100%)', textAlign: 'center' }}>
         <div className="container" style={{ maxWidth: '600px' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '24px', letterSpacing: '-0.02em' }}>Ready to build?</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '48px' }}>Join thousands of students turning ideas into reality.</p>
            <Link to="/auth">
               <Button size="lg" variant="primary" style={{ padding: '18px 48px', fontSize: '1.2rem' }}>Create Free Account</Button>
            </Link>
         </div>
      </section>
      
      {/* Footer */}
      <footer style={{ padding: '48px 24px', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <div style={{ width: '24px', height: '24px', background: 'var(--accent-gradient)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 800, fontSize: '12px' }}>S</div>
               <span style={{ fontWeight: 600 }}>SyncUp</span>
            </div>
            <p>© {new Date().getFullYear()} SyncUp Platform. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '24px' }}>
               <a href="#" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Privacy</a>
               <a href="#" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Terms</a>
            </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="glass-panel" style={{ padding: '32px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: 'var(--shadow-md)', transition: 'all var(--transition-smooth)' }} onMouseOver={e => e.currentTarget.style.boxShadow = 'var(--shadow-glow)'} onMouseOut={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}>
      <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}
