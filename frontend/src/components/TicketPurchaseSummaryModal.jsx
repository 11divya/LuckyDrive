import { Modal } from 'antd';
import { Mail, User, Ticket, Car as CarIcon, Calendar } from 'lucide-react';

import Button from './Button';
import { formatZAR, formatDrawDate } from '../utils/format';

function DetailRow({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-outline-variant/20 last:border-0">
      <span className="text-text-muted text-sm shrink-0">{label}</span>
      <span
        className={`text-text text-sm text-right ${mono ? 'font-mono tabular-nums' : 'font-medium'}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function TicketPurchaseSummaryModal({
  open,
  onClose,
  customer,
  car,
  quantity,
  purchase,
}) {
  const tickets = purchase?.tickets ?? [];
  const booking = purchase?.booking;
  const email = customer?.email || '—';
  const name = customer?.name || 'Customer';

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={520}
      destroyOnClose
      className="ld-ticket-summary-modal"
      title={null}
      styles={{ body: { padding: 0 } }}
    >
      <div className="p-6 md:p-7">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto">
            <Ticket size={22} />
          </div>
          <h3 className="font-display font-bold text-xl text-text mt-3">Your Tickets</h3>
          <p className="text-sm text-text-muted mt-1">Purchase summary and token numbers.</p>
        </div>
        <section className="rounded-xl bg-dark-200 border border-outline-variant/30 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <User size={16} className="text-primary" />
            <span className="font-label-bold text-[11px] text-text-muted">CUSTOMER</span>
          </div>
          <DetailRow label="Name" value={name} />
          <DetailRow label="Email" value={email} />
          <DetailRow label="Tickets purchased" value={String(quantity ?? booking?.quantity ?? tickets.length)} />
        </section>
        <section className="rounded-xl bg-dark-200 border border-outline-variant/30 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <CarIcon size={16} className="text-primary" />
            <span className="font-label-bold text-[11px] text-text-muted">DRAW</span>
          </div>
          <DetailRow label="Vehicle" value={car?.name || purchase?.car?.name || '—'} />
          <DetailRow label="Prize value" value={formatZAR(car?.prizeValue ?? purchase?.car?.prizeValue)} />
          <DetailRow label="Ticket price" value={formatZAR(booking?.unitPrice ?? car?.ticketPrice ?? purchase?.car?.ticketPrice)} />
          <DetailRow label="Draw date" value={formatDrawDate(car?.drawDate ?? purchase?.car?.drawDate)} />
          <DetailRow label="Total paid" value={formatZAR(booking?.totalAmount)} />
          <DetailRow label="Reference" value={booking?.providerRef || '—'} mono />
        </section>
        <section className="rounded-xl bg-dark border border-primary/30 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-primary" />
            <span className="font-label-bold text-[11px] text-text-muted">TOKEN NUMBER{tickets.length > 1 ? 'S' : ''}</span>
          </div>
          <div className="space-y-2">
            {tickets.map((t, i) => (
              <div key={t.id || t.code} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-dark-200 border border-outline-variant/25">
                <span className="text-text-muted text-xs font-label-bold">#{i + 1}</span>
                <span className="font-mono font-bold text-primary tracking-wider text-sm">{t.code}</span>
              </div>
            ))}
          </div>
        </section>
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-dark-200/60 border border-outline-variant/20 mb-6">
          <Mail size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-text-muted leading-relaxed">
            Confirmation email with full ticket details was sent to <span className="text-text font-medium">{email}</span>.
          </p>
        </div>
        <Button block onClick={onClose}>Done</Button>
      </div>
    </Modal>
  );
}
