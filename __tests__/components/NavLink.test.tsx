import React from 'react';
import { render, screen } from '@testing-library/react';
import { NavLink } from '@/components/NavLink';

describe('NavLink', () => {
  it('renders a link with correct href', () => {
    render(<NavLink href="/about">About Us</NavLink>);

    const link = screen.getByRole('link', { name: 'About Us' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/about');
  });

  it('renders children correctly', () => {
    render(<NavLink href="/contact">Contact</NavLink>);

    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('applies navigation link styles', () => {
    render(<NavLink href="/services">Services</NavLink>);

    const link = screen.getByRole('link', { name: 'Services' });
    expect(link).toHaveClass('inline-block');
    expect(link).toHaveClass('rounded-lg');
    expect(link).toHaveClass('px-2');
    expect(link).toHaveClass('py-1');
    expect(link).toHaveClass('text-sm');
    expect(link).toHaveClass('text-slate-700');
    expect(link).toHaveClass('hover:bg-slate-100');
    expect(link).toHaveClass('hover:text-slate-900');
  });

  it('handles absolute URLs', () => {
    render(<NavLink href="https://example.com">External Link</NavLink>);

    const link = screen.getByRole('link', { name: 'External Link' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('handles root path', () => {
    render(<NavLink href="/">Home</NavLink>);

    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('href', '/');
  });

  it('handles nested paths', () => {
    render(<NavLink href="/products/category/item">Product</NavLink>);

    const link = screen.getByRole('link', { name: 'Product' });
    expect(link).toHaveAttribute('href', '/products/category/item');
  });

  it('renders with React elements as children', () => {
    render(
      <NavLink href="/dashboard">
        <span>Dashboard</span>
      </NavLink>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/dashboard');
  });
});
