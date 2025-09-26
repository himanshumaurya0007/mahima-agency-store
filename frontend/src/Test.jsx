import React, { useState } from 'react';

// Want To add A Styles With In The Component
// @import 'tailwindcss';

// /* CUSTOM FONTS SETUP */

// /* ALPINO */

// @font-face {
//   font-family: 'Alpino';
//   src: url('/Assets/Fonts/Alpino/Alpino-Thin.woff2') format('woff2');
//   font-weight: 100;
//   font-style: normal;
//   font-display: swap;
// }

// @font-face {
//   font-family: 'Alpino';
//   src: url('/Assets/Fonts/Alpino/Alpino-Light.woff2') format('woff2');
//   font-weight: 300;
//   font-style: normal;
//   font-display: swap;
// }

// @font-face {
//   font-family: 'Alpino';
//   src: url('/Assets/Fonts/Alpino/Alpino-Regular.woff2') format('woff2');
//   font-weight: 400;
//   font-style: normal;
//   font-display: swap;
// }

// @font-face {
//   font-family: 'Alpino';
//   src: url('/Assets/Fonts/Alpino/Alpino-Medium.woff2') format('woff2');
//   font-weight: 500;
//   font-style: normal;
//   font-display: swap;
// }

// @font-face {
//   font-family: 'Alpino';
//   src: url('/Assets/Fonts/Alpino/Alpino-Bold.woff2') format('woff2');
//   font-weight: 700;
//   font-style: normal;
//   font-display: swap;
// }

// @font-face {
//   font-family: 'Alpino';
//   src: url('/Assets/Fonts/Alpino/Alpino-Black.woff2') format('woff2');
//   font-weight: 900;
//   font-style: normal;
//   font-display: swap;
// }

// /* SUPREME */

// @font-face {
//   font-family: 'Supreme';
//   src: url('/Assets/Fonts/Supreme/Supreme-Thin.woff2') format('woff2');
//   font-weight: 100;
//   font-style: normal;
//   font-display: swap;
// }

// @font-face {
//   font-family: 'Supreme';
//   src: url('/Assets/Fonts/Supreme/Supreme-Light.woff2') format('woff2');
//   font-weight: 300;
//   font-style: normal;
//   font-display: swap;
// }

// @font-face {
//   font-family: 'Supreme';
//   src: url('/Assets/Fonts/Supreme/Supreme-Regular.woff2') format('woff2');
//   font-weight: 400;
//   font-style: normal;
//   font-display: swap;
// }

// @font-face {
//   font-family: 'Supreme';
//   src: url('/Assets/Fonts/Supreme/Supreme-Medium.woff2') format('woff2');
//   font-weight: 500;
//   font-style: normal;
//   font-display: swap;
// }

// @font-face {
//   font-family: 'Supreme';
//   src: url('/Assets/Fonts/Supreme/Supreme-Bold.woff2') format('woff2');
//   font-weight: 700;
//   font-style: normal;
//   font-display: swap;
// }

// @font-face {
//   font-family: 'Supreme';
//   src: url('/Assets/Fonts/Supreme/Supreme-Extrabold.woff2') format('woff2');
//   font-weight: 800;
//   font-style: normal;
//   font-display: swap;
// }

// /* CUSTOM PROPERTIES */

// @theme {
//   /* Custom Font Families */
//   --font-alpino: 'Alpino', serif;
//   --font-supreme: 'Supreme', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

//   /* Cream Noir Color Palette */
//   --color-black: #111111;
//   --color-white: #ffffff;
//   --color-cream: #fff4e6;
//   --color-vanilla: #f9ead3;
//   --color-peach: #ffd6b3;
//   --color-coffee: #2b2b2b;

//   /* Custom Gray Shades */
//   --color-gray-50: #f9fafb;
//   --color-gray-100: #f3f4f6;
//   --color-gray-200: #e5e7eb;
//   --color-gray-300: #d1d5db;
//   --color-gray-400: #9ca3af;
//   --color-gray-500: #6b7280;
//   --color-gray-600: #4b5563;
//   --color-gray-700: #374151;
//   --color-gray-800: #1f2937;
//   --color-gray-900: #111827;

//   /* Letter Spacing */
//   --letter-spacing-tighter: -0.05em;
//   --letter-spacing-tight: -0.025em;
//   --letter-spacing-normal: 0;
//   --letter-spacing-wide: 0.025em;
//   --letter-spacing-wider: 0.05em; /* THIS IS DEFAULT LETTER SPACING */
//   --letter-spacing-widest: 0.1em;

//   /* Custom Font Sizes */
//   --font-size-brand: 2.5rem;
//   --font-size-hero: 3.5rem;
//   --font-size-section: 2rem;
//   --font-size-card: 1.25rem;
//   --font-size-body: 1rem;
//   --font-size-caption: 0.875rem;

//   /* Custom Spacing */
//   --spacing-section: 4rem;
//   --spacing-card: 1.5rem;
//   --spacing-element: 1rem;

//   /* Border Radius */
//   --radius-card: 12px;
//   --radius-button: 8px;
//   --radius-input: 6px;

//   /* Box Shadows */
//   --shadow-card: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
//   --shadow-hover: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
// }

// /*  BASE STYLES */

// body {
//   font-family: theme(--font-supreme);
//   background-color: theme(--color-cream);
//   color: theme(--color-black);
//   line-height: 1.6;
//   letter-spacing: theme(--letter-spacing-wider);
// }

// /*  HEADING TAGS DEFAULT STYLING FOR COMPATIBLE TO TAILWIND */
// h1 {
//   font-family: theme(--font-alpino);
//   font-size: 2.25rem; /* text-4xl */
//   font-weight: 700;
//   color: theme(--color-black);
//   line-height: 1.1;
//   letter-spacing: theme(--letter-spacing-wider);
//   margin-bottom: 1rem;
// }

// h2 {
//   font-family: theme(--font-alpino);
//   font-size: 1.875rem; /* text-3xl */
//   font-weight: 600;
//   color: theme(--color-black);
//   line-height: 1.2;
//   letter-spacing: theme(--letter-spacing-wider);
//   margin-bottom: 0.75rem;
// }

// h3 {
//   font-family: theme(--font-alpino);
//   font-size: 1.5rem; /* text-2xl */
//   font-weight: 600;
//   color: theme(--color-black);
//   line-height: 1.3;
//   letter-spacing: theme(--letter-spacing-wider);
//   margin-bottom: 0.5rem;
// }

// h4 {
//   font-family: theme(--font-alpino);
//   font-size: 1.25rem; /* text-xl */
//   font-weight: 500;
//   color: theme(--color-black);
//   line-height: 1.4;
//   letter-spacing: theme(--letter-spacing-wider);
//   margin-bottom: 0.5rem;
// }

// h5 {
//   font-family: theme(--font-alpino);
//   font-size: 1.125rem; /* text-lg */
//   font-weight: 500;
//   color: theme(--color-coffee);
//   line-height: 1.5;
//   letter-spacing: theme(--letter-spacing-wider);
//   margin-bottom: 0.25rem;
// }

// h6 {
//   font-family: theme(--font-alpino);
//   font-size: 1rem; /* text-base */
//   font-weight: 500;
//   color: theme(--color-coffee);
//   line-height: 1.5;
//   letter-spacing: theme(--letter-spacing-wider);
//   margin-bottom: 0.25rem;
// }

// /* Default paragraph styling */
// p {
//   font-family: theme(--font-supreme);
//   font-size: theme(--font-size-body);
//   color: theme(--color-black);
//   line-height: 1.6;
//   letter-spacing: theme(--letter-spacing-wider);
//   margin-bottom: 0.5rem;
// }

// /* COMPONENT CLASSES */
// @layer components {
//   /* Typography Classes*/
//   .text-brand {
//     font-family: theme(--font-alpino);
//     font-size: theme(--font-size-brand);
//     font-weight: 700;
//     color: theme(--color-black);
//     line-height: 1.2;
//     letter-spacing: theme(--letter-spacing-wider);
//   }

//   .text-hero {
//     font-family: theme(--font-alpino);
//     font-size: theme(--font-size-hero);
//     font-weight: 700;
//     color: theme(--color-black);
//     line-height: 1.1;
//     letter-spacing: theme(--letter-spacing-wider);
//   }

//   .text-section {
//     font-family: theme(--font-alpino);
//     font-size: theme(--font-size-section);
//     font-weight: 600;
//     color: theme(--color-black);
//     line-height: 1.3;
//     letter-spacing: theme(--letter-spacing-wider);
//   }

//   .text-card-title {
//     font-family: theme(--font-alpino);
//     font-size: theme(--font-size-card);
//     font-weight: 600;
//     color: theme(--color-black);
//     line-height: 1.4;
//     letter-spacing: theme(--letter-spacing-wider);
//   }

//   .text-body {
//     font-family: theme(--font-supreme);
//     font-size: theme(--font-size-body);
//     font-weight: 400;
//     color: theme(--color-black);
//     line-height: 1.6;
//     letter-spacing: theme(--letter-spacing-wider);
//   }

//   .text-caption {
//     font-family: theme(--font-supreme);
//     font-size: theme(--font-size-caption);
//     font-weight: 500;
//     color: theme(--color-coffee);
//     line-height: 1.5;
//     letter-spacing: theme(--letter-spacing-wider);
//   }
//   /* Button Components */
//   .btn-primary {
//     font-family: theme(--font-supreme);
//     font-weight: 500;
//     padding: 0.75rem 1.5rem;
//     border-radius: theme(--radius-button);
//     background-color: theme(--color-black);
//     color: theme(--color-cream);
//     letter-spacing: theme(--letter-spacing-wider);
//     cursor: pointer;
//     border: none;
//     position: relative;
//     overflow: hidden;
//     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//     transform: translateY(0px) scale(1);
//     will-change: transform, background-color, box-shadow;
//   }

//   .btn-primary:hover {
//     background-color: #2a2a2a;
//     transform: translateY(-2px) scale(1.02);
//     box-shadow:
//       0 8px 25px rgba(0, 0, 0, 0.15),
//       0 4px 12px rgba(0, 0, 0, 0.1);
//   }

//   .btn-primary:active {
//     transform: translateY(0px) scale(0.98);
//     box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
//     transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
//   }

//   .btn-secondary {
//     font-family: theme(--font-supreme);
//     font-weight: 500;
//     padding: 0.75rem 1.5rem;
//     border-radius: theme(--radius-button);
//     background-color: theme(--color-peach);
//     color: theme(--color-black);
//     letter-spacing: theme(--letter-spacing-wider);
//     cursor: pointer;
//     border: none;
//     position: relative;
//     overflow: hidden;
//     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//     transform: translateY(0px) scale(1);
//     will-change: transform, background-color, box-shadow, outline;
//   }

//   .btn-secondary:hover {
//     background-color: theme(--color-vanilla);
//     transform: translateY(-2px) scale(1.02);
//     box-shadow:
//       0 8px 25px rgba(255, 214, 179, 0.25),
//       0 4px 12px rgba(255, 214, 179, 0.15);
//     outline: 2px solid theme(--color-peach);
//     outline-offset: 2px;
//   }

//   .btn-secondary:active {
//     transform: translateY(0px) scale(0.98);
//     box-shadow: 0 2px 8px rgba(255, 214, 179, 0.1);
//     outline: 1px solid theme(--color-peach);
//     outline-offset: 1px;
//     transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
//   }

//   .btn-outline {
//     font-family: theme(--font-supreme);
//     font-weight: 500;
//     padding: 0.75rem 1.5rem;
//     border-radius: theme(--radius-button);
//     background-color: transparent;
//     color: theme(--color-black);
//     border: 2px solid theme(--color-black);
//     letter-spacing: theme(--letter-spacing-wider);
//     cursor: pointer;
//     position: relative;
//     overflow: hidden;
//     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//     transform: translateY(0px) scale(1);
//     will-change: transform, background-color, color, box-shadow;
//   }

//   .btn-outline:hover {
//     background-color: theme(--color-black);
//     color: theme(--color-cream);
//     border-color: theme(--color-black);
//     transform: translateY(-2px) scale(1.02);
//     box-shadow:
//       0 8px 25px rgba(0, 0, 0, 0.15),
//       0 4px 12px rgba(0, 0, 0, 0.1);
//   }

//   .btn-outline:active {
//     transform: translateY(0px) scale(0.98);
//     box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
//     transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
//   }

//   /* Card Components */
//   .card {
//     background-color: theme(--color-white);
//     border-radius: theme(--radius-card);
//     padding: theme(--spacing-card);
//     box-shadow: theme(--shadow-card);
//     border: 1px solid theme(--color-gray-400);
//     transition: all 0.2s ease;
//   }

//   /* .card:hover {
//     box-shadow: theme(--shadow-hover);
//     transform: translateY(-2px);
//     border-color: theme(--color-gray-500);
//   } */

//   .card-highlight {
//     background-color: theme(--color-vanilla);
//     border-radius: theme(--radius-card);
//     padding: theme(--spacing-card);
//     box-shadow: theme(--shadow-card);
//     border: 1px solid theme(--color-peach);
//     transition: all 0.2s ease;
//   }

//   .card-highlight:hover {
//     box-shadow: theme(--shadow-hover);
//     transform: translateY(-2px);
//   }

//   /* Form Components */
//   .input-field {
//     font-family: theme(--font-supreme);
//     width: 100%;
//     padding: 0.75rem 1rem;
//     border-radius: theme(--radius-input);
//     border: 1px solid theme(--color-gray-300);
//     background-color: theme(--color-white);
//     color: theme(--color-black);
//     letter-spacing: theme(--letter-spacing-wider);
//     transition: all 0.2s ease;
//   }

//   .input-field:focus {
//     outline: none;
//     border-color: theme(--color-peach);
//     box-shadow: 0 0 0 3px rgb(255 214 179 / 0.2);
//   }

//   .input-field::placeholder {
//     color: theme(--color-gray-400);
//     letter-spacing: theme(--letter-spacing-wider);
//   }

//   /* Navigation Components */
//   .nav-link {
//     font-family: theme(--font-supreme);
//     font-weight: 500;
//     padding: 0.5rem 1rem;
//     border-radius: theme(--radius-button);
//     color: theme(--color-coffee);
//     letter-spacing: theme(--letter-spacing-wider);
//     text-decoration: none;
//     display: inline-block;
//     position: relative;
//     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//     transform: translateY(0px) scale(1);
//     will-change: transform, background-color, color, box-shadow;
//   }

//   .nav-link:hover {
//     color: theme(--color-black);
//     background-color: theme(--color-vanilla);
//     transform: translateY(-1px) scale(1.02); /* SUBTLE SMOOTH LIFT */
//     box-shadow: 0 4px 12px rgba(249, 234, 211, 0.3);
//   }

//   .nav-link-active {
//     font-family: theme(--font-supreme);
//     font-weight: 600;
//     padding: 0.5rem 1rem;
//     border-radius: theme(--radius-button);
//     color: theme(--color-black);
//     background-color: theme(--color-peach);
//     letter-spacing: theme(--letter-spacing-wider);
//     text-decoration: none;
//     display: inline-block;
//     position: relative;
//     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//     transform: translateY(0px) scale(1);
//     box-shadow: 0 2px 8px rgba(255, 214, 179, 0.2);
//     will-change: transform, box-shadow;
//   }

//   .nav-link-active:hover {
//     transform: translateY(-1px) scale(1.02); /* SMOOTH LIFT */
//     box-shadow: 0 6px 20px rgba(255, 214, 179, 0.3);
//   }
// }

// /* UTILITY CLASSES */

// @layer utilities {
//   /* Letter Spacing Utilities */
//   .tracking-tighter {
//     letter-spacing: theme(--letter-spacing-tighter);
//   }
//   .tracking-tight {
//     letter-spacing: theme(--letter-spacing-tight);
//   }
//   .tracking-normal {
//     letter-spacing: theme(--letter-spacing-normal);
//   }
//   .tracking-wide {
//     letter-spacing: theme(--letter-spacing-wide);
//   }
//   .tracking-wider {
//     letter-spacing: theme(--letter-spacing-wider);
//   }
//   .tracking-widest {
//     letter-spacing: theme(--letter-spacing-widest);
//   }

//   /* Spacing Utilities */
//   .section-spacing {
//     margin: theme(--spacing-section) 0;
//   }

//   .element-spacing {
//     margin: theme(--spacing-element) 0;
//   }

//   /* Animation Utilities */
//   .animate-fade-in {
//     animation: fadeIn 0.5s ease-in-out;
//   }

//   .animate-slide-up {
//     animation: slideUp 0.3s ease-out;
//   }
// }

// /* ANIMATIONS */
// @keyframes fadeIn {
//   from {
//     opacity: 0;
//   }
//   to {
//     opacity: 1;
//   }
// }

// @keyframes slideUp {
//   from {
//     opacity: 0;
//     transform: translateY(20px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }

// /* Minimal Scrollbar Styling */
// ::-webkit-scrollbar {
//   width: 6px;
//   height: 6px;
// }

// ::-webkit-scrollbar-track {
//   background: white;
//   border-radius: 12px;
// }

// ::-webkit-scrollbar-thumb {
//   background: rgb(233, 185, 97);
//   border-radius: 12px;
//   transition: background 0.3s ease-in-out;
// }

// ::-webkit-scrollbar-thumb:hover {
//   background: rgb(230, 136, 102);
// }

const Test = () => {
  const [inputValue, setInputValue] = useState('');
  const [isAnimated, setIsAnimated] = useState(false);

  const handleAnimation = () => {
    setIsAnimated(!isAnimated);
  };

  return (
    <div className="p-8 space-y-8">
      
      {/* ===== HEADING TAGS (AUTO-STYLED) ===== */}
      <section className="section-spacing">
        <h1>H1: Mahima Agencies - Main Brand Title</h1>
        <h2>H2: Ice Cream Distribution Dashboard</h2>
        <h3>H3: Inventory Management Section</h3>
        <h4>H4: Product Categories</h4>
        <h5>H5: Stock Details</h5>
        <h6>H6: Last Updated Information</h6>
        <p>Regular paragraph text with Supreme font and tracking-wider spacing.</p>
      </section>

      {/* ===== CUSTOM TYPOGRAPHY CLASSES ===== */}
      <section className="section-spacing">
        <div className="text-brand">Brand Class: Mahima Agencies</div>
        <div className="text-hero">Hero Class: Welcome to Our System</div>
        <div className="text-section">Section Class: Manage Your Business</div>
        <div className="text-card-title">Card Title Class: Product Information</div>
        <div className="text-body">Body Class: This is regular body text for descriptions</div>
        <div className="text-caption">Caption Class: Small text for details and footnotes</div>
      </section>

      {/* ===== FONT FAMILIES ===== */}
      <section className="section-spacing">
        <div className="font-alpino font-bold text-2xl text-black">
          Alpino Font: Headings & Titles
        </div>
        <div className="font-supreme text-lg text-coffee">
          Supreme Font: Body text and UI elements
        </div>
      </section>

      {/* ===== COLOR PALETTE ===== */}
      <section className="section-spacing">
        <h3>Color Palette Demo:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-black text-cream p-4 rounded-lg text-center">
            Black<br />#111111
          </div>
          <div className="bg-white text-black border border-gray-300 p-4 rounded-lg text-center">
            White<br />#ffffff
          </div>
          <div className="bg-cream text-black p-4 rounded-lg text-center">
            Cream<br />#FFF4E6
          </div>
          <div className="bg-vanilla text-black p-4 rounded-lg text-center">
            Vanilla<br />#F9EAD3
          </div>
          <div className="bg-peach text-black p-4 rounded-lg text-center">
            Peach<br />#FFD6B3
          </div>
          <div className="bg-coffee text-cream p-4 rounded-lg text-center">
            Coffee<br />#2B2B2B
          </div>
          <div className="bg-gray-300 text-black p-4 rounded-lg text-center">
            Gray-300<br />#d1d5db
          </div>
          <div className="bg-gray-700 text-white p-4 rounded-lg text-center">
            Gray-700<br />#374151
          </div>
        </div>
      </section>

      {/* ===== BUTTON COMPONENTS ===== */}
      <section className="section-spacing">
        <h3>Button Components:</h3>
        <div className="flex flex-wrap gap-4 mt-4">
          <button 
            className="btn-primary"
            onClick={() => alert('Primary button clicked!')}
          >
            Primary Button
          </button>
          <button 
            className="btn-secondary"
            onClick={() => alert('Secondary button clicked!')}
          >
            Secondary Button
          </button>
          <button 
            className="btn-outline"
            onClick={() => alert('Outline button clicked!')}
          >
            Outline Button
          </button>
        </div>
        <p className="text-caption mt-2">
          Hover over buttons to see the gray hover effects!
        </p>
      </section>

      {/* ===== CARD COMPONENTS ===== */}
      <section className="section-spacing">
        <h3>Card Components:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="card">
            <h4>Regular Card</h4>
            <p className="text-body">
              This is a regular card with white background and gray-300 borders. 
              Hover to see the shadow effect.
            </p>
            <button className="btn-primary mt-4">
              Card Action
            </button>
          </div>
          
          <div className="card-highlight">
            <h4>Highlighted Card</h4>
            <p className="text-body">
              This is a highlighted card with vanilla background and peach borders.
            </p>
            <button className="btn-secondary mt-4">
              Special Action
            </button>
          </div>
        </div>
      </section>

      {/* ===== FORM COMPONENTS ===== */}
      <section className="section-spacing">
        <h3>Form Components:</h3>
        <div className="max-w-md">
          <label className="text-card-title block mb-2">Product Name</label>
          <input 
            type="text" 
            className="input-field mb-4" 
            placeholder="Enter product name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          
          <label className="text-card-title block mb-2">Description</label>
          <textarea 
            className="input-field mb-4" 
            rows="3" 
            placeholder="Enter product description"
          />
          
          <button 
            className="btn-primary w-full"
            onClick={() => {
              console.log('Form submitted with:', inputValue);
              setInputValue('');
            }}
          >
            Submit Form
          </button>
        </div>
      </section>

      {/* ===== NAVIGATION COMPONENTS ===== */}
      <section className="section-spacing">
        <h3>Navigation Components:</h3>
        <nav className="flex flex-wrap gap-4 mt-4">
          <a href="#dashboard" className="nav-link">Dashboard</a>
          <a href="#inventory" className="nav-link">Inventory</a>
          <a href="#orders" className="nav-link-active">Orders</a>
          <a href="#customers" className="nav-link">Customers</a>
          <a href="#reports" className="nav-link">Reports</a>
        </nav>
      </section>

      {/* ===== LETTER SPACING DEMO ===== */}
      <section className="section-spacing">
        <h3>Letter Spacing (Tracking) Demo:</h3>
        <div className="space-y-2">
          <div className="tracking-tight">Tracking Tight: Mahima Agencies</div>
          <div className="tracking-normal">Tracking Normal: Mahima Agencies</div>
          <div className="tracking-wide">Tracking Wide: Mahima Agencies</div>
          <div className="tracking-wider font-bold">
            Tracking Wider (Default): Mahima Agencies
          </div>
          <div className="tracking-widest">Tracking Widest: Mahima Agencies</div>
        </div>
      </section>

      {/* ===== BUSINESS CONTEXT DEMO ===== */}
      <section className="section-spacing">
        <h3>Business Context Example:</h3>
        <div className="card max-w-2xl">
          <h1>Mahima Agencies</h1>
          <p className="text-caption">
            Havmor Ice Cream Distributor - Amravati, Maharashtra
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="card-highlight text-center">
              <h4>156</h4>
              <p className="text-caption">Total Products</p>
            </div>
            <div className="card-highlight text-center">
              <h4>89</h4>
              <p className="text-caption">Active Customers</p>
            </div>
            <div className="card-highlight text-center">
              <h4>₹1,25,000</h4>
              <p className="text-caption">Monthly Revenue</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <button className="btn-primary">Add New Product</button>
            <button className="btn-secondary">Generate Report</button>
            <button className="btn-outline">Export Data</button>
          </div>
        </div>
      </section>

      {/* ===== INTERACTIVE ANIMATION DEMO ===== */}
      <section className="section-spacing">
        <h3>Animation Classes:</h3>
        <div className="flex flex-wrap gap-4">
          <div 
            className={`card ${isAnimated ? 'animate-fade-in' : ''}`}
            onClick={handleAnimation}
          >
            <h4>Fade In Animation</h4>
            <p className="text-caption">Click to trigger animation</p>
          </div>
          <div 
            className={`card ${isAnimated ? 'animate-slide-up' : ''}`}
            onClick={handleAnimation}
          >
            <h4>Slide Up Animation</h4>
            <p className="text-caption">Click to trigger animation</p>
          </div>
        </div>
        <button 
          className="btn-outline mt-4"
          onClick={handleAnimation}
        >
          {isAnimated ? 'Reset Animations' : 'Trigger Animations'}
        </button>
      </section>

      {/* ===== RESPONSIVE GRID DEMO ===== */}
      <section className="section-spacing">
        <h3>Responsive Grid Example:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="card text-center">
              <h4>Product {item}</h4>
              <p className="text-caption">Havmor Ice Cream</p>
              <div className="flex justify-between mt-4">
                <span className="text-body font-medium">₹{25 * item}</span>
                <button className="btn-secondary">Add</button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Test;
