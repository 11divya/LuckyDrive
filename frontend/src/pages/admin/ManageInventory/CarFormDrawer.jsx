import { useEffect, useMemo, useState } from 'react';
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Divider,
  Space,
  App as AntdApp,
} from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';

import Button from '../../../components/Button';
import {
  STATUS_OPTIONS,
  carToFormValues,
  formValuesToPayload,
  saveCar,
  formatApiError,
} from './CarForm.helper';

const labelCls = 'font-label-bold text-[11px] text-text-muted';

function SectionTitle({ children, hint }) {
  return (
    <div className="mb-4">
      <h3 className="font-display font-bold text-base text-text">{children}</h3>
      {hint && <p className="text-xs text-text-muted mt-0.5">{hint}</p>}
    </div>
  );
}

export default function CarFormDrawer({ open, mode = 'create', car, onClose, onSaved }) {
  const [form] = Form.useForm();
  const { message } = AntdApp.useApp();
  const [submitting, setSubmitting] = useState(false);

  const isEdit = mode === 'edit' && !!car;
  const initialValues = useMemo(() => carToFormValues(isEdit ? car : null), [isEdit, car]);

  // Reset the form whenever the drawer opens (and whenever the car changes).
  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue(initialValues);
    }
  }, [open, initialValues, form]);

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    try {
      const payload = formValuesToPayload(values);
      const saved = await saveCar({ carId: isEdit ? car.id : null, payload });
      message.success(isEdit ? `${saved.name} updated` : `${saved.name} added`);
      onSaved?.(saved);
    } catch (err) {
      message.error(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={Math.min(720, typeof window !== 'undefined' ? window.innerWidth : 720)}
      destroyOnClose
      maskClosable={!submitting}
      closable={!submitting}
      title={
        <div>
          <div className="font-label-bold text-[11px] text-primary">
            {isEdit ? 'EDIT LISTING' : 'NEW LISTING'}
          </div>
          <div className="font-display font-bold text-lg text-text mt-0.5">
            {isEdit ? car?.name : 'Add a new car'}
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3 py-2">
          <Button variant="ghost" icon={<CloseOutlined />} onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button icon={<SaveOutlined />} loading={submitting} onClick={handleSubmit}>
            {isEdit ? 'Save Changes' : 'Create Listing'}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={initialValues}
        className="ld-car-form"
      >
        {/* ----- Basic Info ----- */}
        <SectionTitle hint="The headline shown on every card and the public detail page.">
          Basic Info
        </SectionTitle>

        <Form.Item
          name="name"
          label={<span className={labelCls}>NAME</span>}
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input placeholder="2024 Volkswagen Golf R" size="large" />
        </Form.Item>

        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name="make" label={<span className={labelCls}>MAKE</span>}>
            <Input placeholder="Volkswagen" />
          </Form.Item>
          <Form.Item name="model" label={<span className={labelCls}>MODEL</span>}>
            <Input placeholder="Golf R" />
          </Form.Item>
          <Form.Item name="year" label={<span className={labelCls}>YEAR</span>}>
            <InputNumber min={1900} max={2100} className="w-full" />
          </Form.Item>
          <Form.Item name="color" label={<span className={labelCls}>COLOR</span>}>
            <Input placeholder="Lapiz Blue" />
          </Form.Item>
        </div>

        <Divider className="!my-6" />

        {/* ----- Vehicle Overview ----- */}
        <SectionTitle hint="Free-form description shown on the Car Details page under “Vehicle Overview”.">
          Vehicle Overview
        </SectionTitle>
        <Form.Item name="description" label={<span className={labelCls}>DESCRIPTION</span>}>
          <Input.TextArea
            rows={5}
            placeholder="Tell the story of this car. Performance, design, what makes it special."
          />
        </Form.Item>

        <Divider className="!my-6" />

        {/* ----- Specs ----- */}
        <SectionTitle>Specs</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name="engine" label={<span className={labelCls}>ENGINE</span>}>
            <Input placeholder="2.0L TSI 4Motion" />
          </Form.Item>
          <Form.Item name="mileageKm" label={<span className={labelCls}>MILEAGE (KM)</span>}>
            <InputNumber min={0} step={100} className="w-full" />
          </Form.Item>
        </div>

        <Divider className="!my-6" />

        {/* ----- Images ----- */}
        <SectionTitle hint="Paste public image URLs. The first one is used as the hero on cards.">
          Images
        </SectionTitle>
        <Form.List name="images">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, idx) => (
                <Space key={field.key} className="!flex !w-full mb-3" align="baseline">
                  <Form.Item
                    {...field}
                    name={field.name}
                    className="!mb-0 !flex-1"
                    rules={[
                      {
                        type: 'url',
                        message: 'Must be a valid URL',
                        warningOnly: true,
                      },
                    ]}
                  >
                    <Input
                      placeholder={
                        idx === 0
                          ? 'https://… (hero image)'
                          : 'https://… (gallery image)'
                      }
                      style={{ minWidth: 360 }}
                    />
                  </Form.Item>
                  {fields.length > 1 && (
                    <MinusCircleOutlined
                      className="text-text-muted hover:!text-danger cursor-pointer"
                      onClick={() => remove(field.name)}
                    />
                  )}
                </Space>
              ))}
              <Button
                size="middle"
                variant="secondary"
                icon={<PlusOutlined />}
                onClick={() => add('')}
              >
                Add image URL
              </Button>
            </>
          )}
        </Form.List>

        <Divider className="!my-6" />

        {/* ----- Pricing & Tickets ----- */}
        <SectionTitle hint="Ticket price drives every entry on this draw. Total tickets caps how many can be sold.">
          Pricing & Tickets
        </SectionTitle>
        <div className="grid gap-4 md:grid-cols-3">
          <Form.Item
            name="prizeValue"
            label={<span className={labelCls}>PRIZE VALUE (R)</span>}
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber min={1} step={1000} className="w-full" prefix="R" />
          </Form.Item>
          <Form.Item
            name="ticketPrice"
            label={<span className={labelCls}>TICKET PRICE (R)</span>}
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber min={1} step={10} className="w-full" prefix="R" />
          </Form.Item>
          <Form.Item
            name="totalTickets"
            label={<span className={labelCls}>TOTAL TICKETS</span>}
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber min={1} step={100} className="w-full" />
          </Form.Item>
        </div>

        <Divider className="!my-6" />

        {/* ----- Schedule ----- */}
        <SectionTitle>Schedule</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item
            name="drawDate"
            label={<span className={labelCls}>DRAW DATE</span>}
            rules={[{ required: true, message: 'Draw date is required' }]}
          >
            <DatePicker className="w-full" showTime={{ format: 'HH:mm' }} format="DD MMM YYYY HH:mm" />
          </Form.Item>
          <Form.Item
            name="status"
            label={<span className={labelCls}>STATUS</span>}
            rules={[{ required: true }]}
          >
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </div>

        <Divider className="!my-6" />

        {/* ----- Draw Details (FAQ) ----- */}
        <SectionTitle hint="These FAQ entries appear on the Car Details page under “Draw Details”.">
          Draw Details
        </SectionTitle>
        <Form.List name="faq">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <div
                  key={field.key}
                  className="bg-dark-50/40 border border-outline-variant/20 rounded-xl p-4 mb-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label-bold text-[10px] text-text-muted">
                      DRAW DETAIL #{field.name + 1}
                    </span>
                    <MinusCircleOutlined
                      className="text-text-muted hover:!text-danger cursor-pointer"
                      onClick={() => remove(field.name)}
                    />
                  </div>
                  <Form.Item
                    {...field}
                    name={[field.name, 'question']}
                    className="!mb-2"
                    rules={[{ required: true, message: 'Question required' }]}
                  >
                    <Input placeholder="Question" />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, 'answer']}
                    className="!mb-0"
                    rules={[{ required: true, message: 'Answer required' }]}
                  >
                    <Input.TextArea rows={3} placeholder="Answer" />
                  </Form.Item>
                </div>
              ))}
              <Button
                size="middle"
                variant="secondary"
                icon={<PlusOutlined />}
                onClick={() => add({ question: '', answer: '' })}
              >
                Add FAQ entry
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Drawer>
  );
}
