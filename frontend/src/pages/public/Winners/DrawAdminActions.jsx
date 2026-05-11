import { useState } from 'react';
import { Tooltip, Popconfirm, Button as AntButton, App as AntdApp } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

import { useAuth } from '../../../context/AuthContext';
import ApiService from '../../../services/api';
import DrawEditModal from './DrawEditModal';

// Renders nothing for non-admin viewers — the Winners page is public, so most
// visitors should never see these affordances.

function describeError(err) {
  if (err?.details?.length) {
    return err.details.map((d) => `${d.field}: ${d.message}`).join(' · ');
  }
  return err?.message || 'Action failed';
}

export default function DrawAdminActions({ draw, onChanged }) {
  const { user } = useAuth();
  const { message } = AntdApp.useApp();
  const [editing, setEditing] = useState(false);

  if (user?.role !== 'admin' || !draw) return null;

  const handleDelete = async () => {
    try {
      await ApiService.adminDeleteDraw(draw.id);
      message.success(
        draw.winner
          ? 'Draw deleted — winning ticket badge removed.'
          : 'Scheduled draw removed.'
      );
      onChanged?.();
    } catch (err) {
      message.error(describeError(err));
    }
  };

  const isAnnounced = !!draw.winner;

  return (
    <>
      <div
        className="inline-flex items-center gap-1 px-1 py-1 rounded-full bg-dark-200/80 border border-outline-variant/30"
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip title="Edit draw">
          <AntButton
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => setEditing(true)}
          />
        </Tooltip>
        <Popconfirm
          placement="topRight"
          title={isAnnounced ? 'Remove this winner?' : 'Cancel this scheduled draw?'}
          description={
            isAnnounced
              ? 'This un-marks the winning ticket and removes the public announcement. The car listing itself is untouched.'
              : 'This removes the upcoming-draw card from the Winners page. The car listing itself is untouched.'
          }
          okText={isAnnounced ? 'Delete' : 'Cancel draw'}
          okButtonProps={{ danger: true }}
          cancelText="Keep"
          onConfirm={handleDelete}
        >
          <Tooltip title={isAnnounced ? 'Delete winner' : 'Cancel draw'}>
            <AntButton
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        </Popconfirm>
      </div>

      <DrawEditModal
        open={editing}
        draw={draw}
        onClose={() => setEditing(false)}
        onSaved={() => {
          setEditing(false);
          onChanged?.();
        }}
      />
    </>
  );
}
