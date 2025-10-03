import { render, screen } from '../setup/render'

import Home from '../../src/app/page'

jest.mock('../../src/components/HeaderWrapper', () => ({
  HeaderWrapper: () => <div data-testid="header-wrapper" />,
}))
jest.mock('../../src/components/Hero', () => ({
  Hero: () => <section data-testid="hero" />,
}))
jest.mock('../../src/components/PrimaryFeatures', () => ({
  PrimaryFeatures: () => <section data-testid="primary-features" />,
}))
jest.mock('../../src/components/SecondaryFeatures', () => ({
  SecondaryFeatures: () => <section data-testid="secondary-features" />,
}))
jest.mock('../../src/components/CallToAction', () => ({
  CallToAction: () => <section data-testid="cta" />,
}))
jest.mock('../../src/components/Testimonials', () => ({
  Testimonials: () => <section data-testid="testimonials" />,
}))
jest.mock('../../src/components/Pricing', () => ({
  Pricing: () => <section data-testid="pricing" />,
}))
jest.mock('../../src/components/Faqs', () => ({
  Faqs: () => <section data-testid="faqs" />,
}))
jest.mock('../../src/components/Footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}))

describe('Home page', () => {
  it('renders the marketing surface with all critical sections', () => {
    render(<Home />)

    expect(screen.getByTestId('header-wrapper')).toBeInTheDocument()
    expect(screen.getByTestId('hero')).toBeInTheDocument()
    expect(screen.getByTestId('primary-features')).toBeInTheDocument()
    expect(screen.getByTestId('secondary-features')).toBeInTheDocument()
    expect(screen.getByTestId('cta')).toBeInTheDocument()
    expect(screen.getByTestId('testimonials')).toBeInTheDocument()
    expect(screen.getByTestId('pricing')).toBeInTheDocument()
    expect(screen.getByTestId('faqs')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })
})
