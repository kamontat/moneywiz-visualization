import { render, fireEvent, cleanup } from '@testing-library/svelte';
import Button from './Button.svelte';
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('Button Atom', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders with correct classes for primary variant', () => {
        const { getByRole } = render(Button, { props: { variant: 'primary', label: 'Test Button' } });
        const btn = getByRole('button', { name: "Test Button" });
        expect(btn.className).toContain('bg-gradient-to-br');
    });

    it('handles clicks', async () => {
        const onclick = vi.fn();
        const { getByRole } = render(Button, { props: { onclick } });
        const btn = getByRole('button');
        await fireEvent.click(btn);
        expect(onclick).toHaveBeenCalled();
    });

    it('renders disabled state', () => {
        const { getByRole } = render(Button, { props: { disabled: true } });
        const btn = getByRole('button');
        expect(btn.hasAttribute('disabled')).toBe(true);
    });
});
