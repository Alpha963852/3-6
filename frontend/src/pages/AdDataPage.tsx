import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Form,
  InputNumber,
  DatePicker,
  Select,
  Button,
  Table,
  Upload,
  message,
  Space,
  Row,
  Col,
  Tag,
  Alert,
} from 'antd';
import { DownloadOutlined, InboxOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { getMaterials } from '../api/material';
import {
  createAdData,
  importAdData,
  getAdData,
} from '../api/adData';
import type { AdData, VideoMaterial } from '../types';
import type { ImportResult } from '../api/adData';

const { RangePicker } = DatePicker;
const { Dragger } = Upload;

const inputNumberProps = {
  min: 0,
  style: { width: '100%' },
};

const numberFormatter = (value: number | string | undefined) =>
  value !== undefined && value !== null ? Number(value).toLocaleString() : '';

export default function AdDataPage() {
  const [form] = Form.useForm();
  const [materials, setMaterials] = useState<VideoMaterial[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<number | undefined>();
  const [tableData, setTableData] = useState<AdData[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    getMaterials()
      .then((data) => setMaterials(data as unknown as VideoMaterial[]))
      .catch(() => message.error('获取素材列表失败'));
  }, []);

  const fetchAdData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { group_by: groupBy };
      if (selectedVideoId) params.video_id = selectedVideoId;
      if (dateRange) {
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }
      const data = await getAdData(params);
      setTableData(data as unknown as AdData[]);
    } catch {
      message.error('查询投放数据失败');
    } finally {
      setLoading(false);
    }
  }, [selectedVideoId, dateRange, groupBy]);

  useEffect(() => {
    fetchAdData();
  }, [fetchAdData]);

  const handleSubmit = async (values: {
    date: Dayjs;
    beanCost: number;
    impressions: number;
    clicks: number;
    interactions: number;
    conversions: number;
    gmv: number;
  }) => {
    if (!selectedVideoId) {
      message.warning('请先选择素材');
      return;
    }
    setSubmitting(true);
    try {
      await createAdData({
        videoId: selectedVideoId,
        date: values.date.format('YYYY-MM-DD'),
        beanCost: values.beanCost,
        impressions: values.impressions,
        clicks: values.clicks,
        interactions: values.interactions,
        conversions: values.conversions,
        gmv: values.gmv,
      });
      message.success('录入成功');
      form.resetFields();
      fetchAdData();
    } catch {
      message.error('录入失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImport = async (file: File) => {
    try {
      const result = await importAdData(file);
      const res = result as unknown as ImportResult;
      setImportResult(res);
      if (res.failCount === 0) {
        message.success(`导入成功，共 ${res.successCount} 条`);
      } else {
        message.warning(`导入完成，成功 ${res.successCount} 条，失败 ${res.failCount} 条`);
      }
      fetchAdData();
    } catch {
      message.error('导入失败');
    }
    return false;
  };

  const handleDownloadTemplate = () => {
    const headers = '日期,视频ID,微信豆消耗,曝光量,点击量,互动量,转化数,GMV';
    const example = '2025-01-01,1,1000,5000,200,50,10,500';
    const csv = '\uFEFF' + headers + '\n' + example;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '投放数据导入模板.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const videoTitleMap = materials.reduce<Record<number, string>>((acc, m) => {
    acc[m.id] = m.title;
    return acc;
  }, {});

  const columns: ColumnsType<AdData> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => a.date.localeCompare(b.date),
    },
    {
      title: '视频标题',
      dataIndex: 'videoId',
      key: 'videoTitle',
      render: (videoId: number) => videoTitleMap[videoId] ?? `视频${videoId}`,
    },
    {
      title: '微信豆消耗',
      dataIndex: 'beanCost',
      key: 'beanCost',
      render: (v: number) => numberFormatter(v),
      sorter: (a, b) => a.beanCost - b.beanCost,
    },
    {
      title: '曝光量',
      dataIndex: 'impressions',
      key: 'impressions',
      render: (v: number) => numberFormatter(v),
      sorter: (a, b) => a.impressions - b.impressions,
    },
    {
      title: '点击量',
      dataIndex: 'clicks',
      key: 'clicks',
      render: (v: number) => numberFormatter(v),
      sorter: (a, b) => a.clicks - b.clicks,
    },
    {
      title: '互动量',
      dataIndex: 'interactions',
      key: 'interactions',
      render: (v: number) => numberFormatter(v),
      sorter: (a, b) => a.interactions - b.interactions,
    },
    {
      title: '转化数',
      dataIndex: 'conversions',
      key: 'conversions',
      render: (v: number) => numberFormatter(v),
      sorter: (a, b) => a.conversions - b.conversions,
    },
    {
      title: 'GMV',
      dataIndex: 'gmv',
      key: 'gmv',
      render: (v: number) => numberFormatter(v),
      sorter: (a, b) => a.gmv - b.gmv,
    },
  ];

  const uploadProps = {
    accept: '.xlsx,.csv',
    showUploadList: false,
    beforeUpload: (_file: UploadFile, fileList: UploadFile[]) => {
      const file = fileList[fileList.length - 1] as UploadFile & { originFileObj?: File };
      const raw = file?.originFileObj ?? (file as unknown as File);
      if (raw instanceof File) {
        handleImport(raw);
      }
      return false;
    },
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card title="素材选择">
        <Select
          placeholder="请选择素材"
          showSearch
          optionFilterProp="label"
          style={{ width: '100%', maxWidth: 480 }}
          value={selectedVideoId}
          onChange={setSelectedVideoId}
          options={materials.map((m) => ({
            value: m.id,
            label: m.title,
          }))}
        />
      </Card>

      <Card title="手动录入">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="日期"
            name="date"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="微信豆消耗"
                name="beanCost"
                rules={[{ required: true, message: '请输入微信豆消耗' }]}
              >
                <InputNumber {...inputNumberProps} placeholder="微信豆消耗" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="曝光量"
                name="impressions"
                rules={[{ required: true, message: '请输入曝光量' }]}
              >
                <InputNumber {...inputNumberProps} placeholder="曝光量" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="点击量"
                name="clicks"
                rules={[{ required: true, message: '请输入点击量' }]}
              >
                <InputNumber {...inputNumberProps} placeholder="点击量" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="互动量"
                name="interactions"
                rules={[{ required: true, message: '请输入互动量' }]}
              >
                <InputNumber {...inputNumberProps} placeholder="互动量" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="转化数"
                name="conversions"
                rules={[{ required: true, message: '请输入转化数' }]}
              >
                <InputNumber {...inputNumberProps} placeholder="转化数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="GMV"
                name="gmv"
                rules={[{ required: true, message: '请输入GMV' }]}
              >
                <InputNumber {...inputNumberProps} placeholder="GMV" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              提交录入
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="批量导入">
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p>点击或拖拽文件到此区域上传</p>
          <p style={{ color: '#999' }}>
            支持 .xlsx 和 .csv 格式
          </p>
        </Dragger>
        <div style={{ marginTop: 12 }}>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
            下载导入模板
          </Button>
        </div>
        {importResult && (
          <Alert
            style={{ marginTop: 12 }}
            type={importResult.failCount === 0 ? 'success' : 'warning'}
            showIcon
            message={
              <span>
                导入完成：成功 <Tag color="green">{importResult.successCount}</Tag> 条
                {importResult.failCount > 0 && (
                  <>
                    ，失败 <Tag color="red">{importResult.failCount}</Tag> 条
                  </>
                )}
              </span>
            }
            description={
              importResult.failures.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {importResult.failures.map((f, i) => (
                    <li key={i}>
                      第 {f.row} 行：{f.reason}
                    </li>
                  ))}
                </ul>
              )
            }
          />
        )}
      </Card>

      <Card title="投放数据">
        <Space style={{ marginBottom: 16 }} wrap>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              setDateRange(dates as [Dayjs, Dayjs] | null);
            }}
          />
          <Select
            value={groupBy}
            onChange={setGroupBy}
            style={{ width: 120 }}
            options={[
              { value: 'day', label: '按日' },
              { value: 'week', label: '按周' },
              { value: 'month', label: '按月' },
            ]}
          />
        </Space>
        <Table<AdData>
          rowKey="id"
          columns={columns}
          dataSource={tableData}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
        />
      </Card>
    </Space>
  );
}
