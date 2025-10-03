import React from 'react';
import { render, screen } from '@testing-library/react';
import { Container } from '@/components/Container';

describe('Container', () => {
  it('renders children correctly', () => {
    render(
      <Container>
        <div>Test Content</div>
      </Container>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies default container classes', () => {
    render(<Container data-testid="container">Content</Container>);

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('mx-auto');
    expect(container).toHaveClass('max-w-7xl');
    expect(container).toHaveClass('px-4');
    expect(container).toHaveClass('sm:px-6');
    expect(container).toHaveClass('lg:px-8');
  });

  it('merges custom className with default classes', () => {
    render(
      <Container data-testid="container" className="custom-class bg-gray-100">
        Content
      </Container>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('mx-auto');
    expect(container).toHaveClass('max-w-7xl');
    expect(container).toHaveClass('custom-class');
    expect(container).toHaveClass('bg-gray-100');
  });

  it('forwards additional props to div', () => {
    render(
      <Container id="main-container" data-testid="container" aria-label="Main content">
        Content
      </Container>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveAttribute('id', 'main-container');
    expect(container).toHaveAttribute('aria-label', 'Main content');
  });

  it('renders as a div element', () => {
    render(<Container data-testid="container">Content</Container>);

    const container = screen.getByTestId('container');
    expect(container.tagName).toBe('DIV');
  });

  it('handles multiple children', () => {
    render(
      <Container>
        <h1>Title</h1>
        <p>Paragraph</p>
        <button>Click me</button>
      </Container>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
