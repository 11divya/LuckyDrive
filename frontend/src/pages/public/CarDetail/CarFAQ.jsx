import { Collapse } from 'antd';

export default function CarFAQ({ items = [] }) {
  if (!items.length) return null;
  const collapseItems = items.map((it) => ({
    key: it.key || it.question,
    label: <span className="font-display font-semibold text-base">{it.question}</span>,
    children: <p className="text-text-muted leading-relaxed">{it.answer}</p>,
  }));
  return (
    <section className="mt-10">
      <h2 className="font-display font-bold text-headline-sm text-text mb-4">Draw Details</h2>
      <Collapse
        items={collapseItems}
        bordered
        expandIconPosition="end"
        className="ld-faq"
      />
    </section>
  );
}
