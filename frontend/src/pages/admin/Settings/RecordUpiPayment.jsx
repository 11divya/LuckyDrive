import { useState } from 'react';
import { Input, App as AntdApp } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

import Button from '../../../components/Button';
import ApiService from '../../../services/api';

export default function RecordUpiPayment() {
  const { message } = AntdApp.useApp();
  const [providerRef, setProviderRef] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMarkPaid = async () => {
    const ref = providerRef.trim();
    if (!ref) {
      message.warning('Enter the transaction reference from the customer checkout');
      return;
    }
    setLoading(true);
    try {
      const data = await ApiService.adminMarkBookingPaid(ref);
      message.success(data?.message || 'Payment marked as received');
      setProviderRef('');
    } catch (err) {
      message.error(err?.message || 'Could not record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ld-card max-w-4xl mt-10">
      <h2 className="font-display font-bold text-lg text-text">Record bank payment</h2>
      <p className="text-xs text-text-muted mt-1 mb-4 max-w-2xl">
        After you see the customer&apos;s transfer in your bank, paste their{' '}
        <strong className="text-text">payment reference</strong> from checkout here. They can then tap
        &quot;I have paid&quot; again to receive tokens.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          value={providerRef}
          onChange={(e) => setProviderRef(e.target.value)}
          placeholder="LD-XXXX-…"
          size="large"
          className="!bg-dark-200 !border-outline-variant/30 font-mono flex-1"
        />
        <Button icon={<CheckCircleOutlined />} loading={loading} onClick={handleMarkPaid}>
          Mark payment received
        </Button>
      </div>
    </div>
  );
}
