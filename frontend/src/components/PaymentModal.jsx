import { useEffect, useState } from 'react';
import { Modal, App as AntdApp, Spin } from 'antd';
import { Building2, Copy, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

import Button from './Button';
import TicketPurchaseSummaryModal from './TicketPurchaseSummaryModal';
import ApiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatZAR } from '../utils/format';
import { normalizePaymentBank, PAYMENT_BANK_DEFAULTS } from '../utils/paymentBank';

const PAYMENT_TTL_SECONDS = 5 * 60;

function genTxnRef(carId) {
  const tail = (carId || 'CAR').toString().slice(-4).toUpperCase();
  const stamp = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LD-${tail}-${stamp}-${rnd}`;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function BankDetailRow({ label, value, onCopy, mono = false }) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-dark-200 border border-outline-variant/30 hover:border-primary/50 transition-colors text-left"
    >
      <div className="min-w-0">
        <div className="font-label-bold text-[10px] text-text-muted">{label}</div>
        <div
          className={`font-medium text-sm text-text break-all ${mono ? 'font-mono tracking-wide' : ''}`}
        >
          {value}
        </div>
      </div>
      <Copy size={16} className="text-primary flex-shrink-0" />
    </button>
  );
}

export default function PaymentModal({ open, onClose, car, qty, total }) {
  const { message } = AntdApp.useApp();
  const { user } = useAuth();

  const [ticketSummaryOpen, setTicketSummaryOpen] = useState(false);
  const [step, setStep] = useState('pay');
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_TTL_SECONDS);
  const [txnRef, setTxnRef] = useState(() => genTxnRef(car?.id));
  const [purchase, setPurchase] = useState(null);
  const [paymentNotReceived, setPaymentNotReceived] = useState(false);
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [bankDetails, setBankDetails] = useState(PAYMENT_BANK_DEFAULTS);
  const [configLoading, setConfigLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setConfigLoading(true);
      try {
        const data = await ApiService.getPaymentSettings();
        if (!cancelled && data) setBankDetails(normalizePaymentBank(data));
      } catch {
        if (!cancelled) setBankDetails(PAYMENT_BANK_DEFAULTS);
      } finally {
        if (!cancelled) setConfigLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setStep('pay');
      setSecondsLeft(PAYMENT_TTL_SECONDS);
      setTxnRef(genTxnRef(car?.id));
      setPurchase(null);
      setTicketSummaryOpen(false);
      setPaymentNotReceived(false);
      setCheckoutReady(false);
    }
  }, [open, car?.id]);

  useEffect(() => {
    if (!open || !car?.id || !user) return undefined;

    let cancelled = false;
    const ref = txnRef;

    (async () => {
      try {
        await ApiService.initTicketCheckout({
          carId: car.id,
          quantity: qty,
          providerRef: ref,
        });
        if (!cancelled) setCheckoutReady(true);
      } catch (err) {
        if (!cancelled) {
          setCheckoutReady(false);
          message.error(err?.message || 'Could not start checkout');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, car?.id, qty, txnRef, user, message]);

  useEffect(() => {
    if (!open || step !== 'pay') return undefined;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [open, step]);

  const ttlLabel = `${pad(Math.floor(secondsLeft / 60))}:${pad(secondsLeft % 60)}`;
  const expired = secondsLeft <= 0;

  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(`${label} copied`);
    } catch {
      message.error('Could not copy — select and copy manually.');
    }
  };

  const handleConfirm = async () => {
    if (!checkoutReady) {
      message.warning('Checkout is still loading. Please wait a moment.');
      return;
    }

    setStep('confirming');
    setPaymentNotReceived(false);
    try {
      const data = await ApiService.confirmTicketPurchase({ providerRef: txnRef });
      setPurchase(data);
      setStep('success');
      message.success(data?.message || 'Payment confirmed. Tokens issued.');
    } catch (err) {
      const notReceived =
        err?.message?.toLowerCase().includes('payment not received') ||
        err?.message?.toLowerCase().includes('not received yet');
      if (notReceived) {
        setPaymentNotReceived(true);
        message.warning(err.message);
      } else {
        message.error(err?.message || 'Payment failed. Please try again.');
      }
      setStep('pay');
    }
  };

  const handleClose = () => {
    if (step === 'confirming') return;
    onClose?.();
  };

  const resetSession = () => {
    setSecondsLeft(PAYMENT_TTL_SECONDS);
    setTxnRef(genTxnRef(car?.id));
    setCheckoutReady(false);
    setPaymentNotReceived(false);
  };

  if (!car) return null;

  return (
    <>
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
            <div className="mb-4">
              <div className="font-label-bold text-[11px] text-primary">BANK TRANSFER</div>
              <h3 className="font-display font-bold text-xl text-text mt-1">{car.name}</h3>
              <p className="text-sm text-text-muted">
                {qty} ticket{qty > 1 ? 's' : ''} · Transfer{' '}
                <span className="font-display font-bold text-primary">{formatZAR(total)}</span>
              </p>
            </div>

            {configLoading ? (
              <div className="flex justify-center py-12">
                <Spin />
              </div>
            ) : (
              <>
                <div className="rounded-xl bg-dark-200/80 border border-outline-variant/30 p-4">
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <Building2 size={18} />
                    <span className="font-label-bold text-[11px] tracking-[0.08em]">
                      PAY INTO THIS ACCOUNT
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <BankDetailRow
                      label="BANK NAME"
                      value={bankDetails.bankName}
                      onCopy={() => copyText(bankDetails.bankName, 'Bank name')}
                    />
                    <BankDetailRow
                      label="ACCOUNT HOLDER"
                      value={bankDetails.accountHolderName}
                      onCopy={() => copyText(bankDetails.accountHolderName, 'Account holder')}
                    />
                    <BankDetailRow
                      label="ACCOUNT NUMBER"
                      value={bankDetails.accountNumber}
                      mono
                      onCopy={() => copyText(bankDetails.accountNumber, 'Account number')}
                    />
                    <BankDetailRow
                      label="BRANCH CODE / IFSC"
                      value={bankDetails.branchCode}
                      mono
                      onCopy={() => copyText(bankDetails.branchCode, 'Branch code')}
                    />
                    {bankDetails.accountType ? (
                      <BankDetailRow
                        label="ACCOUNT TYPE"
                        value={bankDetails.accountType}
                        onCopy={() => copyText(bankDetails.accountType, 'Account type')}
                      />
                    ) : null}
                  </div>
                </div>

                {bankDetails.paymentInstructions ? (
                  <p className="text-xs text-text-muted mt-3 leading-relaxed">
                    {bankDetails.paymentInstructions}
                  </p>
                ) : null}
              </>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="px-4 py-3 rounded-lg bg-dark-200 border border-outline-variant/30 col-span-2">
                <div className="font-label-bold text-[10px] text-text-muted mb-1">
                  PAYMENT REFERENCE (REQUIRED)
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm text-primary font-bold break-all">{txnRef}</span>
                  <button
                    type="button"
                    onClick={() => copyText(txnRef, 'Reference')}
                    className="text-primary flex-shrink-0 p-1"
                    aria-label="Copy reference"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <div className="px-4 py-3 rounded-lg bg-dark-200 border border-outline-variant/30">
                <div className="font-label-bold text-[10px] text-text-muted">AMOUNT</div>
                <div className="font-display font-bold text-lg text-text tabular-nums">
                  {formatZAR(total)}
                </div>
              </div>
              <div className="px-4 py-3 rounded-lg bg-dark-200 border border-outline-variant/30">
                <div className="font-label-bold text-[10px] text-text-muted">COMPLETE WITHIN</div>
                <div
                  className={`font-display font-bold text-lg tabular-nums ${
                    expired ? 'text-danger' : 'text-text'
                  }`}
                >
                  {ttlLabel}
                </div>
              </div>
            </div>

            {expired && !configLoading ? (
              <button
                type="button"
                onClick={resetSession}
                className="mt-3 text-primary font-bold text-sm hover:underline"
              >
                Start a new payment session
              </button>
            ) : null}

            {paymentNotReceived ? (
              <div
                className="mt-5 px-4 py-3 rounded-lg bg-warning/10 border border-warning/30 text-sm text-text"
                role="alert"
              >
                <p className="font-semibold text-warning">Payment not received yet</p>
                <p className="text-text-muted mt-1 text-xs leading-relaxed">
                  We have not received your transfer for reference{' '}
                  <span className="font-mono text-text">{txnRef}</span>. Complete the bank transfer,
                  then tap &quot;I have paid&quot; again.
                </p>
              </div>
            ) : null}

            <div className="flex items-center gap-2 mt-5 text-xs text-text-muted">
              <ShieldCheck size={14} className="text-primary flex-shrink-0" />
              <span>
                Tokens are issued only after your payment is verified — not when you open this
                screen.
              </span>
            </div>

            <div className="grid gap-3 mt-6">
              <Button
                block
                loading={step === 'confirming'}
                disabled={expired || configLoading || !checkoutReady}
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
                Your <span className="text-text font-medium">{qty} ticket{qty > 1 ? 's' : ''}</span>{' '}
                for <span className="text-text font-medium">{car.name}</span>{' '}
                {qty > 1 ? 'are' : 'is'} locked in.
              </p>
            </div>

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
                  On draw day every entered token number is published live on the Winners page. The
                  winning token will be revealed on stage.
                </p>
              </div>
            )}

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
              <Button block onClick={() => setTicketSummaryOpen(true)}>
                View My Tickets
              </Button>
              <Button block variant="ghost" onClick={handleClose}>
                Continue Browsing
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <TicketPurchaseSummaryModal
        open={ticketSummaryOpen}
        onClose={() => setTicketSummaryOpen(false)}
        customer={{
          email: purchase?.customer?.email || user?.email,
          name: purchase?.customer?.name || user?.name,
        }}
        car={car}
        quantity={qty}
        purchase={purchase}
      />
    </>
  );
}
