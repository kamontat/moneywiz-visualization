import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MoneyLogo from './MoneyLogo.svelte';

describe('MoneyLogo.svelte', () => {
    it('renders correctly', async () => {
        const { container } = render(MoneyLogo);
        expect(container).toHaveTextContent('$');
    });

    it('accepts size prop', async () => {
        const { container } = render(MoneyLogo, { size: 50 });
        const div = container.querySelector('div');
        expect(div).toHaveStyle({ width: '50px', height: '50px' });
    });
});
