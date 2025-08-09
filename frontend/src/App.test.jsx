const { describe, it, expect } = require('vitest');
const App = require('./App');

describe('App component', () => {
    it('renders correctly', () => {
        expect(App()).toBeTruthy();
    });
});