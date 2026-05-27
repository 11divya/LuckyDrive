import { useEffect, useState } from 'react';
import { Modal, Form, Select, Input, DatePicker, App as AntdApp } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import Button from '../../../components/Button';
import ApiService from '../../../services/api';

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled (upcoming)' },
  { value: 'announced', label: 'Announced (show on Winners)' },
  { value: 'completed', label: 'Completed' },
  { value: 'delivered', label: 'Delivered' },
];

function describe(err) {
  if (err?.details?.length) {
    return err.details.map((d) => `${d.field}: ${d.message}`).join(' · ');
  }
  return err?.message || 'Update failed';
}

export default function DrawEditModal({ open, draw, onClose, onSaved, announceMode = false }) {
  const [form] = Form.useForm();
  const { message } = AntdApp.useApp();
  const [submitting, setSubmitting] = useState(false);

  const isAnnounced = !!draw?.winner;

  useEffect(() => {
    if (open && draw) {
      form.resetFields();
      form.setFieldsValue({
        status:
          announceMode || draw.winner
            ? 'announced'
            : draw.status || 'scheduled',
        drawnAt: draw.drawnAt ? dayjs(draw.drawnAt) : dayjs(),
        winnerDisplayName: draw.winnerDisplayName || draw.winner?.name || '',
        winningTicketCode: draw.winningTicketCode || draw.winner?.ticketCode || '',
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

    const publishStatus = announceMode ? 'announced' : values.status;
    const payload = {
      status: publishStatus,
      notes: values.notes,
      winnerDisplayName: values.winnerDisplayName,
      winningTicketCode: values.winningTicketCode,
      drawnAt: values.drawnAt ? values.drawnAt.toISOString() : null,
    };

    if (
      ['announced', 'completed', 'delivered'].includes(publishStatus) &&
      !payload.winningTicketCode?.trim()
    ) {
      message.warning('Enter a winning token code to announce a winner.');
      return;
    }

    setSubmitting(true);
    try {
      await ApiService.adminUpdateDraw(draw.id, payload);
      message.success(
        ['announced', 'completed', 'delivered'].includes(publishStatus)
          ? 'Winner announced on the Winners page'
          : 'Draw updated'
      );
      onSaved?.();
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
      width={520}
      title={
        <div>
          <div className="font-label-bold text-[11px] text-primary">
            {isAnnounced ? 'EDIT WINNER' : 'ANNOUNCE WINNER'}
          </div>
          <div className="font-display font-bold text-lg text-text mt-0.5">
            {draw.car?.name || 'Draw'}
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3 py-1">
          <Button variant="ghost" icon={<CloseOutlined />} onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button icon={<SaveOutlined />} loading={submitting} onClick={handleSave}>
            Save &amp; Publish
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" requiredMark={false} className="ld-draw-edit">
        {!announceMode && (
          <Form.Item
            name="status"
            label={<span className="font-label-bold text-[11px] text-text-muted">STATUS</span>}
            rules={[{ required: true }]}
          >
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        )}

        <Form.Item
          name="drawnAt"
          label={<span className="font-label-bold text-[11px] text-text-muted">DRAW DATE</span>}
          rules={[{ required: true, message: 'Draw date is required' }]}
        >
          <DatePicker className="w-full" showTime format="DD MMM YYYY HH:mm" />
        </Form.Item>

        <Form.Item
          name="winnerDisplayName"
          label={
            <span className="font-label-bold text-[11px] text-text-muted">WINNER NAME</span>
          }
          rules={[{ required: true, message: 'Winner name is required' }]}
        >
          <Input placeholder="e.g. Thando Mokoena" size="large" />
        </Form.Item>

        <Form.Item
          name="winningTicketCode"
          label={
            <span className="font-label-bold text-[11px] text-text-muted">WINNING TOKEN</span>
          }
          rules={[{ required: true, message: 'Winning token code is required' }]}
          extra="Must match a purchased token for this car, or enter a code to display publicly."
        >
          <Input placeholder="LD-XXXXXX" size="large" className="font-mono uppercase" />
        </Form.Item>

        <Form.Item
          name="notes"
          label={
            <span className="font-label-bold text-[11px] text-text-muted">ADMIN NOTES</span>
          }
          extra="Internal only — not shown on the public Winners page."
        >
          <Input.TextArea rows={3} placeholder="Delivery notes, handover date, etc." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
