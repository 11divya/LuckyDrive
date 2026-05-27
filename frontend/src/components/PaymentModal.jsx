import { useEffect, useState } from 'react';
import { Modal, App as AntdApp, Spin } from 'antd';
import { Copy, CheckCircle2, ShieldCheck, Mail, Landmark } from 'lucide-react';

import Button from './Button';
import TicketPurchaseSummaryModal from './TicketPurchaseSummaryModal';
import ApiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatZAR } from '../utils/format';
import { mergePaymentBank, PAYMENT_BANK_DEFAULTS } from '../utils/paymentBank';

function genTxnRef(carId) {
  const tail = (carId || 'CAR').toString().slice(-4).toUpperCase();
  const stamp = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LD-${tail}-${stamp}-${rnd}`;
}

function BankDetailRow({ label, value, onCopy }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3 rounded-lg bg-dark-200 border border-outline-variant/30">
      <div className="min-w-0">
        <div className="font-label-bold text-[10px] text-text-muted">{label}</div>
        <div className="font-medium text-sm text-text break-all">{value}</div>
      </div>
      <button
        type="button"
        onClick={() => onCopy(value, label)}
        className="text-primary hover:text-primary-light flex-shrink-0 mt-1"
        aria-label={`Copy ${label}`}
      >
        <Copy size={16} />
      </button>
    </div>
  );
}

export default function PaymentModal({ open, onClose, car, qty, total }) {
  const { message } = AntdApp.useApp();
  const { user } = useAuth();

  const [ticketSummaryOpen, setTicketSummaryOpen] = useState(false);
  const [step, setStep] = useState('pay'); // pay | confirming | success
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
        if (!cancelled && data) setBankDetails(mergePaymentBank(data));
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

  const handleCopy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      message.success(`${label} copied`);
    } catch {
      message.error('Could not copy — select the text manually.');
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
              <div className="font-label-bold text-[11px] text-primary">PAY BY BANK TRANSFER</div>
              <h3 className="font-display font-bold text-xl text-text mt-1">{car.name}</h3>
              <p className="text-sm text-text-muted">
                {qty} ticket{qty > 1 ? 's' : ''} · Total{' '}
                <span className="font-display font-bold text-text">{formatZAR(total)}</span>
              </p>
            </div>

            <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 mb-4 flex items-center gap-3">
              <Landmark size={20} className="text-primary flex-shrink-0" />
              <p className="text-sm text-text-muted">
                Transfer the exact amount to the account below. Use the transaction reference as
                your payment reference.
              </p>
            </div>

            {configLoading ? (
              <div className="flex justify-center py-12">
                <Spin />
              </div>
            ) : (
              <div className="grid gap-2">
                <BankDetailRow
                  label="BANK"
                  value={bankDetails.bankName}
                  onCopy={handleCopy}
                />
                <BankDetailRow
                  label="ACCOUNT HOLDER"
                  value={bankDetails.accountHolderName}
                  onCopy={handleCopy}
                />
                <BankDetailRow
                  label="ACCOUNT NUMBER"
                  value={bankDetails.accountNumber}
                  onCopy={handleCopy}
                />
                <BankDetailRow
                  label="BRANCH CODE"
                  value={bankDetails.branchCode}
                  onCopy={handleCopy}
                />
                <BankDetailRow
                  label="ACCOUNT TYPE"
                  value={bankDetails.accountType}
                  onCopy={handleCopy}
                />
                <div className="px-4 py-3 rounded-lg bg-dark-300/40 border border-primary/40">
                  <div className="font-label-bold text-[10px] text-primary">AMOUNT TO PAY</div>
                  <div className="font-display font-bold text-2xl text-text tabular-nums">
                    {formatZAR(total)}
                  </div>
                </div>
                <div className="px-4 py-3 rounded-lg bg-dark-300/40 border border-primary/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-label-bold text-[10px] text-primary">
                        PAYMENT REFERENCE
                      </div>
                      <div className="font-mono text-sm font-bold text-text break-all">{txnRef}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(txnRef, 'Payment reference')}
                      className="text-primary hover:text-primary-light flex-shrink-0 mt-1"
                      aria-label="Copy payment reference"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {bankDetails.bankReferenceNote ? (
              <p className="text-xs text-text-muted mt-3 leading-relaxed">
                {bankDetails.bankReferenceNote}
              </p>
            ) : null}

            {paymentNotReceived ? (
              <div
                className="mt-5 px-4 py-3 rounded-lg bg-warning/10 border border-warning/30 text-sm text-text"
                role="alert"
              >
                <p className="font-semibold text-warning">Payment not received yet</p>
                <p className="text-text-muted mt-1 text-xs leading-relaxed">
                  We have not received your transfer for{' '}
                  <span className="font-mono text-text">{txnRef}</span>. Complete the payment, then
                  tap &quot;I have paid&quot; again.
                </p>
              </div>
            ) : null}

            <div className="flex items-center gap-2 mt-5 text-xs text-text-muted">
              <ShieldCheck size={14} className="text-primary flex-shrink-0" />
              <span>
                Tokens are issued only after your bank transfer is verified — not when you open
                this screen.
              </span>
            </div>

            <div className="grid gap-3 mt-6">
              <Button
                block
                loading={step === 'confirming'}
                disabled={configLoading || !checkoutReady}
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
                  On draw day every entered token number is published live on the Winners page.
                  The winning token will be revealed on stage.
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
