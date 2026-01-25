import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AppHeader from './AppHeader.svelte';

describe('AppHeader.svelte', () => {
    it('renders logo and title', async () => {
        const { container } = render(AppHeader);
        expect(container).toHaveTextContent('MoneyWiz Visualization');
        // Logo check might be finding SVG or specific class
        const logo = container.querySelector('.text-mw-primary'); // Assuming MoneyLogo has this class or similar structure key
        expect(container.querySelector('svg')).toBeInTheDocument(); // At least one SVG (logo or upload icon)
    });

    it('renders upload button by default', async () => {
        const { container } = render(AppHeader);
        const uploadBtn = container.querySelector('button');
        expect(uploadBtn).toBeInTheDocument();
        expect(uploadBtn).toHaveTextContent('Upload CSV');
    });

    it('does not render clear button when csvLoaded is false', async () => {
        const { container } = render(AppHeader, { csvLoaded: false });
        const buttons = container.querySelectorAll('button');
        // Only upload button should be present
        const clearBtn = Array.from(buttons).find(b => b.textContent?.includes('Clear'));
        expect(clearBtn).toBeUndefined();
    });

    it('renders clear button when csvLoaded is true', async () => {
        const { container } = render(AppHeader, { csvLoaded: true });
        const buttons = container.querySelectorAll('button');
        const clearBtn = Array.from(buttons).find(b => b.textContent?.includes('Clear'));
        expect(clearBtn).toBeDefined();
        // Check for icon
        const icon = clearBtn?.querySelector('svg');
        expect(icon).toBeInTheDocument();
    });

    it('calls onclear when clear button is clicked', async () => {
        const onClearSpy = vi.fn();
        const { container } = render(AppHeader, { csvLoaded: true, onclear: onClearSpy });
        
        const buttons = container.querySelectorAll('button');
        const clearBtn = Array.from(buttons).find(b => b.textContent?.includes('Clear'));
        
        if (clearBtn) {
            clearBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }

        expect(onClearSpy).toHaveBeenCalled();
    });
});
