# UI Design System - Larrae's Kitchen

## Visual Design Direction

### Recommended Concept: "Southern Soul Heritage"

The visual design for Larrae's Kitchen evokes the warmth, richness, and authenticity of soul food culture while maintaining a level of sophistication that appeals to the Benicia residential market. The design blends traditional soul food heritage elements with contemporary presentation.

**Key Visual Elements:**
- Warm, rich color palette inspired by soul food ingredients
- Textural elements reminiscent of handwritten recipe cards and cast iron cookware
- Typography that balances traditional Southern influence with modern readability
- Authentic food photography featuring vibrant, home-style presentation
- Subtle pattern elements drawing from African American quilting traditions

## Color Palette

### Primary Colors
- **Deep Amber** (#C65102): The rich, warm color of fried chicken or baked cornbread
- **Greens** (#2B5F41): Representing collard greens and Southern vegetables
- **Warm Cream** (#FFF4E0): Providing an inviting background reminiscent of cornbread
- **Iron Black** (#211A16): For text and contrast elements, evoking cast iron cookware

### Secondary Colors
- **Southern Red** (#A83E32): For accent elements, reminiscent of hot sauce or BBQ
- **Butter Gold** (#E2B33D): Adding warmth and premium feel for highlighting elements
- **Clay** (#9B6449): For earthy background elements and texture

### Functional Colors
- **Success Green** (#2E7D32): For confirmation and positive indicators
- **Alert Red** (#C62828): For errors and important notifications
- **Link Blue** (#1565C0): For interactive elements (WCAG AA compliant)

### Accessibility Considerations
- All text color combinations exceed WCAG 2.1 AA standards
- Color is never the sole indicator for interactive elements
- Sufficient contrast between background and foreground elements
- Alternative high-contrast mode available for users with visual impairments

## Typography System

### Primary Typeface
**Heading Font: Lovelace** (or Google Fonts alternative: Playfair Display)
- Conveys Southern heritage with traditional serif details
- Used for all headings and display text
- Weights: Regular (400) and Bold (700)
- Excellent readability at larger sizes

### Secondary Typeface
**Body Font: Work Sans**
- Clean, approachable sans-serif for excellent readability
- Used for body text, navigation, and UI elements
- Weights: Regular (400), Medium (500), and Bold (700)
- High legibility across devices and sizes

### Typography Scale
- **H1 (Page Title)**: 38px/44px mobile, 56px/64px desktop
- **H2 (Section Title)**: 30px/36px mobile, 42px/48px desktop
- **H3 (Subsection)**: 24px/30px mobile, 32px/38px desktop
- **H4 (Card Title)**: 20px/26px mobile, 24px/30px desktop
- **Body Large**: 18px/26px mobile, 20px/30px desktop
- **Body Regular**: 16px/24px mobile, 18px/28px desktop
- **Body Small**: 14px/20px mobile, 16px/24px desktop
- **Caption/Meta**: 12px/16px mobile, 14px/20px desktop

### Typography Guidelines
- Maximum line length of 75 characters for optimal readability
- Left-aligned text for most content (centered for specific elements only)
- Minimum font size of 16px for body text to ensure readability
- Headings use title case for traditional, Southern feel
- Strategic use of italics for menu item names and emphasis

## Component Library

### Button System

**Primary Buttons**
- Background: Deep Amber (#C65102)
- Text: Warm Cream (#FFF4E0)
- Size: 44px height minimum, width adapting to content
- Border radius: 8px
- Padding: 12px 24px
- Typography: Body font, 16px, Medium (500) weight
- States: 
  - Hover: 10% darker background
  - Active: 15% darker background
  - Focus: 2px outline in matching color with 2px offset
  - Disabled: 50% opacity, not clickable

**Secondary Buttons**
- Background: Transparent
- Border: 2px solid Deep Amber (#C65102)
- Text: Deep Amber (#C65102)
- Size and states matching primary buttons

### Card Components

**Package Cards**
- Warm Cream background (#FFF4E0)
- 1px border in Clay color (#9B6449)
- Subtle pattern background referencing quilting tradition
- Consistent padding (24px)
- Title in Lovelace/Playfair Display, 24px
- Price point prominently displayed in Deep Amber
- Package inclusions presented as checklist
- CTA button positioned consistently at bottom

**Menu Item Cards**
- Clean, borderless design
- Item name in Lovelace/Playfair Display, italicized
- Brief description with cultural reference
- Optional pattern element separating items
- Dietary indicators with intuitive icons
- Subtle hover state highlighting entire card

**Testimonial Cards**
- Quotation mark visual element in Butter Gold
- Client name and event type
- Star rating visualization
- Background texture referencing handwritten recipe cards
- Subtle border in Clay color

### Gallery Components

**Image Grid**
- Responsive masonry layout
- Consistent gap spacing (16px)
- Subtle border on images referencing vintage photo frames
- Hover/tap state with caption overlay
- Lightbox functionality on click/tap

**Lightbox**
- Full-screen image view with navigation
- Blurred background showing page content
- Close button prominently positioned
- Caption showing event type and menu featured
- Next/previous arrows for navigation

## Responsive Design Principles

### Mobile-First Approach
- All components designed initially for mobile constraints
- Progressive enhancement for larger screens
- Performance optimization for mobile data connections
- Touch-friendly interaction targets (min. 44×44px)
- Simplified navigation on mobile devices

### Layout Adaptations
**Navigation Transformation**
- Mobile: Collapsed hamburger menu with heritage-inspired overlay
- Tablet: Compact horizontal navigation
- Desktop: Full horizontal navigation with visual enhancements

**Content Reflow**
- Mobile: Single-column layout for most content
- Tablet: Two-column layout for menu items and gallery
- Desktop: Multi-column layout with increased visual sophistication

**Image Handling**
- Mobile: Optimized, smaller images with reduced resolution
- Desktop: Higher resolution with art direction
- Progressive loading for gallery section
