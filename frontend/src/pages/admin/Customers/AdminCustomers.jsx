import { useEffect, useState, useMemo } from 'react';
import { Table, Spin, Input, App as AntdApp } from 'antd';
import { TeamOutlined, SearchOutlined } from '@ant-design/icons';

import ApiService from '../../../services/api';
import { formatZAR } from '../../../utils/format';

function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminCustomers() {
  const { message } = AntdApp.useApp();
  const [customers, setCustomers] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await ApiService.adminCustomers();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err) {
        message.error(err?.message || 'Could not load customers');
        setCustomers([]);
      }
    })();
  }, [message]);

  const filtered = useMemo(() => {
    if (!customers) return [];
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const columns = [
    {
      title: 'NAME',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span className="font-medium text-text">{name || '—'}</span>,
    },
    {
      title: 'EMAIL',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <a href={`mailto:${email}`} className="text-text-muted hover:text-primary">
          {email}
        </a>
      ),
    },
    {
      title: 'CONTACT',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) =>
        phone ? (
          <a href={`tel:${phone.replace(/\s/g, '')}`} className="tabular-nums text-text">
            {phone}
          </a>
        ) : (
          <span className="text-text-muted">—</span>
        ),
    },
    {
      title: 'TICKETS',
      dataIndex: 'ticketCount',
      key: 'ticketCount',
      width: 90,
      align: 'right',
      render: (n) => <span className="tabular-nums text-text">{n ?? 0}</span>,
    },
    {
      title: 'TOTAL SPENT',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      width: 120,
      align: 'right',
      render: (amount) => (
        <span className="tabular-nums font-medium text-text">{formatZAR(amount)}</span>
      ),
    },
    {
      title: 'REGISTERED',
      dataIndex: 'registeredAt',
      key: 'registeredAt',
      width: 160,
      render: (d) => <span className="text-sm text-text-muted">{formatDateTime(d)}</span>,
    },
    {
      title: 'LAST LOGIN',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 160,
      render: (d) => <span className="text-sm text-text-muted">{formatDateTime(d)}</span>,
    },
  ];

  if (customers === null) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="ld-admin-customers">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-headline-md text-text">Customer Data</h1>
          <p className="text-text-muted mt-1">
            All registered customers — contact details and ticket purchase history.
          </p>
        </div>
        <span className="font-label-bold text-[11px] text-text-muted">
          {filtered.length} customer{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      <section className="ld-card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-text-muted">
            <TeamOutlined className="text-primary" />
            <span className="font-label-bold text-[11px]">CUSTOMER DIRECTORY</span>
          </div>
          <Input
            allowClear
            prefix={<SearchOutlined className="text-text-muted" />}
            placeholder="Search name, email, or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs !bg-dark-200 !border-outline-variant/30"
          />
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 15, showSizeChanger: false }}
          locale={{ emptyText: 'No customers found.' }}
          scroll={{ x: 960 }}
        />
      </section>
    </div>
  );
}
