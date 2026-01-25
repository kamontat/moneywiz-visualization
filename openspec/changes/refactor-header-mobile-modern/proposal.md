# Proposal: Refactor Header for Modern Design and Mobile Support

## Why
The current header design is functional but feels a bit dated and takes up significant vertical space on mobile devices due to stacking. As the application visualizes financial data, a more "premium" and modern feel (cleaner lines, subtle depth, better mobile optimization) will improve the overall user experience and perceived quality.

## What Changes
- **Visual Modernization**: Implement a "Glassmorphism" effect using `backdrop-blur-md` and semi-transparent background.
- **Improved Layout**: Ensure the header remains a single line on all screen sizes (no vertical stacking). Use horizontal layout consistently.
- **Responsive Buttons**: Update buttons (Clear and Upload) to show only icons on mobile and icon + label on desktop.
- **Branding Update**: Change title from "MoneyWiz Visualization" to "MoneyWiz Report" and use an icon instead of text before the title for a cleaner look.
- **Subtle Depth**: Add a very subtle shadow or a refined bottom border to distinguish the header from the content as it scrolls.

## Impact
- **UI/UX**: More modern and professional look.
- **Mobile Users**: Better space utilization on small screens.
- **Accessibility**: Better touch targets and contrast ratios.
- **Maintainability**: Cleaner Tailwind classes and potentially better component isolation.
