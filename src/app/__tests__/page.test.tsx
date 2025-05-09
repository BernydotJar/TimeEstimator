import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../page';

describe('Home Component', () => {
  it('should render without errors', () => {
    render(<Home />);
    const element = screen.getByTestId('home-page')
    expect(element).toBeInTheDocument();
  
  })
});
