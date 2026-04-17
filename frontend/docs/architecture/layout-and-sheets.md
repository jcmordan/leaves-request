# Layout and Side Sheets Architecture

This document explains the structural layout of the application and how side sheets (`Sheet` components) are rendered to fit within the designated workspace area without overlapping the application's header or extending beyond the viewport.

## Inner-Scrolling Layout

The application utilizes an "inner-scrolling" layout paradigm (commonly found in admin dashboards). 
Instead of the entire browser window scrolling (`min-h-screen` on the body), the root container is locked to the viewport size, and only specific content areas scroll.

### DOM Structure

In `AdminLayout.tsx`:
1. **Root Container**: Uses `h-screen overflow-hidden` to lock the layout strictly to the viewport height.
2. **Sidebar**: Has `h-screen overflow-y-auto` so it spans the entire height of the viewport and can scroll independently if its contents exceed the screen.
3. **Main Workspace Area**:
   - **Header**: Fixed height (`h-20`), with `flex-shrink-0` to prevent it from collapsing.
   - **Workspace Content Area (`SheetPortalTarget`)**: This element spans the remaining height of the viewport (using `flex-1` and `overflow-hidden`).
   - **Main Content (`main`)**: Has `overflow-y-auto`. This is the *only* part of the main workspace that scrolls when the page content is long.

By doing this, we guarantee that the `SheetPortalTarget` wrapper has exactly `height: calc(100vh - headerHeight)`.

## Side Sheets Containment

By default, Radix UI dialogs and side sheets are portaled to the `document.body` and use `fixed` positioning, which causes them to overlap all page contents including headers and sidebars. 

To make side sheets appear *under* the application header and respect the boundaries of the workspace:

### 1. `SheetPortalTarget` Registration
The `SheetPortalTarget` component wraps the `main` workspace area. It captures its own DOM `ref` and registers it globally via the `useSheets().setPortalTarget()` method.

### 2. Contextual Portaling
The global `SheetProvider` (in `SheetNavigation.tsx`) stores this `portalTarget` and passes it to the `SheetContent` component as the `container` prop. 

### 3. Absolute vs Fixed Positioning
When `SheetContent` receives a `container` prop, it automatically switches the underlying Radix `Portal` to render inside that container, and changes the CSS from `fixed` to `absolute`. 

Because the `SheetPortalTarget` is styled with `relative` and is exactly the height of the workspace area (minus the header), the `absolute inset-y-0 h-full` classes on the `Sheet` cause it to perfectly snap to the top and bottom of the workspace area.

This prevents the sheet from overlapping the top header, and ensures its footer is always visible at the bottom of the viewport, regardless of how long the underlying `main` content scrolls.
