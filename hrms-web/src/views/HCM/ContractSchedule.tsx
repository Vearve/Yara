import { Card, Table, Tag, Space, Input, DatePicker, Select, Button, Modal, Form, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import http from '../../lib/http';
import dayjs from 'dayjs';

export default function ContractSchedule() {
  const [form] = Form.useForm();
  const [pendingFilters, setPendingFilters] = useState<{ employee?: string; status?: string; dept?: number }>({});
  const [appliedFilters, setAppliedFilters] = useState<{ employee?: string; status?: string; dept?: number }>({});
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [viewModal, setViewModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch contracts
  const { data: contracts = [], isLoading: contractsLoading, refetch: refetchContracts } = useQuery({
    queryKey: ['contracts', appliedFilters],
    queryFn: async () => {
      const params: any = {};
      if (appliedFilters.employee) params.search = appliedFilters.employee;
      if (appliedFilters.status) params.status = appliedFilters.status;
      if (appliedFilters.dept) params.department_id = appliedFilters.dept;
      
      const res = await http.get('/api/v1/hcm/contracts/', { params: { page_size: 500, ...params } });
      return res.data?.results || res.data || [];
    },
  });

  // Fetch employees for enrichment
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-min'],
    queryFn: async () => {
      const res = await http.get('/api/v1/hcm/employees/', { params: { page_size: 500 } });
      return res.data?.results || res.data || [];
    },
  });

  // Fetch departments for filter
  const { data: departments = [] } = useQuery({
    queryKey: ['departments-min'],
    queryFn: async () => {
      const res = await http.get('/api/v1/hcm/departments/', { params: { page_size: 200 } });
      return res.data?.results || res.data || [];
    },
  });

  // Delete mutation
  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await http.delete(`/api/v1/hcm/contracts/${id}/`);
    },
    onSuccess: () => {
      message.success('Contract deleted');
      refetchContracts();
    },
    onError: () => message.error('Failed to delete contract'),
  });

  // Employee map for enrichment
  const employeeMap = useMemo(() => {
    const map = new Map<number, any>();
    (employees || []).forEach((e: any) => map.set(e.id, e));
    return map;
  }, [employees]);

  // Enrich contracts with employee data
  const rows = useMemo(() => {
    return (contracts || []).map((c: any, idx: number) => {
      const emp = employeeMap.get(c.employee) || {};
      return {
        key: c.id || idx,
        sn: idx + 1,
        id: c.id,
        contract_number: c.contract_number || '-',
        employee_id: emp.employee_id || '-',
        employee_name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || '-',
        department: emp.department_name || '-',
        contract_type: c.contract_type_name || '-',
        start_date: c.start_date ? dayjs(c.start_date).format('YYYY-MM-DD') : '-',
        end_date: c.end_date ? dayjs(c.end_date).format('YYYY-MM-DD') : '-',
        status: c.status || 'ACTIVE',
        basic_salary: c.basic_salary ? `${c.basic_salary} ${c.salary_currency}` : '-',
      };
    });
  }, [contracts, employeeMap]);

  const columns = [
    {
      title: 'Actions',
      dataIndex: 'id',
      width: 120,
      fixed: 'left' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <EyeOutlined
            style={{ cursor: 'pointer', color: '#1890ff' }}
            onClick={() => {
              setSelectedContract(record);
              setViewModal(true);
            }}
          />
          <EditOutlined style={{ cursor: 'pointer', color: '#52c41a' }} onClick={() => setEditingId(record.id)} />
          <DeleteOutlined
            style={{ cursor: 'pointer', color: '#ff4d4f' }}
            onClick={() => {
              Modal.confirm({
                title: 'Delete Contract',
                content: `Delete contract ${record.contract_number}?`,
                okText: 'Delete',
                okType: 'danger',
                onOk: () => deleteMut.mutate(record.id),
              });
            }}
          />
        </Space>
      ),
    },
    { title: 'S/No', dataIndex: 'sn', width: 70 },
    { title: 'Contract #', dataIndex: 'contract_number' },
    { title: 'Employee ID', dataIndex: 'employee_id' },
    { title: 'Employee Name', dataIndex: 'employee_name' },
    { title: 'Department', dataIndex: 'department' },
    { title: 'Type', dataIndex: 'contract_type' },
    { title: 'Start Date', dataIndex: 'start_date' },
    { title: 'End Date', dataIndex: 'end_date' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: string) => {
        const colors: Record<string, string> = {
          ACTIVE: 'green',
          EXPIRED: 'red',
          RENEWED: 'blue',
          TERMINATED: 'volcano',
          PENDING_RENEWAL: 'gold',
        };
        return <Tag color={colors[s] || 'default'}>{s}</Tag>;
      },
    },
    { title: 'Salary', dataIndex: 'basic_salary' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div className="mb-6 flex flex-col gap-2">
        <div className="text-sm uppercase tracking-[0.2em] text-[var(--text-dim)]">Human Capital</div>
        <h1 style={{ margin: 0, color: '#f7f8fb', fontSize: '32px', fontWeight: 700 }}>Contract Schedule</h1>
        <p style={{ margin: '8px 0 0 0', color: '#c4c8d4', fontSize: '14px' }}>Employee contract renewal tracking</p>
      </div>

      {/* Filters */}
      <Card
        style={{
          background: 'linear-gradient(135deg, rgba(15, 22, 40, 0.6) 0%, rgba(11, 15, 26, 0.4) 100%)',
          border: '1px solid rgba(245, 196, 0, 0.15)',
          borderRadius: '12px',
          marginBottom: 16,
        }}
        bodyStyle={{ padding: '16px' }}
      >
        <Space wrap>
          <Input
            placeholder="Search by employee name"
            value={pendingFilters.employee || ''}
            onChange={(e) => setPendingFilters({ ...pendingFilters, employee: e.target.value })}
            style={{ width: 220 }}
            allowClear
          />
          <Select
            allowClear
            placeholder="Filter by status"
            style={{ width: 180 }}
            value={pendingFilters.status || undefined}
            onChange={(val) => setPendingFilters({ ...pendingFilters, status: val })}
          >
            <Select.Option value="ACTIVE">Active</Select.Option>
            <Select.Option value="EXPIRED">Expired</Select.Option>
            <Select.Option value="RENEWED">Renewed</Select.Option>
            <Select.Option value="TERMINATED">Terminated</Select.Option>
            <Select.Option value="PENDING_RENEWAL">Pending Renewal</Select.Option>
          </Select>
          <Select
            allowClear
            placeholder="Filter by department"
            style={{ width: 220 }}
            value={pendingFilters.dept || undefined}
            onChange={(val) => setPendingFilters({ ...pendingFilters, dept: val })}
            options={(departments || []).map((d: any) => ({ value: d.id, label: d.name }))}
          />
          <Button
            type="primary"
            onClick={() => setAppliedFilters(pendingFilters)}
          >
            Search
          </Button>
          <Button
            onClick={() => {
              setPendingFilters({});
              setAppliedFilters({});
            }}
          >
            Reset
          </Button>
        </Space>
      </Card>

      {/* Contracts Table */}
      <Card
        style={{
          background: 'linear-gradient(135deg, rgba(15, 22, 40, 0.6) 0%, rgba(11, 15, 26, 0.4) 100%)',
          border: '1px solid rgba(245, 196, 0, 0.15)',
          borderRadius: '12px',
        }}
        bodyStyle={{ padding: '16px' }}
      >
        <Table
          columns={columns}
          dataSource={rows}
          rowKey={(r: any) => r.sn}
          scroll={{ x: 1600 }}
          style={{ color: '#f7f8fb' }}
          loading={contractsLoading}
        />
      </Card>

      {/* View Contract Modal */}
      <Modal
        title="Contract Details"
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={null}
        width={700}
      >
        {selectedContract && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><strong>Contract #:</strong> {selectedContract.contract_number}</div>
            <div><strong>Employee:</strong> {selectedContract.employee_name}</div>
            <div><strong>Employee ID:</strong> {selectedContract.employee_id}</div>
            <div><strong>Department:</strong> {selectedContract.department}</div>
            <div><strong>Contract Type:</strong> {selectedContract.contract_type}</div>
            <div><strong>Start Date:</strong> {selectedContract.start_date}</div>
            <div><strong>End Date:</strong> {selectedContract.end_date}</div>
            <div><strong>Status:</strong> {selectedContract.status}</div>
            <div><strong>Salary:</strong> {selectedContract.basic_salary}</div>
          </div>
        )}
      </Modal>
    </div>
  );
}
