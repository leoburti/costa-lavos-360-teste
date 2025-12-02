import '@testing-library/jest-dom';
import React from 'react';

// Mock ResizeObserver for charts/maps
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock intersection observer
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Silence common third-party warnings in tests
const originalError = console.error;
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) return;
  if (/Warning.*ReactDOM.render is no longer supported/.test(args[0])) return;
  originalError(...args);
};