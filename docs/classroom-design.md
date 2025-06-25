# Classroom Page Design Guidelines

This document describes the UX/UI specifications for the `Classroom` page. The goal is to provide a mobile friendly layout and a clear style guide for implementation.

## Layout
- **Responsive columns**: On `md` screens and above the page uses a two column layout with a sidebar on the left and the lesson content on the right. On small screens the sidebar becomes a slide in panel triggered by a menu button.
- **Sidebar sizing**: width `w-64` (16rem) on mobile and `w-80` (20rem) for `md` and up.
- **Spacing**: padding inside the sidebar is `p-6`. Main content has `p-4` on mobile and `p-10` on `md` and above.
- **Sidebar toggle**: A hamburger button (`Bars3Icon`) positioned `top-2 left-2` opens the sidebar on mobile. A close button (`XMarkIcon`) inside the sidebar at `top-2 right-2` hides it.

## Colors
- **Brand color**: `#119C99` (`bg-brand` in Tailwind config).
- **Sidebar borders**: `border-gray-200` on light mode.
- **Completed state**: green `#22c55e` icons (`text-green-500`) and progress bar (`bg-green-400`).
- **Selected item**: `bg-cyan-50` background with a left border `border-cyan-400`.

## Typography
- Base font is Inter (loaded via `next/font`).
- Heading inside sidebar uses `text-xl` and `font-bold`.
- Lesson titles use `font-medium` with truncation for long text.

## Interactive Behaviors
- **Hover**: lesson items slightly change background (`bg-yellow-50` default). Hover uses the `tesla-hover` utility which adds a subtle scale and overlay.
- **Focus**: buttons and inputs rely on Tailwind's default focus styles; ensure `focus:outline-none focus:ring-2 focus:ring-brand` when creating new UI elements.
- **Mobile sidebar**: tapping outside the panel closes it. The panel slides in/out using Tailwind `transition-transform`.

## Platform Notes
- Works with Tailwind CSS and Next.js client components.
- Dark mode is supported via the global `.dark` class. Sidebar and text automatically adapt using existing CSS variables.

These guidelines should keep the classroom page visually consistent across screen sizes while solving the previous issue of the sidebar not displaying on mobile.
