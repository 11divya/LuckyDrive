import { InputNumber } from 'antd';
import { SafetyOutlined, SafetyCertificateOutlined, TrophyOutlined } from '@ant-design/icons';
import Button from '../../../components/Button';
import CountdownTimer from '../../../components/CountdownTimer';
import SalesProgress from '../../../components/SalesProgress';
import { formatZAR, formatPercent } from '../../../utils/format';

export default function TicketPurchaseRail({ car, qty, onQtyChange, total, onBuy, submitting }) {
  return (
    <aside className="ld-card sticky top-24 self-start space-y-6">
      <div className="flex items-baseline justify-between">
        <span className="font-label-bold text-xs text-text-muted">TICKET PRICE</span>
        <span className="font-display font-bold text-2xl text-primary">
          {formatZAR(car.ticketPrice)}
        </span>
      </div>

      <CountdownTimer targetDate={car.drawDate} variant="block" label="DROP CLOSES IN" />

      <div>
        <div className="flex justify-between font-label-bold text-[11px] text-text-muted mb-2">
          <span>TICKETS SOLD</span>
          <span>{formatPercent(car.ticketsSold, car.totalTickets)}</span>
        </div>
        <SalesProgress sold={car.ticketsSold} total={car.totalTickets} showLabels={false} />
        <div className="font-label-bold text-[10px] text-text-muted mt-1.5">
          GUARANTEED TO WIN A CAR
        </div>
      </div>

      <div>
        <div className="font-label-bold text-xs text-text-muted mb-2">SELECT QUANTITY</div>
        <InputNumber
          size="large"
          min={1}
          max={100}
          value={qty}
          onChange={(v) => onQtyChange(v || 1)}
          className="w-full"
        />
      </div>

      <div className="flex items-baseline justify-between border-t border-outline-variant/30 pt-4">
        <span className="text-text-muted">Total</span>
        <span className="font-display font-bold text-2xl text-text">{total}</span>
      </div>

      <Button block onClick={onBuy} loading={submitting}>
        Buy Now
      </Button>

      <div className="flex justify-around text-text-muted text-xs pt-2">
        <span className="flex flex-col items-center gap-1">
          <SafetyOutlined className="text-primary" />
          Secure
        </span>
        <span className="flex flex-col items-center gap-1">
          <SafetyCertificateOutlined className="text-primary" />
          Audited
        </span>
        <span className="flex flex-col items-center gap-1">
          <TrophyOutlined className="text-primary" />
          Verified
        </span>
      </div>
    </aside>
  );
}
