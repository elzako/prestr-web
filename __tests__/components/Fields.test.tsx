import React from 'react';
import { render, screen } from '@testing-library/react';
import { TextField, SelectField } from '@/components/Fields';

describe('TextField', () => {
  it('renders text input with label', () => {
    render(<TextField label="Email" name="email" />);

    const label = screen.getByText('Email');
    const input = screen.getByLabelText('Email');

    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('renders with custom type', () => {
    render(<TextField label="Password" type="password" name="password" />);

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('applies custom className', () => {
    render(<TextField label="Name" name="name" className="custom-class" />);

    const wrapper = screen.getByLabelText('Name').parentElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('forwards additional props to input', () => {
    render(
      <TextField
        label="Email"
        name="email"
        placeholder="Enter email"
        required
        disabled
      />
    );

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('placeholder', 'Enter email');
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
  });

  it('associates label with input using unique id', () => {
    render(<TextField label="Username" name="username" />);

    const label = screen.getByText('Username') as HTMLLabelElement;
    const input = screen.getByLabelText('Username');

    expect(label.htmlFor).toBe(input.id);
    expect(input.id).toBeTruthy();
  });

  it('renders with default value', () => {
    render(<TextField label="Name" name="name" defaultValue="John Doe" />);

    const input = screen.getByLabelText('Name') as HTMLInputElement;
    expect(input.value).toBe('John Doe');
  });
});

describe('SelectField', () => {
  it('renders select with label', () => {
    render(
      <SelectField label="Country" name="country">
        <option value="us">United States</option>
        <option value="uk">United Kingdom</option>
      </SelectField>
    );

    const label = screen.getByText('Country');
    const select = screen.getByLabelText('Country');

    expect(label).toBeInTheDocument();
    expect(select).toBeInTheDocument();
    expect(select.tagName).toBe('SELECT');
  });

  it('renders options correctly', () => {
    render(
      <SelectField label="Country" name="country">
        <option value="us">United States</option>
        <option value="uk">United Kingdom</option>
        <option value="ca">Canada</option>
      </SelectField>
    );

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('United States');
    expect(options[1]).toHaveTextContent('United Kingdom');
    expect(options[2]).toHaveTextContent('Canada');
  });

  it('applies custom className', () => {
    render(
      <SelectField label="Status" name="status" className="custom-select">
        <option value="active">Active</option>
      </SelectField>
    );

    const wrapper = screen.getByLabelText('Status').parentElement;
    expect(wrapper).toHaveClass('custom-select');
  });

  it('forwards additional props to select', () => {
    render(
      <SelectField label="Priority" name="priority" required disabled>
        <option value="high">High</option>
        <option value="low">Low</option>
      </SelectField>
    );

    const select = screen.getByLabelText('Priority');
    expect(select).toBeRequired();
    expect(select).toBeDisabled();
  });

  it('associates label with select using unique id', () => {
    render(
      <SelectField label="Role" name="role">
        <option value="admin">Admin</option>
      </SelectField>
    );

    const label = screen.getByText('Role') as HTMLLabelElement;
    const select = screen.getByLabelText('Role');

    expect(label.htmlFor).toBe(select.id);
    expect(select.id).toBeTruthy();
  });

  it('renders with default value', () => {
    render(
      <SelectField label="Status" name="status" defaultValue="active">
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </SelectField>
    );

    const select = screen.getByLabelText('Status') as HTMLSelectElement;
    expect(select.value).toBe('active');
  });
});
