import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock Container
jest.mock('@/components/Container', () => ({
  Container: ({ children }: any) => <div>{children}</div>,
}));

// Mock Logo
jest.mock('@/components/Logo', () => ({
  Logo: (props: any) => <div data-testid="logo" {...props}>Logo</div>,
}));

// Mock NavLink
jest.mock('@/components/NavLink', () => ({
  NavLink: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

describe('Footer', () => {
  it('renders the logo', () => {
    render(<Footer />);
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Footer />);

    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Testimonials')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });

  it('navigation links have correct hrefs', () => {
    render(<Footer />);

    const featuresLink = screen.getByText('Features');
    const testimonialsLink = screen.getByText('Testimonials');
    const pricingLink = screen.getByText('Pricing');

    expect(featuresLink).toHaveAttribute('href', '#features');
    expect(testimonialsLink).toHaveAttribute('href', '#testimonials');
    expect(pricingLink).toHaveAttribute('href', '#pricing');
  });

  it('renders social media links with aria labels', () => {
    render(<Footer />);

    const twitterLink = screen.getByLabelText('Prestr on X');
    const githubLink = screen.getByLabelText('Prestr on GitHub');

    expect(twitterLink).toBeInTheDocument();
    expect(githubLink).toBeInTheDocument();
  });

  it('renders copyright text with current year', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`Copyright © ${currentYear} Prestr. All rights reserved.`)
    ).toBeInTheDocument();
  });

  it('has correct footer navigation aria-label', () => {
    const { container } = render(<Footer />);

    const nav = container.querySelector('nav[aria-label="quick links"]');
    expect(nav).toBeInTheDocument();
  });

  it('renders social icons as SVG elements', () => {
    const { container } = render(<Footer />);

    const svgElements = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(svgElements.length).toBeGreaterThanOrEqual(2);
  });

  it('applies correct footer styling', () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('bg-slate-50');
  });
});
