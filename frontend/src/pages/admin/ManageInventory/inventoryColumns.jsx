import { Tooltip, Popconfirm, Button as AntButton } from 'antd';
import { EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import StatusPill from '../../../components/StatusPill';
import SalesProgress from '../../../components/SalesProgress';
import { formatZAR } from '../../../utils/format';

export const buildColumns = ({ onEdit, onView, onDelete }) => [
  {
    title: 'VEHICLE DETAILS',
    dataIndex: 'name',
    key: 'name',
    render: (_text, row) => (
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-16 h-12 rounded-md overflow-hidden bg-dark-200 flex-shrink-0">
          {row.images?.[0] && (
            <img src={row.images[0]} alt={row.name} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <div className="font-medium text-text truncate">{row.name}</div>
          <div className="text-xs text-text-muted">
            ID: {row.shortId || row.id} · {row.color || '—'}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'PRIZE VALUE',
    dataIndex: 'prizeValue',
    key: 'prizeValue',
    align: 'right',
    width: 160,
    render: (v) => <span className="font-display font-semibold text-text">{formatZAR(v)}</span>,
  },
  {
    title: 'TICKET PRICE',
    dataIndex: 'ticketPrice',
    key: 'ticketPrice',
    align: 'right',
    width: 130,
    render: (v) => <span className="text-text">R {Number(v).toLocaleString('en-ZA')}</span>,
  },
  {
    title: 'SALES PROGRESS',
    key: 'sales',
    width: 240,
    render: (_v, row) => {
      const pct = row.totalTickets ? Math.round((row.ticketsSold / row.totalTickets) * 100) : 0;
      return (
        <div>
          <div className="flex items-baseline justify-between text-xs text-text-muted mb-1">
            <span className="text-primary font-bold">{pct}%</span>
            <span>
              {row.ticketsSold?.toLocaleString('en-ZA')} / {row.totalTickets?.toLocaleString('en-ZA')}
            </span>
          </div>
          <SalesProgress sold={row.ticketsSold} total={row.totalTickets} showLabels={false} />
        </div>
      );
    },
  },
  {
    title: 'STATUS',
    dataIndex: 'status',
    key: 'status',
    width: 160,
    render: (s) => <StatusPill status={s === 'active' ? 'active_draw' : s} />,
  },
  {
    title: 'ACTIONS',
    key: 'actions',
    align: 'right',
    width: 140,
    render: (_v, row) => {
      const hasMintedTickets = (row.ticketsSold || 0) > 0;
      return (
        <div className="flex justify-end gap-1">
          <Tooltip title="Edit">
            <AntButton
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit?.(row)}
            />
          </Tooltip>
          <Tooltip title="View">
            <AntButton
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView?.(row)}
            />
          </Tooltip>
          <Popconfirm
            placement="topRight"
            title="Delete this car?"
            description={
              hasMintedTickets
                ? 'Cars with issued tickets cannot be deleted — mark as Draw Complete instead.'
                : 'This permanently removes the listing. This cannot be undone.'
            }
            okText="Delete"
            okButtonProps={{ danger: true, disabled: hasMintedTickets }}
            cancelText="Cancel"
            onConfirm={() => onDelete?.(row)}
          >
            <Tooltip title={hasMintedTickets ? 'Tickets issued — cannot delete' : 'Delete'}>
              <AntButton
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      );
    },
  },
];
