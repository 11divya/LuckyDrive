import { useEffect, useState } from 'react';
import { Form, Input, Spin, App as AntdApp } from 'antd';
import { BankOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';

import Button from '../../../components/Button';
import ApiService from '../../../services/api';
import { PAYMENT_BANK_DEFAULTS } from '../../../utils/paymentBank';
import AnnouncementBannerEditor from './AnnouncementBannerEditor';
import RecordUpiPayment from './RecordUpiPayment';

function BankPreview({ values }) {
  const rows = [
    ['Bank name', values?.bankName],
    ['Account holder', values?.accountHolderName],
    ['Account number', values?.accountNumber],
    ['Branch / IFSC', values?.branchCode],
    ['Account type', values?.accountType],
  ].filter(([, v]) => v);

  return (
    <div className="rounded-xl bg-dark-200/80 border border-outline-variant/30 p-4 space-y-3">
      <p className="font-label-bold text-[10px] text-primary">CUSTOMER CHECKOUT PREVIEW</p>
      {rows.map(([label, value]) => (
        <div key={label}>
          <div className="font-label-bold text-[10px] text-text-muted">{label.toUpperCase()}</div>
          <div className="text-sm text-text font-medium break-all">{value}</div>
        </div>
      ))}
      {values?.paymentInstructions ? (
        <p className="text-xs text-text-muted border-t border-outline-variant/20 pt-3 leading-relaxed">
          {values.paymentInstructions}
        </p>
      ) : null}
    </div>
  );
}

export default function AdminSettings() {
  const [form] = Form.useForm();
  const { message } = AntdApp.useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [announcementBanners, setAnnouncementBanners] = useState([]);

  const watched = Form.useWatch([], form);

  useEffect(() => {
    (async () => {
      try {
        const data = await ApiService.adminGetSettings();
        form.setFieldsValue({
          bankName: data.bankName,
          accountHolderName: data.accountHolderName,
          accountNumber: data.accountNumber,
          branchCode: data.branchCode,
          accountType: data.accountType,
          paymentInstructions: data.paymentInstructions,
        });
        setAnnouncementBanners(data.announcementBanners || []);
      } catch (err) {
        message.error(err?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const data = await ApiService.adminUpdateSettings(values);
      form.setFieldsValue({
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        accountNumber: data.accountNumber,
        branchCode: data.branchCode,
        accountType: data.accountType,
        paymentInstructions: data.paymentInstructions,
      });
      message.success('Bank account details updated');
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    form.setFieldsValue(PAYMENT_BANK_DEFAULTS);
    message.info('Defaults loaded — click Save Changes to apply');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="ld-admin-settings">
      <div className="mb-8">
        <h1 className="font-display font-bold text-headline-md">Settings</h1>
        <p className="text-text-muted mt-1">
          Bank transfer details at checkout, announcement carousel, and payment recording.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px] max-w-4xl">
        <div className="ld-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <BankOutlined className="text-primary text-lg" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-text">Bank account details</h2>
              <p className="text-xs text-text-muted">
                Shown to customers when they buy tickets — replace with your live account when ready.
              </p>
            </div>
          </div>

          <Form form={form} layout="vertical" requiredMark={false} className="ld-admin-form">
            <Form.Item
              name="bankName"
              label={<span className="font-label-bold text-xs text-text-muted">BANK NAME</span>}
              rules={[{ required: true, message: 'Bank name is required' }]}
            >
              <Input size="large" className="!bg-dark-200 !border-outline-variant/30" />
            </Form.Item>

            <Form.Item
              name="accountHolderName"
              label={
                <span className="font-label-bold text-xs text-text-muted">ACCOUNT HOLDER</span>
              }
              rules={[{ required: true, message: 'Account holder is required' }]}
            >
              <Input size="large" className="!bg-dark-200 !border-outline-variant/30" />
            </Form.Item>

            <Form.Item
              name="accountNumber"
              label={
                <span className="font-label-bold text-xs text-text-muted">ACCOUNT NUMBER</span>
              }
              rules={[{ required: true, message: 'Account number is required' }]}
            >
              <Input
                size="large"
                className="!bg-dark-200 !border-outline-variant/30 font-mono"
              />
            </Form.Item>

            <Form.Item
              name="branchCode"
              label={
                <span className="font-label-bold text-xs text-text-muted">
                  BRANCH CODE / IFSC
                </span>
              }
              rules={[{ required: true, message: 'Branch code or IFSC is required' }]}
            >
              <Input
                size="large"
                className="!bg-dark-200 !border-outline-variant/30 font-mono"
              />
            </Form.Item>

            <Form.Item
              name="accountType"
              label={
                <span className="font-label-bold text-xs text-text-muted">ACCOUNT TYPE</span>
              }
            >
              <Input
                placeholder="Cheque, Savings, Current…"
                size="large"
                className="!bg-dark-200 !border-outline-variant/30"
              />
            </Form.Item>

            <Form.Item
              name="paymentInstructions"
              label={
                <span className="font-label-bold text-xs text-text-muted">
                  INSTRUCTIONS FOR CUSTOMERS
                </span>
              }
            >
              <Input.TextArea
                rows={3}
                className="!bg-dark-200 !border-outline-variant/30"
              />
            </Form.Item>
          </Form>

          <div className="flex flex-wrap justify-end gap-3 mt-2">
            <Button variant="ghost" icon={<ReloadOutlined />} onClick={handleResetDefaults}>
              Reset to defaults
            </Button>
            <Button icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>

        <div className="ld-card h-fit">
          <BankPreview values={watched} />
        </div>
      </div>

      <div className="mt-10">
        <AnnouncementBannerEditor
          initialBanners={announcementBanners}
          loading={loading}
          onSaved={setAnnouncementBanners}
        />
      </div>

      <RecordUpiPayment />
    </div>
  );
}
