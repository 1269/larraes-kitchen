# Page Design Specifications - Larrae's Kitchen

## Key Page Wireframe Descriptions

### Hero Section
- Full-width design with 100vh height on desktop, 70vh on mobile
- Overlay gradient ensuring text readability over food imagery
- Centered value proposition in Lovelace/Playfair Display
- "Authentic Soul Food Catering in Benicia" headline
- "Bringing Southern Heritage to Your Table" subheading
- Primary CTA button in Deep Amber
- Subtle scroll indicator at bottom center
- Optional decorative element referencing Southern cooking heritage

### About Section
- Two-column layout on desktop (image left, text right)
- Single column on mobile (text below image)
- Chef image with subtle decorative border element
- Heading with decorative underline element in Butter Gold
- Three concise paragraphs with cultural heritage emphasis
- Callout box highlighting "Benicia's Only Soul Food Caterer"
- Background texture element referencing handwritten recipe cards
- Secondary CTA button leading to packages section

### Menu Section
- Tab navigation system for food categories
- Three-column grid on desktop, two-column on tablet, single-column on mobile
- Category headers in Lovelace/Playfair Display
- Menu items with brief, evocative descriptions
- Specialized icons for dietary information
- Featured signature dishes with special visual treatment
- Subtle pattern separators between categories
- "Download Full Menu" CTA in secondary button style

### Catering Packages Section
- Three-card layout arranged horizontally on desktop, vertically stacked on mobile
- Package cards with distinctive styling:
  - Small Gathering: Border in Deep Amber
  - Medium Event: Border in Greens
  - Large Gathering: Border in Southern Red
- Package titles in Lovelace/Playfair Display
- Price range prominently displayed
- Bulleted list of inclusions with check icon
- Add-on options listed below main inclusions
- Primary CTA button at bottom of each card
- Background texture referencing Southern quilting patterns

### Gallery Section
- Masonry layout with varied image sizes
- Lightbox functionality on click/tap
- Categories (Family Events, Social Gatherings, Corporate) as filtering options
- 3-4 columns on desktop, 2 columns on tablet, 1 column on mobile
- Brief overlay captions on hover/tap
- Images with subtle border treatment
- "View More" button at bottom for future expansion

### Testimonials Section
- Slider format with manual navigation
- Individual testimonial cards with consistent formatting
- Decorative quotation mark in Butter Gold
- Client name and event type below testimonial
- Star rating visualization (4-5 stars)
- Background texture element referencing handwritten notes
- Previous/next navigation in custom styling

### Contact Section
- Two-column layout on desktop (form left, info right)
- Stacked layout on mobile (info above form)
- Form with warm, inviting styling
- "Tell Us About Your Event" heading
- Required fields clearly marked
- Direct contact information with decorative icons
- Map showing Benicia service area
- Social media links with custom Southern-inspired icons
- Background pattern element for visual interest

## Layout Grid System

### Base Grid Structure
- 12-column grid system for flexible layouts
- Consistent gutter width (16px mobile, 24px desktop)
- Max container width of 1200px with auto margins
- Responsive breakpoints matching device standards

### Vertical Rhythm
- Base unit of 8px for all spacing values
- Section padding: 64px (desktop), 40px (mobile)
- Consistent spacing between related elements (16px)
- Larger spacing between unrelated elements (32px, 48px, 64px)
- Standardized vertical spacing between sections

### Horizontal Alignment
- Content aligned to grid columns
- Text alignment: left-aligned by default, center-aligned for specific elements
- Consistent indentation for nested content

### Layout Proportions
- Golden ratio (1:1.618) for featured content areas
- Rule of thirds for image composition and layout divisions
- Consistent aspect ratios for media elements

### Responsive Behavior
- Mobile: Single-column layout with full-width components
- Tablet: 8-column grid with flexible component sizing
- Desktop: 12-column grid with varied component widths
- Fluid typography scaling between breakpoints
- Strategic content reordering for optimal mobile experience

## Interactive Elements Specification

### Buttons
- Primary buttons use Deep Amber background with Warm Cream text
- Hover states include subtle scale increase (1.05) and darkening
- Focus states include distinctive outline for accessibility
- All buttons include subtle transition animations (0.2s)
- Mobile buttons expand to full width on smaller screens

### Form Elements
- Input fields with 1px Clay-colored border
- Background: Warm Cream (#FFF4E0)
- Labels positioned above fields
- Focus state transitions border to Deep Amber
- Error states include Southern Red border and error message
- Dropdown selects with custom styling matching text inputs
- Required field indicators in Southern Red

### Navigation Elements
- Desktop: Horizontal navigation with hover underline effect
- Mobile: Hamburger menu icon in top right
- Mobile menu overlay with textured background
- Active state indication for current section
- Smooth scroll behavior for section navigation

### Hover States
- Menu items: Subtle background color shift
- Gallery images: Slight scale increase (1.02) and info overlay
- Testimonial cards: Subtle elevation effect
- Package cards: Subtle border enhancement

## Animations & Transitions Guidelines

### Section Transitions
- Subtle fade-in animations as sections enter viewport
- Staggered animation for gallery images (50ms delay between items)
- Smooth transitions between menu categories (300ms)
- Package card hover animation with subtle elevation change

### Interactive Feedback
- Button hover transitions (200ms ease-out)
- Form field focus animations (250ms)
- Menu category tab transitions (300ms)
- Gallery image hover transitions (200ms)

### Performance Considerations
- Use transform and opacity for animations to leverage GPU acceleration
- Limit animation complexity on mobile devices
- Implement progressive loading for gallery section
- Ensure animations don't interfere with content consumption

### Accessibility Requirements
- Respect user preferences for reduced motion
- Provide alternative indicators for all animated elements
- Ensure all interactive elements are keyboard accessible
- Maintain appropriate timing for all transitions (300ms maximum)

## Section Content Examples

### Hero Section Content
```
[Full-width high-quality soul food spread image with overlay gradient]

AUTHENTIC SOUL FOOD CATERING IN BENICIA
Bringing Southern Heritage to Your Table

[GET A QUOTE] button
```

### About Section Content Sample
```
[Image of chef preparing food]

OUR STORY

Larrae's Kitchen was born from a passion for authentic soul food and a desire to share our rich culinary heritage with the Benicia community. Our founder, Larrae Johnson, learned the art of soul food cooking from four generations of family recipes that traveled from Georgia to California.

Every dish we prepare carries the warmth and love of Southern tradition, from our slow-simmered collard greens to our five-cheese mac and cheese that's become a local favorite.

[BENICIA'S ONLY SOUL FOOD CATERER - callout box]

We pride ourselves on using quality ingredients, traditional cooking methods, and bringing the authentic flavors of soul food to your special events.

[VIEW OUR PACKAGES] button
```

### Package Card Example
```
[Card with Deep Amber border]

SMALL GATHERING PACKAGE

10-20 PEOPLE
$18-22 per person

INCLUDES:
✓ 2 protein options
✓ 3 sides
✓ Cornbread
✓ Delivery within Benicia
✓ Disposable serving ware

ADD-ONS:
• Dessert option (+$4/person)
• Additional protein (+$5/person)
• Staff service (+$150)

Minimum order: $250

[GET A QUOTE] button
```

These design specifications create a cohesive, culturally authentic website that highlights Larrae's Kitchen as Benicia's premier soul food caterer while providing clear conversion paths for the primary residential client audience.
