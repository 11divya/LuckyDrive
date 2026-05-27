import { useEffect, useMemo, useState } from 'react';
import { Form, Input, Spin, App as AntdApp } from 'antd';
import {
  SaveOutlined,
  BankOutlined,
  ReloadOutlined,
  LandmarkOutlined,
} from '@ant-design/icons';

import Button from '../../../components/Button';
import ApiService from '../../../services/api';
import { PAYMENT_BANK_DEFAULTS, mergePaymentBank } from '../../../utils/paymentBank';
import AnnouncementBannerEditor from './AnnouncementBannerEditor';
import RecordBankPayment from './RecordBankPayment';

const PREVIEW_REF = 'LD-PREVIEW';

function BankPreview({ bank }) {
  const previewText = formatBankDetailsText(bank, {
    amount: 'R 100',
    reference: PREVIEW_REF,
  });

  return (
    <div className="ld-card h-fit">
      <p className="font-label-bold text-[10px] text-text-muted mb-3">CHECKOUT PREVIEW</p>
      <div className="rounded-xl border border-outline-variant/30 bg-dark-200 p-4 space-y-3">
        <div className="font-label-bold text-[10px] text-primary">PAY BY BANK TRANSFER</div>
        {[
          ['Bank', bank.bankName],
          ['Account holder', bank.accountHolderName],
          ['Account number', bank.accountNumber],
          ['Branch code', bank.branchCode],
          ['Account type', bank.accountType],
          ['Amount to pay', 'R 100'],
          ['Payment reference', PREVIEW_REF],
        ].map(([label, value]) => (
          <div key={label}>
            <div className="font-label-bold text-[9px] text-text-muted">{label.toUpperCase()}</div>
            <div className="text-sm text-text break-all">{value}</div>
          </div>
        ))}
        {bank.bankReferenceNote ? (
          <p className="text-xs text-text-muted pt-2 border-t border-outline-variant/20">
            {bank.bankReferenceNote}
          </p>
        ) : null}
      </div>
      <p className="text-xs text-text-muted text-center mt-3">
        Customers see these details when buying tickets.
      </p>
    </div>
  );
}

export default function AdminSettings() {
  const [form] = Form.useForm();
  const { message } = AntdApp.useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [announcementBanners, setAnnouncementBanners] = useState([]);

  const bankName = Form.useWatch('bankName', form);
  const accountHolderName = Form.useWatch('accountHolderName', form);
  const accountNumber = Form.useWatch('accountNumber', form);
  const branchCode = Form.useWatch('branchCode', form);
  const accountType = Form.useWatch('accountType', form);
  const bankReferenceNote = Form.useWatch('bankReferenceNote', form);

  useEffect(() => {
    (async () => {
      try {
        const data = await ApiService.adminGetSettings();
        form.setFieldsValue(mergePaymentBank(data));
        setAnnouncementBanners(data.announcementBanners || []);
      } catch (err) {
        message.error(err?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previewBank = useMemo(
    () => ({
      bankName: bankName || PAYMENT_BANK_DEFAULTS.bankName,
      accountHolderName: accountHolderName || PAYMENT_BANK_DEFAULTS.accountHolderName,
      accountNumber: accountNumber || PAYMENT_BANK_DEFAULTS.accountNumber,
      branchCode: branchCode || PAYMENT_BANK_DEFAULTS.branchCode,
      accountType: accountType || PAYMENT_BANK_DEFAULTS.accountType,
      bankReferenceNote: bankReferenceNote ?? PAYMENT_BANK_DEFAULTS.bankReferenceNote,
    }),
    [bankName, accountHolderName, accountNumber, branchCode, accountType, bankReferenceNote]
  );

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
        bankReferenceNote: data.bankReferenceNote,
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
          Bank transfer details at checkout, winner-announcement carousel, and payment recording.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px] max-w-4xl">
        <div className="ld-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <LandmarkOutlined className="text-primary text-lg" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-text">Bank account details</h2>
              <p className="text-xs text-text-muted">
                Shown to customers when they pay for tickets via EFT / bank transfer.
              </p>
            </div>
          </div>

          <Form form={form} layout="vertical" requiredMark={false} className="ld-admin-form">
            <Form.Item
              name="bankName"
              label={
                <span className="flex items-center gap-1.5 font-label-bold text-xs text-text-muted">
                  <BankOutlined /> Bank name
                </span>
              }
              rules={[{ required: true, message: 'Bank name is required' }]}
            >
              <Input
                placeholder="First National Bank"
                size="large"
                className="!bg-dark-200 !border-outline-variant/30"
              />
            </Form.Item>

            <Form.Item
              name="accountHolderName"
              label={
                <span className="font-label-bold text-xs text-text-muted">Account holder name</span>
              }
              rules={[{ required: true, message: 'Account holder name is required' }]}
            >
              <Input
                placeholder="LuckyDrive (Pty) Ltd"
                size="large"
                className="!bg-dark-200 !border-outline-variant/30"
              />
            </Form.Item>

            <div className="grid gap-4 sm:grid-cols-2">
              <Form.Item
                name="accountNumber"
                label={
                  <span className="font-label-bold text-xs text-text-muted">Account number</span>
                }
                rules={[{ required: true, message: 'Account number is required' }]}
              >
                <Input
                  placeholder="62845678901"
                  size="large"
                  className="!bg-dark-200 !border-outline-variant/30 font-mono"
                />
              </Form.Item>

              <Form.Item
                name="branchCode"
                label={
                  <span className="font-label-bold text-xs text-text-muted">Branch code</span>
                }
                rules={[{ required: true, message: 'Branch code is required' }]}
              >
                <Input
                  placeholder="250655"
                  size="large"
                  className="!bg-dark-200 !border-outline-variant/30 font-mono"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="accountType"
              label={<span className="font-label-bold text-xs text-text-muted">Account type</span>}
            >
              <Input
                placeholder="Cheque"
                size="large"
                className="!bg-dark-200 !border-outline-variant/30"
              />
            </Form.Item>

            <Form.Item
              name="bankReferenceNote"
              label={
                <span className="font-label-bold text-xs text-text-muted">
                  Instructions for customers
                </span>
              }
              extra="Optional note shown below the account details at checkout."
            >
              <Input.TextArea
                rows={2}
                placeholder="Use the transaction reference shown at checkout as your payment reference."
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

        <BankPreview bank={previewBank} />
      </div>

      <div className="mt-10">
        <AnnouncementBannerEditor
          initialBanners={announcementBanners}
          loading={loading}
          onSaved={setAnnouncementBanners}
        />
      </div>

      <RecordBankPayment />
    </div>
  );
}
