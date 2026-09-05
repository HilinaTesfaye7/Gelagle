import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  phase: string;
  description: string;
  highlights: string[];
  onReturnHome: () => void;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  title,
  phase = 'Phase 2',
  description,
  highlights,
  onReturnHome
}) => {
  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '4rem auto 0' }}>
      <div className="glass-card" style={{ padding: '3rem 2.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-full)', color: 'var(--primary-light)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          <Sparkles size={14} />
          <span>Scheduled for {phase}</span>
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{title}</h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto 2rem' }}>
          {description}
        </p>

        <div style={{ textAlign: 'left', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Planned Capabilities in {phase}
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {highlights.map((h, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary-light)' }} />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <button className="btn btn-secondary" onClick={onReturnHome}>
          <span>Return to Dashboard</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
