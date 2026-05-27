import { useEffect, useState, useCallback } from 'react';
import { Table, Spin, Button as AntButton, App as AntdApp } from 'antd';
import { EditOutlined, TrophyOutlined, ExportOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import Button from '../../../components/Button';
import DrawEditModal from '../../public/Winners/DrawEditModal';
import { fetchDraws, formatDrawDate } from '../../public/Winners/Winners.helper';
import { formatZAR } from '../../../utils/format';

export default function AdminWinners() {
  const { message } = AntdApp.useApp();
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(null);

  const reload = useCallback(async () => {
    try {
      const fresh = await fetchDraws();
      setData(fresh);
    } catch {
      message.error('Could not load draws');
      setData({ announced: [], scheduled: [] });
    }
  }, [message]);

  useEffect(() => {
    reload();
  }, [reload]);

  const announced = data?.announced || [];
  const scheduled = data?.scheduled || [];

  const pendingColumns = [
    {
      title: 'VEHICLE',
      key: 'car',
      render: (_, row) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-14 h-10 rounded-md overflow-hidden bg-dark-200 flex-shrink-0">
            {row.car?.image && (
              <img src={row.car.image} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-text truncate">{row.car?.name || '—'}</div>
            <div className="text-xs text-text-muted">
              Draw on {formatDrawDate(row.car?.drawDate)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'PRIZE',
      key: 'prize',
      width: 140,
      render: (_, row) => formatZAR(row.car?.prizeValue),
    },
    {
      title: 'TICKETS',
      key: 'tickets',
      width: 120,
      render: (_, row) => (
        <span className="text-sm tabular-nums text-text-muted">
          {(row.car?.ticketsSold ?? 0).toLocaleString('en-ZA')} /{' '}
          {(row.car?.totalTickets ?? 0).toLocaleString('en-ZA')}
        </span>
      ),
    },
    {
      title: 'ACTION',
      key: 'action',
      width: 160,
      align: 'right',
      render: (_, row) => (
        <Button size="middle" icon={<TrophyOutlined />} onClick={() => setEditing(row)}>
          Announce winner
        </Button>
      ),
    },
  ];

  const announcedColumns = [
    {
      title: 'VEHICLE',
      key: 'car',
      render: (_, row) => (
        <div className="min-w-0">
          <div className="font-medium text-text">{row.car?.name}</div>
          <div className="text-xs text-text-muted">{formatDrawDate(row.drawnAt)}</div>
        </div>
      ),
    },
    {
      title: 'WINNER',
      dataIndex: ['winner', 'name'],
      key: 'winner',
      render: (_, row) => (
        <span className="font-medium text-text">{row.winner?.name || '—'}</span>
      ),
    },
    {
      title: 'WINNING TOKEN',
      key: 'token',
      render: (_, row) => (
        <span className="font-mono font-bold text-primary tracking-wider">
          {row.winner?.ticketCode || '—'}
        </span>
      ),
    },
    {
      title: 'ENTERED',
      key: 'entered',
      width: 100,
      render: (_, row) => (
        <span className="tabular-nums text-text-muted">
          {(row.totalTicketsEntered ?? 0).toLocaleString('en-ZA')}
        </span>
      ),
    },
    {
      title: 'ACTION',
      key: 'action',
      width: 100,
      align: 'right',
      render: (_, row) => (
        <AntButton
          type="text"
          icon={<EditOutlined />}
          onClick={() => setEditing(row)}
          className="!text-primary"
        >
          Edit
        </AntButton>
      ),
    },
  ];

  if (data === null) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="ld-admin-winners">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-headline-md text-text">Winners</h1>
          <p className="text-text-muted mt-1 max-w-xl">
            Announce winners for active draws or edit published winner details.
          </p>
        </div>
        <Link
          to="/winners"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-label-bold"
        >
          View public page <ExportOutlined />
        </Link>
      </div>

      <section className="ld-card !p-0 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-text">Pending draws</h2>
          <span className="font-label-bold text-[11px] text-text-muted">
            {scheduled.length} awaiting winner
          </span>
        </div>
        <Table
          rowKey="id"
          columns={pendingColumns}
          dataSource={scheduled}
          pagination={false}
          locale={{
            emptyText: 'No pending draws — add cars in Inventory first.',
          }}
          scroll={{ x: 720 }}
        />
      </section>

      <section className="ld-card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-text">Published winners</h2>
          <span className="font-label-bold text-[11px] text-text-muted">
            {announced.length} announced
          </span>
        </div>
        <Table
          rowKey="id"
          columns={announcedColumns}
          dataSource={announced}
          pagination={false}
          locale={{
            emptyText: 'No winners published yet — use Announce winner on a pending draw.',
          }}
          scroll={{ x: 720 }}
        />
      </section>

      <DrawEditModal
        open={!!editing}
        draw={editing}
        announceMode={!!editing && !editing.winner}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          reload();
        }}
      />
    </div>
  );
}
