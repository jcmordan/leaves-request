# Design System: Admin Page Layout (HR Sovereign)
**Project ID:** 9653971205121259757

## 1. Visual Theme & Atmosphere
The "HR Sovereign" aesthetic is **Premium, Authoritative, and Architecturally Clean**. It uses a "Tonal Layering" strategy where depth is communicated through subtle shifts in surface color rather than heavy borders. The atmosphere is professional and dense, favoring high-information layouts with a focus on hierarchy and clarity.

## 2. Color Palette & Roles
*   **Deep Sovereign Navy (#001430 / #002855):** Primary brand color. Used for high-level structure (Sidebar, Headers) and primary actions. Conveys stability and authority.
*   **Estate Olive (#486800):** Accent and semantic success color. Used for status indicators ("ACTIVE"), section markers, and secondary highlights.
*   **Cloud Surface (#f8f9ff):** The base background. A cool, crisp white that provides a neutral canvas for data.
*   **Azure Layering (#eff4ff / #e6eeff / #d6e3fb):** Hierarchical surface colors (`surface-container-low` to `highest`). Used to group information and create focus without line-based segmentation.
*   **Muted Steel (#747780):** Used for outlines and secondary text to maintain low visual noise.

## 3. Typography Rules
*   **Headers (Manrope):** A modern, geometric sans-serif used for all headlines and labels that require authority. Often used with tight tracking and heavy weights (Extrabold/Black) for a "high-end editorial" feel.
*   **Body & Data (Inter):** The workhorse for all data entry and reading. Relies on font weight shifts (Medium to Semibold) to create hierarchy within dense data fields.

## 4. Component Stylings
*   **Buttons:** Generally pill-shaped or large-radius rounded squares. Primary buttons use a solid navy fill or a subtle gradient. Secondary buttons use high-contrast light backgrounds (`surface-container-highest`).
*   **Inputs:** "Refined" style—no visible borders by default. They sit on a slightly darker background than the container (`surface-container-low`) and use internal padding to create a physical "nesting" feel.
*   **Section Markers:** Small vertical bars of Estate Olive (#486800) preceding uppercase labels. This provides a "wayfinding" cue without using full-width horizontal rules.
*   **Sheets/Modals:** High elevation with soft, diffused shadows (e.g., `shadow-[-20px_0_40px_rgba(15,28,45,0.08)]`).

## 5. Layout Principles
*   **Bento-Grid Influence:** Information is grouped into logical blocks with consistent spacing (`p-8` for major containers).
*   **No-Border Policy:** Prefer using background color shifts and shadows to define containers rather than `border-1px`.
*   **Vertical Hierarchy:** Critical identifiers (Employee Code, AN8) are given distinct backgrounds or heavier typography to stand out from standard contact data.
