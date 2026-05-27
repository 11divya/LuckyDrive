import { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Switch, Spin, App as AntdApp } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import Button from '../../../components/Button';
import ApiService from '../../../services/api';

function bannersToForm(banners = []) {
  return banners.map((b) => ({
    headline: b.headline || '',
    message: b.message || '',
    vehicleName: b.vehicleName || '',
    announcementDate: b.announcementDate ? dayjs(b.announcementDate) : dayjs(),
    active: b.active !== false,
  }));
}

export default function AnnouncementBannerEditor({ initialBanners, loading: parentLoading, onSaved }) {
  const [form] = Form.useForm();
  const { message } = AntdApp.useApp();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!parentLoading) {
      form.setFieldsValue({
        announcementBanners: bannersToForm(initialBanners),
      });
    }
  }, [initialBanners, parentLoading, form]);

  const handleSave = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    const slides = values.announcementBanners || [];
    if (slides.length === 0) {
      message.warning('Add at least one slide, or turn off all slides to hide the carousel.');
      return;
    }
    const payload = {
      announcementBanners: slides.map((slide, index) => ({
        headline: slide.headline.trim(),
        message: (slide.message || '').trim(),
        vehicleName: (slide.vehicleName || '').trim(),
        announcementDate: slide.announcementDate.toISOString(),
        active: slide.active !== false,
        sortOrder: index,
      })),
    };

    setSaving(true);
    try {
      const data = await ApiService.adminUpdateAnnouncements(payload);
      const saved = data.announcementBanners || [];
      form.setFieldsValue({ announcementBanners: bannersToForm(saved) });
      onSaved?.(saved);
      const live = saved.filter((b) => b.active).length;
      message.success(
        live > 0
          ? `${live} slide${live === 1 ? '' : 's'} live on the website — refresh the home page to view`
          : 'Saved — no slides are visible (turn Visible on for at least one slide)'
      );
    } catch (err) {
      if (err?.details?.length) {
        message.error(err.details.map((d) => d.message).join(' · '));
      } else {
        message.error(err?.message || 'Failed to save announcements');
      }
    } finally {
      setSaving(false);
    }
  };

  if (parentLoading) {
    return (
      <div className="ld-card flex justify-center py-16">
        <Spin />
      </div>
    );
  }

  return (
    <div className="ld-card max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
          <NotificationOutlined className="text-primary text-lg" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg text-text">Winner announcement carousel</h2>
          <p className="text-xs text-text-muted">
            Slides appear below the navbar on the public site. Tell customers when the winning
            token will be announced.
          </p>
        </div>
      </div>

      <Form form={form} layout="vertical" requiredMark={false} initialValues={{ announcementBanners: [] }}>
        <Form.List name="announcementBanners">
          {(fields, { add, remove }) => (
            <>
              {fields.length === 0 ? (
                <p className="text-text-muted text-sm mb-4 py-4 text-center border border-dashed border-outline-variant/30 rounded-lg">
                  No slides yet — add one to show the carousel on the website.
                </p>
              ) : null}

              <div className="flex flex-col gap-4 mb-4">
                {fields.map((field, index) => (
                  <div
                    key={field.key}
                    className="p-4 rounded-xl bg-dark-200/60 border border-outline-variant/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-label-bold text-[10px] text-text-muted">
                        SLIDE {index + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(field.name)}
                      >
                        Remove
                      </Button>
                    </div>

                    <Form.Item
                      {...field}
                      name={[field.name, 'headline']}
                      label={
                        <span className="font-label-bold text-xs text-text-muted">HEADLINE</span>
                      }
                      rules={[{ required: true, message: 'Headline is required' }]}
                    >
                      <Input
                        placeholder="Winning token announced soon"
                        size="large"
                        className="!bg-dark-100 !border-outline-variant/30"
                      />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      name={[field.name, 'message']}
                      label={
                        <span className="font-label-bold text-xs text-text-muted">MESSAGE</span>
                      }
                    >
                      <Input.TextArea
                        rows={2}
                        placeholder="The winning token for this draw will be published on the date below."
                        className="!bg-dark-100 !border-outline-variant/30"
                      />
                    </Form.Item>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Form.Item
                        {...field}
                        name={[field.name, 'vehicleName']}
                        label={
                          <span className="font-label-bold text-xs text-text-muted">
                            VEHICLE (OPTIONAL)
                          </span>
                        }
                      >
                        <Input
                          placeholder="2024 BMW M4 Competition"
                          size="large"
                          className="!bg-dark-100 !border-outline-variant/30"
                        />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, 'announcementDate']}
                        label={
                          <span className="font-label-bold text-xs text-text-muted">
                            ANNOUNCEMENT DATE &amp; TIME
                          </span>
                        }
                        rules={[{ required: true, message: 'Date is required' }]}
                      >
                        <DatePicker
                          showTime
                          format="DD MMM YYYY HH:mm"
                          className="w-full"
                          size="large"
                        />
                      </Form.Item>
                    </div>

                    <Form.Item
                      {...field}
                      name={[field.name, 'active']}
                      label={
                        <span className="font-label-bold text-xs text-text-muted">VISIBLE</span>
                      }
                      valuePropName="checked"
                    >
                      <Switch checkedChildren="On" unCheckedChildren="Off" />
                    </Form.Item>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-between gap-3">
                <Button
                  variant="ghost"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    add({
                      headline: '',
                      message:
                        'The winning token will be announced on the date shown — check back on announcement day.',
                      vehicleName: '',
                      announcementDate: dayjs().add(7, 'day').hour(12).minute(0),
                      active: true,
                    })
                  }
                >
                  Add slide
                </Button>
                <Button icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
                  Save carousel
                </Button>
              </div>
            </>
          )}
        </Form.List>
      </Form>
    </div>
  );
}
