import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Image,
  message,
  Row,
  Col,
  DatePicker,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  LineChartOutlined,
  StopOutlined,
  UndoOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import {
  getMaterialsWithROI,
  exportMaterials,
  eliminateMaterial,
  restoreMaterial,
} from '../api/roi';
import type { MaterialROIItem, ROIFilterParams } from '../api/roi';

const { RangePicker } = DatePicker;

function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null) return '-';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatPercent(val: number | null | undefined): string {
  if (val == null) return '-';
  return `${val.toFixed(2)}%`;
}

function formatNumber(val: number | null | undefined): string {
  if (val == null) return '-';
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MaterialListPage() {
  const [form] = Form.useForm();
  const [data, setData] = useState<MaterialROIItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [dateRangeType, setDateRangeType] = useState<string>('all');
  const [customDateRange, setCustomDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const fetchData = useCallback(async (params?: ROIFilterParams) => {
    setLoading(true);
    try {
      const result = await getMaterialsWithROI(params) as unknown as { total: number; items: MaterialROIItem[] };
      setData(result.items);
      setTotal(result.total);
    } catch {
      message.error('获取素材列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const buildParams = useCallback((): ROIFilterParams => {
    const values = form.getFieldsValue();
    const params: ROIFilterParams = {
      skip: (page - 1) * pageSize,
      limit: pageSize,
    };
    if (values.roiMin != null) params.roi_min = values.roiMin;
    if (values.roiMax != null) params.roi_max = values.roiMax;
    if (values.materialType) params.material_type = values.materialType;
    if (values.durationMin != null) params.duration_min = values.durationMin;
    if (values.durationMax != null) params.duration_max = values.durationMax;
    if (values.dateRangeType) params.date_range_type = values.dateRangeType;
    if (values.status) params.status = values.status;
    if (values.sortBy) params.sort_by = values.sortBy;
    if (values.sortOrder) params.sort_order = values.sortOrder;
    if (values.dateRangeType === 'custom' && customDateRange) {
      params.start_date = customDateRange[0].format('YYYY-MM-DD');
      params.end_date = customDateRange[1].format('YYYY-MM-DD');
    }
    return params;
  }, [form, page, pageSize, customDateRange]);

  useEffect(() => {
    fetchData(buildParams());
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(1);
    fetchData(buildParams());
  };

  const handleReset = () => {
    form.resetFields();
    setDateRangeType('all');
    setCustomDateRange(null);
    setPage(1);
    fetchData({ skip: 0, limit: pageSize });
  };

  const handleMarkElimination = async (id: number) => {
    try {
      await eliminateMaterial(id);
      message.success('已标记为待淘汰');
      fetchData(buildParams());
    } catch {
      message.error('操作失败');
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreMaterial(id);
      message.success('已恢复素材');
      fetchData(buildParams());
    } catch {
      message.error('操作失败');
    }
  };

  const handleExport = async () => {
    try {
      const params = buildParams();
      delete params.skip;
      delete params.limit;
      const blob = await exportMaterials(params) as unknown as Blob;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `materials_roi_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      message.error('导出失败');
    }
  };

  const columns: ColumnsType<MaterialROIItem> = [
    {
      title: '封面',
      dataIndex: 'coverUrl',
      key: 'coverUrl',
      width: 80,
      render: (url: string) =>
        url ? <Image src={url} width={60} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} /> : '-',
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'materialType',
      key: 'materialType',
      width: 80,
      render: (v: string) => v === 'video' ? <Tag color="blue">视频</Tag> : <Tag color="orange">图片</Tag>,
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      render: (v: number) => formatDuration(v),
    },
    {
      title: 'ROI',
      dataIndex: 'roi',
      key: 'roi',
      width: 100,
      render: (v: number | null, record: MaterialROIItem) => {
        const color = record.roiLabel === 'high' ? '#52c41a' : record.roiLabel === 'low' ? '#ff4d4f' : undefined;
        return <span style={{ color, fontWeight: color ? 600 : 400 }}>{formatPercent(v)}</span>;
      },
    },
    {
      title: '单豆产出',
      dataIndex: 'beanOutput',
      key: 'beanOutput',
      width: 100,
      render: (v: number | null) => v != null ? v.toFixed(2) : '-',
    },
    {
      title: '点击率',
      dataIndex: 'ctr',
      key: 'ctr',
      width: 90,
      render: (v: number | null) => formatPercent(v),
    },
    {
      title: '互动率',
      dataIndex: 'interactionRate',
      key: 'interactionRate',
      width: 90,
      render: (v: number | null) => formatPercent(v),
    },
    {
      title: '转化率',
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      width: 90,
      render: (v: number | null) => formatPercent(v),
    },
    {
      title: '微信豆消耗',
      dataIndex: 'totalBeanCost',
      key: 'totalBeanCost',
      width: 110,
      render: (v: number) => formatNumber(v),
    },
    {
      title: 'GMV',
      dataIndex: 'totalGmv',
      key: 'totalGmv',
      width: 110,
      render: (v: number) => formatNumber(v),
    },
    {
      title: 'ROI标签',
      dataIndex: 'roiLabel',
      key: 'roiLabel',
      width: 90,
      render: (v: string | null) => {
        if (v === 'high') return <Tag color="green">高ROI</Tag>;
        if (v === 'low') return <Tag color="red">低ROI</Tag>;
        return '-';
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) =>
        v === 'active' ? <Tag color="success">正常</Tag> : <Tag color="warning">待淘汰</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: MaterialROIItem) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<LineChartOutlined />}
            onClick={() => message.info(`查看素材 #${record.id} 趋势`)}
          >
            趋势
          </Button>
          {record.status === 'active' ? (
            <Button
              type="link"
              size="small"
              danger
              icon={<StopOutlined />}
              onClick={() => handleMarkElimination(record.id)}
            >
              标记淘汰
            </Button>
          ) : (
            <Button
              type="link"
              size="small"
              style={{ color: '#52c41a' }}
              icon={<UndoOutlined />}
              onClick={() => handleRestore(record.id)}
            >
              恢复
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card title="筛选条件">
        <Form form={form} layout="inline" style={{ flexWrap: 'wrap', gap: '8px 0' }}>
          <Row gutter={[16, 12]} style={{ width: '100%' }}>
            <Col span={4}>
              <Form.Item label="ROI最小" name="roiMin">
                <InputNumber placeholder="最小" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="ROI最大" name="roiMax">
                <InputNumber placeholder="最大" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="素材类型" name="materialType">
                <Select placeholder="全部" allowClear style={{ width: '100%' }}>
                  <Select.Option value="video">视频</Select.Option>
                  <Select.Option value="image">图片</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="时长(秒)最小" name="durationMin">
                <InputNumber placeholder="最小" min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="时长(秒)最大" name="durationMax">
                <InputNumber placeholder="最大" min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="时间范围" name="dateRangeType">
                <Select
                  style={{ width: '100%' }}
                  value={dateRangeType}
                  onChange={(v) => setDateRangeType(v)}
                >
                  <Select.Option value="all">全部</Select.Option>
                  <Select.Option value="7d">近7天</Select.Option>
                  <Select.Option value="30d">近30天</Select.Option>
                  <Select.Option value="custom">自定义</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            {dateRangeType === 'custom' && (
              <Col span={8}>
                <Form.Item label="自定义日期">
                  <RangePicker
                    value={customDateRange}
                    onChange={(dates) => setCustomDateRange(dates as [Dayjs, Dayjs] | null)}
                  />
                </Form.Item>
              </Col>
            )}
            <Col span={4}>
              <Form.Item label="状态" name="status">
                <Select placeholder="全部" allowClear style={{ width: '100%' }}>
                  <Select.Option value="active">正常</Select.Option>
                  <Select.Option value="pending_elimination">待淘汰</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="排序字段" name="sortBy" initialValue="roi">
                <Select style={{ width: '100%' }}>
                  <Select.Option value="roi">ROI</Select.Option>
                  <Select.Option value="bean_output">单豆产出</Select.Option>
                  <Select.Option value="ctr">点击率</Select.Option>
                  <Select.Option value="interaction_rate">互动率</Select.Option>
                  <Select.Option value="conversion_rate">转化率</Select.Option>
                  <Select.Option value="created_at">上传时间</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="排序方向" name="sortOrder" initialValue="desc">
                <Select style={{ width: '100%' }}>
                  <Select.Option value="desc">降序</Select.Option>
                  <Select.Option value="asc">升序</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item>
                <Space>
                  <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                    查询
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={handleReset}>
                    重置
                  </Button>
                  <Button icon={<DownloadOutlined />} onClick={handleExport}>
                    导出 Excel
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card title="素材列表">
        <Table<MaterialROIItem>
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1600 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '8px 0' }}>
                <Row gutter={[24, 8]}>
                  <Col span={6}>
                    <strong>视频地址：</strong>
                    {record.videoUrl ? (
                      <a href={record.videoUrl} target="_blank" rel="noreferrer">查看</a>
                    ) : '-'}
                  </Col>
                  <Col span={6}>
                    <strong>宽高比：</strong>{record.aspectRatio || '-'}
                  </Col>
                  <Col span={6}>
                    <strong>创建时间：</strong>{record.createdAt}
                  </Col>
                  <Col span={6}>
                    <strong>更新时间：</strong>{record.updatedAt}
                  </Col>
                </Row>
              </div>
            ),
          }}
        />
      </Card>
    </Space>
  );
}
