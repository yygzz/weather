import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageBackground } from '@/components/ui/PageBackground';

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>Test Content</GlassCard>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});

describe('PageBackground', () => {
  it('renders without crashing', () => {
    render(<PageBackground />);
    expect(document.querySelector('.fixed')).toBeInTheDocument();
  });
});
