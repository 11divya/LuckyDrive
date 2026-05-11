import { Link } from 'react-router-dom';

// Renders the brand artwork from /public/luckydrive-logo.svg.
// The SVG is the wide 680x260 mark (icon + LUCKYDRIVE wordmark + tagline) on
// its own dark-navy tile, designed to sit on the dark app surfaces.

// Single fixed height for all surfaces per design request.
const LOGO_HEIGHT_PX = 89;

export default function Logo({ className = '', linkTo = '/', height = LOGO_HEIGHT_PX }) {
  const h = height;
  const img = (
    <img
      src="/luckydrive-logo.svg"
      alt="LuckyDrive"
      height={h}
      style={{ height: h, width: 'auto' }}
      className={`block select-none ${className}`}
      draggable={false}
    />
  );
  return linkTo ? (
    <Link to={linkTo} aria-label="LuckyDrive home" className="inline-block">
      {img}
    </Link>
  ) : (
    img
  );
}
