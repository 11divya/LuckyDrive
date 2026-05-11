import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input, Tabs, Table, App as AntdApp } from 'antd';
import { SearchOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons';

import Button from '../../../components/Button';
import ApiService from '../../../services/api';
import {
  TAB_ITEMS,
  fetchInventory,
  filterByTab,
  filterBySearch,
} from './ManageInventory.helper';
import { buildColumns } from './inventoryColumns';
import CarFormDrawer from './CarFormDrawer';
import { formatApiError } from './CarForm.helper';

export default function ManageInventory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { message } = AntdApp.useApp();
  const [rows, setRows] = useState(null);
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');

  // Drawer state — { mode: 'create' | 'edit', car: object | null }
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', car: null });

  const reload = async () => {
    const data = await fetchInventory();
    setRows(data);
    return data;
  };

  useEffect(() => {
    reload();
  }, []);

  // Sidebar "+ New Listing" navigates here with ?new=1; honour it once.
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setDrawer({ open: true, mode: 'create', car: null });
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openCreate = () =>
    setDrawer({ open: true, mode: 'create', car: null });

  const openEdit = (row) =>
    setDrawer({ open: true, mode: 'edit', car: row });

  const closeDrawer = () =>
    setDrawer((s) => ({ ...s, open: false }));

  const handleDelete = async (row) => {
    try {
      await ApiService.adminDeleteCar(row.id);
      message.success(`${row.name} deleted`);
      await reload();
    } catch (err) {
      message.error(formatApiError(err));
    }
  };

  const filtered = useMemo(() => {
    if (!rows) return [];
    return filterBySearch(filterByTab(rows, tab), query);
  }, [rows, tab, query]);

  const columns = useMemo(
    () =>
      buildColumns({
        onEdit: openEdit,
        onView: (row) => navigate(`/cars/${row.id}`),
        onDelete: handleDelete,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate]
  );

  return (
    <div className="ld-manage-inventory">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-headline-md">Car Inventory</h1>
          <p className="text-text-muted mt-1">
            Manage active listings, configure ticket pricing, and track draw progress.
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-text-muted" />}
            placeholder="Search by model or ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="!w-72"
          />
          <Button variant="secondary" icon={<FilterOutlined />} size="middle">
            Filter
          </Button>
        </div>
      </div>

      <div className="ld-card !p-0 overflow-hidden">
        <div className="px-6 pt-2">
          <Tabs
            activeKey={tab}
            onChange={setTab}
            items={TAB_ITEMS}
            tabBarExtraContent={
              <Button
                size="middle"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                New Listing
              </Button>
            }
          />
        </div>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={rows === null}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 900 }}
        />
      </div>

      <CarFormDrawer
        open={drawer.open}
        mode={drawer.mode}
        car={drawer.car}
        onClose={closeDrawer}
        onSaved={async () => {
          closeDrawer();
          await reload();
        }}
      />
    </div>
  );
}
