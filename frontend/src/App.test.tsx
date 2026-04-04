import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

test('CI smoke test', () => {
  // Just verify testing environment works
  const { getByText } = render(<div>UniStudy Test</div>);
  expect(getByText('UniStudy Test')).toBeInTheDocument();
});
