import React, { useState } from 'react';

const Test = () => {
  const [inputValue, setInputValue] = useState('');
  const [isAnimated, setIsAnimated] = useState(false);

  const handleAnimation = () => {
    setIsAnimated(!isAnimated);
  };

  return (
    <div className="space-y-8 p-8">
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
        <div className="font-alpino text-2xl font-bold text-black">
          Alpino Font: Headings & Titles
        </div>
        <div className="font-supreme text-coffee text-lg">
          Supreme Font: Body text and UI elements
        </div>
      </section>

      {/* ===== COLOR PALETTE ===== */}
      <section className="section-spacing">
        <h3>Color Palette Demo:</h3>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-cream rounded-lg bg-black p-4 text-center">
            Black
            <br />
            #111111
          </div>
          <div className="rounded-lg border border-gray-300 bg-white p-4 text-center text-black">
            White
            <br />
            #ffffff
          </div>
          <div className="bg-cream rounded-lg p-4 text-center text-black">
            Cream
            <br />
            #FFF4E6
          </div>
          <div className="bg-vanilla rounded-lg p-4 text-center text-black">
            Vanilla
            <br />
            #F9EAD3
          </div>
          <div className="bg-peach rounded-lg p-4 text-center text-black">
            Peach
            <br />
            #FFD6B3
          </div>
          <div className="bg-coffee text-cream rounded-lg p-4 text-center">
            Coffee
            <br />
            #2B2B2B
          </div>
          <div className="rounded-lg bg-gray-300 p-4 text-center text-black">
            Gray-300
            <br />
            #d1d5db
          </div>
          <div className="rounded-lg bg-gray-700 p-4 text-center text-white">
            Gray-700
            <br />
            #374151
          </div>
        </div>
      </section>

      {/* ===== BUTTON COMPONENTS ===== */}
      <section className="section-spacing">
        <h3>Button Components:</h3>
        <div className="mt-4 flex flex-wrap gap-4">
          <button className="btn-primary" onClick={() => alert('Primary button clicked!')}>
            Primary Button
          </button>
          <button className="btn-secondary" onClick={() => alert('Secondary button clicked!')}>
            Secondary Button
          </button>
          <button className="btn-outline" onClick={() => alert('Outline button clicked!')}>
            Outline Button
          </button>
        </div>
        <p className="text-caption mt-2">Hover over buttons to see the gray hover effects!</p>
      </section>

      {/* ===== CARD COMPONENTS ===== */}
      <section className="section-spacing">
        <h3>Card Components:</h3>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="card">
            <h4>Regular Card</h4>
            <p className="text-body">
              This is a regular card with white background and gray-300 borders. Hover to see the
              shadow effect.
            </p>
            <button className="btn-primary mt-4">Card Action</button>
          </div>

          <div className="card-highlight">
            <h4>Highlighted Card</h4>
            <p className="text-body">
              This is a highlighted card with vanilla background and peach borders.
            </p>
            <button className="btn-secondary mt-4">Special Action</button>
          </div>
        </div>
      </section>

      {/* ===== FORM COMPONENTS ===== */}
      <section className="section-spacing">
        <h3>Form Components:</h3>
        <div className="max-w-md">
          <label className="text-card-title mb-2 block">Product Name</label>
          <input
            type="text"
            className="input-field mb-4"
            placeholder="Enter product name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <label className="text-card-title mb-2 block">Description</label>
          <textarea className="input-field mb-4" rows="3" placeholder="Enter product description" />

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
        <nav className="mt-4 flex flex-wrap gap-4">
          <a href="#dashboard" className="nav-link">
            Dashboard
          </a>
          <a href="#inventory" className="nav-link">
            Inventory
          </a>
          <a href="#orders" className="nav-link-active">
            Orders
          </a>
          <a href="#customers" className="nav-link">
            Customers
          </a>
          <a href="#reports" className="nav-link">
            Reports
          </a>
        </nav>
      </section>

      {/* ===== LETTER SPACING DEMO ===== */}
      <section className="section-spacing">
        <h3>Letter Spacing (Tracking) Demo:</h3>
        <div className="space-y-2">
          <div className="tracking-tight">Tracking Tight: Mahima Agencies</div>
          <div className="tracking-normal">Tracking Normal: Mahima Agencies</div>
          <div className="tracking-wide">Tracking Wide: Mahima Agencies</div>
          <div className="font-bold tracking-wider">Tracking Wider (Default): Mahima Agencies</div>
          <div className="tracking-widest">Tracking Widest: Mahima Agencies</div>
        </div>
      </section>

      {/* ===== BUSINESS CONTEXT DEMO ===== */}
      <section className="section-spacing">
        <h3>Business Context Example:</h3>
        <div className="card max-w-2xl">
          <h1>Mahima Agencies</h1>
          <p className="text-caption">Havmor Ice Cream Distributor - Amravati, Maharashtra</p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
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

          <div className="mt-6 flex flex-wrap gap-4">
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
          <div className={`card ${isAnimated ? 'animate-fade-in' : ''}`} onClick={handleAnimation}>
            <h4>Fade In Animation</h4>
            <p className="text-caption">Click to trigger animation</p>
          </div>
          <div className={`card ${isAnimated ? 'animate-slide-up' : ''}`} onClick={handleAnimation}>
            <h4>Slide Up Animation</h4>
            <p className="text-caption">Click to trigger animation</p>
          </div>
        </div>
        <button className="btn-outline mt-4" onClick={handleAnimation}>
          {isAnimated ? 'Reset Animations' : 'Trigger Animations'}
        </button>
      </section>

      {/* ===== RESPONSIVE GRID DEMO ===== */}
      <section className="section-spacing">
        <h3>Responsive Grid Example:</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="card text-center">
              <h4>Product {item}</h4>
              <p className="text-caption">Havmor Ice Cream</p>
              <div className="mt-4 flex justify-between">
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
