import React from 'react';
import { render, screen } from '@testing-library/react';
import { Logo } from '@/components/Logo';

describe('Logo', () => {
  it('renders an SVG element', () => {
    const { container } = render(<Logo data-testid="logo" />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has aria-hidden attribute for accessibility', () => {
    const { container } = render(<Logo />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('has correct viewBox dimensions', () => {
    const { container } = render(<Logo />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 109 40');
  });

  it('forwards additional props to SVG', () => {
    const { container } = render(
      <Logo className="custom-logo" width={120} height={50} />
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-logo');
    expect(svg).toHaveAttribute('width', '120');
    expect(svg).toHaveAttribute('height', '50');
  });

  it('renders all path elements', () => {
    const { container } = render(<Logo />);

    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('applies custom style prop', () => {
    const { container } = render(
      <Logo style={{ display: 'block', margin: '0 auto' }} />
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveStyle({ display: 'block', margin: '0 auto' });
  });

  it('accepts data attributes', () => {
    const { container } = render(
      <Logo data-testid="brand-logo" data-version="1.0" />
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('data-testid', 'brand-logo');
    expect(svg).toHaveAttribute('data-version', '1.0');
  });
});
