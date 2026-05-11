import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-outline-variant/20 bg-dark mt-20">
      <div className="ld-container py-10 grid gap-8 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-text-muted leading-relaxed">
            © {new Date().getFullYear()} LuckyDrive (Pty) Ltd. Licensed by the National Lotteries Commission.
          </p>
        </div>
        <div>
          <div className="font-label-bold text-xs text-text-muted mb-3">EXPLORE</div>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="text-text hover:text-primary">Browse Cars</a></li>
            <li><a href="/draws" className="text-text hover:text-primary">Live Draws</a></li>
            <li><a href="/winners" className="text-text hover:text-primary">Winners</a></li>
          </ul>
        </div>
        <div>
          <div className="font-label-bold text-xs text-text-muted mb-3">LEGAL</div>
          <ul className="space-y-2 text-sm">
            <li><a href="/privacy" className="text-text hover:text-primary">Privacy Policy</a></li>
            <li><a href="/terms" className="text-text hover:text-primary">Terms &amp; Conditions</a></li>
            <li><a href="/responsible" className="text-text hover:text-primary">Responsible Gambling</a></li>
            <li><a href="/contact" className="text-text hover:text-primary">Contact Us</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
