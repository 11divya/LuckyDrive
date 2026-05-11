import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, App as AntdApp } from 'antd';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Copy, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

import Button from './Button';
import ApiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatZAR } from '../utils/format';

const MERCHANT_VPA = 'luckydrive@oksbi';
const MERCHANT_NAME = 'LuckyDrive';
const QR_TTL_SECONDS = 5 * 60;

function buildUpiUri({ vpa, name, amount, note }) {
  const params = new URLSearchParams({
    pa: vpa,
    pn: name,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

function genTxnRef(carId) {
  const tail = (carId || 'CAR').toString().slice(-4).toUpperCase();
  const stamp = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LD-${tail}-${stamp}-${rnd}`;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function PaymentModal({ open, onClose, car, qty, total }) {
  const { message } = AntdApp.useApp();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState('qr'); // qr | confirming | success
  const [secondsLeft, setSecondsLeft] = useState(QR_TTL_SECONDS);
  const [txnRef, setTxnRef] = useState(() => genTxnRef(car?.id));
  const [purchase, setPurchase] = useState(null); // { tickets: [], booking, message }

  // Reset state every time the modal opens.
  useEffect(() => {
    if (open) {
      setStep('qr');
      setSecondsLeft(QR_TTL_SECONDS);
      setTxnRef(genTxnRef(car?.id));
      setPurchase(null);
    }
  }, [open, car?.id]);

  // Countdown timer for QR validity.
  useEffect(() => {
    if (!open || step !== 'qr') return undefined;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [open, step]);

  const upiUri = useMemo(() => {
    if (!car) return '';
    return buildUpiUri({
      vpa: MERCHANT_VPA,
      name: MERCHANT_NAME,
      amount: qty * (car.ticketPrice || 0),
      note: txnRef,
    });
  }, [car, qty, txnRef]);

  const ttlLabel = `${pad(Math.floor(secondsLeft / 60))}:${pad(secondsLeft % 60)}`;
  const expired = secondsLeft <= 0;

  const handleConfirm = async () => {
    setStep('confirming');
    try {
      const data = await ApiService.purchaseTickets({
        carId: car.id,
        quantity: qty,
      });
      setPurchase(data);
      setStep('success');
      message.success(data?.message || 'Payment confirmed. Tokens issued.');
    } catch (err) {
      message.error(err?.message || 'Payment failed. Please try again.');
      setStep('qr');
    }
  };

  const handleCopyVpa = async () => {
    try {
      await navigator.clipboard.writeText(MERCHANT_VPA);
      message.success('UPI ID copied');
    } catch {
      message.error('Could not copy — long-press the ID instead.');
    }
  };

  const handleClose = () => {
    if (step === 'confirming') return;
    onClose?.();
  };

  if (!car) return null;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      destroyOnClose
      width={460}
      maskClosable={step !== 'confirming'}
      closable={step !== 'confirming'}
      className="ld-payment-modal"
      styles={{ body: { padding: 0 } }}
    >
      {step !== 'success' ? (
        <div className="p-6 md:p-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-label-bold text-[11px] text-primary">PAY WITH UPI</div>
              <h3 className="font-display font-bold text-xl text-text mt-1">{car.name}</h3>
              <p className="text-sm text-text-muted">
                {qty} ticket{qty > 1 ? 's' : ''} · Total{' '}
                <span className="font-display font-bold text-text">{formatZAR(total)}</span>
              </p>
            </div>
          </div>

          {/* QR tile */}
          <div className="bg-white rounded-xl p-5 mx-auto w-fit shadow-card relative">
            <QRCodeSVG
              value={upiUri}
              size={208}
              level="M"
              includeMargin={false}
              imageSettings={{
                src: '/luckydrive-icon.svg',
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
            {expired && (
              <div className="absolute inset-0 bg-white/85 rounded-xl flex flex-col items-center justify-center text-center px-4">
                <span className="font-label-bold text-xs text-dark mb-2">QR EXPIRED</span>
                <button
                  type="button"
                  onClick={() => {
                    setSecondsLeft(QR_TTL_SECONDS);
                    setTxnRef(genTxnRef(car.id));
                  }}
                  className="text-primary font-bold text-sm hover:underline"
                >
                  Generate new code
                </button>
              </div>
            )}
          </div>

          <div className="text-center mt-4 flex items-center justify-center gap-2 text-text-muted text-sm">
            <Smartphone size={16} className="text-primary" />
            <span>
              Scan with any UPI app — Google Pay, PhonePe, Paytm, BHIM
            </span>
          </div>

          {/* VPA + copy + countdown */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCopyVpa}
              className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg bg-dark-200 border border-outline-variant/30 hover:border-primary/50 transition-colors text-left"
            >
              <div className="min-w-0">
                <div className="font-label-bold text-[10px] text-text-muted">UPI ID</div>
                <div className="font-medium text-sm truncate">{MERCHANT_VPA}</div>
              </div>
              <Copy size={16} className="text-primary flex-shrink-0" />
            </button>
            <div className="px-4 py-3 rounded-lg bg-dark-200 border border-outline-variant/30">
              <div className="font-label-bold text-[10px] text-text-muted">QR EXPIRES IN</div>
              <div
                className={`font-display font-bold text-lg tabular-nums ${
                  expired ? 'text-danger' : 'text-text'
                }`}
              >
                {ttlLabel}
              </div>
            </div>
          </div>

          <div className="mt-3 px-1">
            <div className="font-label-bold text-[10px] text-text-muted mb-1">TRANSACTION REF</div>
            <div className="font-mono text-xs text-text break-all">{txnRef}</div>
          </div>

          <div className="flex items-center gap-2 mt-5 text-xs text-text-muted">
            <ShieldCheck size={14} className="text-primary flex-shrink-0" />
            <span>
              Audited mock checkout — no money will be transferred in this demo environment.
            </span>
          </div>

          {/* Actions */}
          <div className="grid gap-3 mt-6">
            <Button
              block
              loading={step === 'confirming'}
              disabled={expired}
              onClick={handleConfirm}
            >
              I have paid
            </Button>
            <Button block variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-7 md:p-8">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="font-display font-bold text-2xl text-text mt-4">Payment Confirmed</h3>
            <p className="text-text-muted mt-2 max-w-sm mx-auto">
              Your <span className="text-text font-medium">{qty} ticket{qty > 1 ? 's' : ''}</span> for{' '}
              <span className="text-text font-medium">{car.name}</span> {qty > 1 ? 'are' : 'is'}{' '}
              locked in.
            </p>
          </div>

          {/* Token numbers */}
          {purchase?.tickets?.length > 0 && (
            <div className="mt-6 px-4 py-5 rounded-xl bg-dark-200 border border-outline-variant/30">
              <div className="font-label-bold text-[10px] text-text-muted text-center mb-3">
                YOUR UNIQUE TOKEN NUMBER{purchase.tickets.length > 1 ? 'S' : ''}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {purchase.tickets.map((t) => (
                  <span
                    key={t.id}
                    className="px-3 py-1.5 rounded-md bg-dark border border-primary/40 font-mono text-sm font-bold text-primary tracking-wider"
                  >
                    {t.code}
                  </span>
                ))}
              </div>
              <p className="text-xs text-text-muted text-center leading-relaxed mt-4">
                On draw day every entered token number is published live on the Winners page.
                The winning token will be revealed on stage.
              </p>
            </div>
          )}

          {/* Email confirmation */}
          <div className="flex items-center gap-3 mt-4 px-4 py-3 rounded-lg bg-dark-200/60 border border-outline-variant/20">
            <Mail size={16} className="text-primary flex-shrink-0" />
            <div className="text-xs text-text-muted">
              Confirmation email with all token numbers sent to{' '}
              <span className="text-text font-medium">{user?.email || 'your inbox'}</span>.
            </div>
          </div>

          <div className="mt-3 px-1 text-center">
            <span className="font-label-bold text-[10px] text-text-muted">REF · </span>
            <span className="font-mono text-xs text-text">
              {purchase?.booking?.providerRef || txnRef}
            </span>
          </div>

          <div className="grid gap-3 mt-6">
            <Button block onClick={() => navigate('/dashboard')}>
              View My Tickets
            </Button>
            <Button block variant="ghost" onClick={handleClose}>
              Continue Browsing
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
