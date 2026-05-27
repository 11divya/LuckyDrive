import { Phone } from 'lucide-react';

import Logo from './Logo';

const CONTACT_PHONE = '+27836567199';
const CONTACT_DISPLAY = '+27 836567199';

export default function Footer() {
  return (
    <footer className="border-t border-outline-variant/20 bg-dark mt-20">
      <div className="ld-container py-10 md:py-12">
        <div className="flex flex-col items-start gap-4">
          <Logo linkTo="/" />

          <a
            href={`tel:${CONTACT_PHONE}`}
            className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
          >
            <Phone size={14} className="text-primary flex-shrink-0" />
            <span>
              <span className="font-label-bold text-[10px] text-text-muted tracking-[0.05em] mr-2">
                CONTACT
              </span>
              <span className="text-sm tabular-nums">{CONTACT_DISPLAY}</span>
            </span>
          </a>
        </div>

        <p className="mt-8 pt-8 border-t border-outline-variant/20 text-sm text-text-muted leading-relaxed max-w-3xl">
          © {new Date().getFullYear()} LuckyDrive (Pty) Ltd. Licensed by the National Lotteries Commission.
        </p>
      </div>
    </footer>
  );
}
