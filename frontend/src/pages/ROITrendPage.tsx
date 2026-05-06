import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Select,
  Radio,
  DatePicker,
  Tabs,
  Collapse,
  Space,
  message,
  Spin,
} from 'antd';
import type { Dayjs } from 'dayjs';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
} from 'recharts';
import { getMaterials } from '../api/material';
import { getROITrend, getROICompare } from '../api/trend';
import type { VideoMaterial, ROITrendDataPoint, ROICompareResponse } from '../types';

const { RangePicker } = DatePicker;

const COMPARE_COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'];

type PresetRange = 7 | 30 | 90;

function getDateRange(preset: PresetRange | null, customRange: [Dayjs, Dayjs] | null) {
  if (preset !== null) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - preset);
    return {
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
    };
  }
  if (customRange) {
    return {
      start_date: customRange[0].format('YYYY-MM-DD'),
      end_date: customRange[1].format('YYYY-MM-DD'),
    };
  }
  return {};
}

function formatRoi(value: number | null | undefined) {
  if (value == null) return 'N/A';
  return value.toFixed(2);
}

interface MainChartProps {
  data: ROITrendDataPoint[];
}

function MainChart({ data }: MainChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
        <YAxis
          yAxisId="left"
          label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft', offset: 0 }}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: '金额', angle: 90, position: 'insideRight', offset: 0 }}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value, name) => {
            const v = value as number;
            if (name === 'ROI') return [formatRoi(v), name];
            return [v?.toLocaleString?.() ?? String(value), name];
          }}
        />
        <Legend />
        <Bar yAxisId="right" dataKey="beanCost" name="微信豆消耗" fill="#bfbfbf" barSize={20} />
        <Bar yAxisId="right" dataKey="gmv" name="GMV" fill="#52c41a" barSize={20} />
        <Line yAxisId="left" type="monotone" dataKey="roi" name="ROI" stroke="#1677ff" strokeWidth={2} dot={{ r: 3 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

interface AuxChartsProps {
  data: ROITrendDataPoint[];
}

function AuxCharts({ data }: AuxChartsProps) {
  const items = [
    {
      key: 'ctr',
      label: '点击率趋势',
      children: (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [formatRoi(value as number) + '%', '点击率']} />
            <Line type="monotone" dataKey="ctr" name="点击率" stroke="#1677ff" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      key: 'interactionRate',
      label: '互动率趋势',
      children: (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [formatRoi(value as number) + '%', '互动率']} />
            <Line type="monotone" dataKey="interactionRate" name="互动率" stroke="#722ed1" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      key: 'conversionRate',
      label: '转化率趋势',
      children: (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [formatRoi(value as number) + '%', '转化率']} />
            <Line type="monotone" dataKey="conversionRate" name="转化率" stroke="#faad14" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
  ];

  return <Collapse items={items} />;
}

function SingleTrendTab({ materials }: { materials: VideoMaterial[] }) {
  const [selectedVideoId, setSelectedVideoId] = useState<number | undefined>();
  const [presetRange, setPresetRange] = useState<PresetRange | null>(30);
  const [customRange, setCustomRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [groupBy, setGroupBy] = useState<'day' | 'week'>('day');
  const [data, setData] = useState<ROITrendDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!selectedVideoId) {
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const params = { group_by: groupBy, ...getDateRange(presetRange, customRange) };
      const result = await getROITrend(selectedVideoId, params);
      setData((result as unknown as { data: ROITrendDataPoint[] }).data);
    } catch {
      message.error('获取趋势数据失败');
    } finally {
      setLoading(false);
    }
  }, [selectedVideoId, groupBy, presetRange, customRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Space wrap size="middle">
          <Select
            placeholder="请选择视频"
            showSearch
            optionFilterProp="label"
            style={{ width: 280 }}
            value={selectedVideoId}
            onChange={setSelectedVideoId}
            options={materials.map((m) => ({ value: m.id, label: m.title }))}
          />
          <Radio.Group
            value={presetRange}
            onChange={(e) => {
              setPresetRange(e.target.value);
              setCustomRange(null);
            }}
          >
            <Radio.Button value={7}>近7天</Radio.Button>
            <Radio.Button value={30}>近30天</Radio.Button>
            <Radio.Button value={90}>近90天</Radio.Button>
            <Radio.Button value={null}>自定义</Radio.Button>
          </Radio.Group>
          {presetRange === null && (
            <RangePicker
              value={customRange}
              onChange={(dates) => setCustomRange(dates as [Dayjs, Dayjs] | null)}
            />
          )}
          <Radio.Group
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
          >
            <Radio.Button value="day">按天</Radio.Button>
            <Radio.Button value="week">按周</Radio.Button>
          </Radio.Group>
        </Space>
      </Card>

      <Card title="ROI 趋势">
        <Spin spinning={loading}>
          {data.length > 0 ? (
            <MainChart data={data} />
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              {selectedVideoId ? '暂无数据' : '请选择视频'}
            </div>
          )}
        </Spin>
      </Card>

      {data.length > 0 && (
        <Card title="辅助指标">
          <AuxCharts data={data} />
        </Card>
      )}
    </Space>
  );
}

function CompareTrendTab({ materials }: { materials: VideoMaterial[] }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [presetRange, setPresetRange] = useState<PresetRange | null>(30);
  const [customRange, setCustomRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [groupBy, setGroupBy] = useState<'day' | 'week'>('day');
  const [compareData, setCompareData] = useState<ROICompareResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (selectedIds.length === 0) {
      setCompareData(null);
      return;
    }
    setLoading(true);
    try {
      const params = { group_by: groupBy, ...getDateRange(presetRange, customRange) };
      const result = await getROICompare(selectedIds, params);
      setCompareData(result as unknown as ROICompareResponse);
    } catch {
      message.error('获取对比数据失败');
    } finally {
      setLoading(false);
    }
  }, [selectedIds, groupBy, presetRange, customRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mergedData = (() => {
    if (!compareData || compareData.videos.length === 0) return [];
    const periodMap = new Map<string, Record<string, number | null | string>>();
    for (const video of compareData.videos) {
      for (const point of video.data) {
        if (!periodMap.has(point.period)) {
          periodMap.set(point.period, { period: point.period });
        }
        const entry = periodMap.get(point.period)!;
        entry[`roi_${video.videoId}`] = point.roi;
      }
    }
    return Array.from(periodMap.values()).sort((a, b) =>
      String(a.period).localeCompare(String(b.period))
    );
  })();

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card>
        <Space wrap size="middle">
          <Select
            mode="multiple"
            placeholder="请选择视频（最多5个）"
            showSearch
            optionFilterProp="label"
            style={{ width: 400 }}
            value={selectedIds}
            onChange={(values: number[]) => {
              if (values.length <= 5) {
                setSelectedIds(values);
              }
            }}
            maxCount={5}
            options={materials.map((m) => ({ value: m.id, label: m.title }))}
          />
          <Radio.Group
            value={presetRange}
            onChange={(e) => {
              setPresetRange(e.target.value);
              setCustomRange(null);
            }}
          >
            <Radio.Button value={7}>近7天</Radio.Button>
            <Radio.Button value={30}>近30天</Radio.Button>
            <Radio.Button value={90}>近90天</Radio.Button>
            <Radio.Button value={null}>自定义</Radio.Button>
          </Radio.Group>
          {presetRange === null && (
            <RangePicker
              value={customRange}
              onChange={(dates) => setCustomRange(dates as [Dayjs, Dayjs] | null)}
            />
          )}
          <Radio.Group
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
          >
            <Radio.Button value="day">按天</Radio.Button>
            <Radio.Button value="week">按周</Radio.Button>
          </Radio.Group>
        </Space>
      </Card>

      <Card title="多视频 ROI 对比">
        <Spin spinning={loading}>
          {mergedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={mergedData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis
                  label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value, name) => [formatRoi(value as number), name]}
                />
                <Legend />
                {compareData!.videos.map((video, idx) => (
                  <Line
                    key={video.videoId}
                    type="monotone"
                    dataKey={`roi_${video.videoId}`}
                    name={video.videoTitle}
                    stroke={COMPARE_COLORS[idx % COMPARE_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              {selectedIds.length > 0 ? '暂无数据' : '请选择视频'}
            </div>
          )}
        </Spin>
      </Card>
    </Space>
  );
}

export default function ROITrendPage() {
  const [materials, setMaterials] = useState<VideoMaterial[]>([]);

  useEffect(() => {
    getMaterials()
      .then((data) => setMaterials(data as unknown as VideoMaterial[]))
      .catch(() => message.error('获取素材列表失败'));
  }, []);

  const tabItems = [
    {
      key: 'single',
      label: '单视频趋势',
      children: <SingleTrendTab materials={materials} />,
    },
    {
      key: 'compare',
      label: '对比模式',
      children: <CompareTrendTab materials={materials} />,
    },
  ];

  return <Tabs items={tabItems} />;
}
