import { useEffect, useState } from 'react';
import { Modal, Form, Select, Input, App as AntdApp } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';

import Button from '../../../components/Button';
import ApiService from '../../../services/api';

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'announced', label: 'Announced' },
  { value: 'completed', label: 'Completed' },
  { value: 'delivered', label: 'Delivered' },
];

function describe(err) {
  if (err?.details?.length) {
    return err.details.map((d) => `${d.field}: ${d.message}`).join(' · ');
  }
  return err?.message || 'Update failed';
}

export default function DrawEditModal({ open, draw, onClose, onSaved }) {
  const [form] = Form.useForm();
  const { message } = AntdApp.useApp();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && draw) {
      form.resetFields();
      form.setFieldsValue({
        status: draw.status || 'announced',
        notes: draw.notes || '',
      });
    }
  }, [open, draw, form]);

  if (!draw) return null;

  const handleSave = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    try {
      const data = await ApiService.adminUpdateDraw(draw.id, values);
      message.success('Draw updated');
      onSaved?.(data);
    } catch (err) {
      message.error(describe(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={submitting ? undefined : onClose}
      maskClosable={!submitting}
      closable={!submitting}
      destroyOnClose
      title={
        <div>
          <div className="font-label-bold text-[11px] text-primary">EDIT DRAW</div>
          <div className="font-display font-bold text-lg text-text mt-0.5">
            {draw.car?.name || 'Draw'}
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3 py-1">
          <Button
            variant="ghost"
            icon={<CloseOutlined />}
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button icon={<SaveOutlined />} loading={submitting} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" requiredMark={false} className="ld-draw-edit">
        <Form.Item
          name="status"
          label={<span className="font-label-bold text-[11px] text-text-muted">STATUS</span>}
          rules={[{ required: true, message: 'Status is required' }]}
        >
          <Select options={STATUS_OPTIONS} />
        </Form.Item>

        <Form.Item
          name="notes"
          label={
            <span className="font-label-bold text-[11px] text-text-muted">
              ADMIN NOTES
            </span>
          }
          extra="Internal — never shown to customers."
        >
          <Input.TextArea
            rows={4}
            placeholder="e.g. Keys handed over Apr 12 in Sandton. Vehicle delivered with FSH and 2 keys."
          />
        </Form.Item>

        {draw.winner && (
          <div className="bg-dark-200 border border-outline-variant/30 rounded-lg px-4 py-3 mt-2">
            <div className="font-label-bold text-[10px] text-text-muted">WINNER (read-only)</div>
            <div className="text-text font-medium mt-0.5">
              {draw.winner.name}
              <span className="text-text-muted text-xs ml-2 font-mono">
                {draw.winner.ticketCode}
              </span>
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
}
