import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  ChevronDown,
  Cpu,
  HardDrive,
  LineChart,
  Server,
  Users,
  UploadCloud,
  Wifi,
} from 'lucide-react';
import TopNav from '../../components/layout/TopNav';
import { useDataStore } from '../../store/useDataStore';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useAuthStore } from '../../store/useAuthStore';

const HISTORY_LIMIT = 90;
const SAMPLE_INTERVAL_MS = 2000;

export default function ArtistAnalytics() {
  const { library, uploadQueue, history } = useDataStore();
  const { isPlaying } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();
  const telemetry = useTelemetryStore();

  const totalStreams = library.reduce((sum, track) => sum + (track.plays || 0), 0);
  const activeStreams = isPlaying ? 1 : 0;
  const monthlyListeners = new Set(history.map((track) => track.artist)).size;
  const requestCount = telemetry.requestCount;
  const errorCount = telemetry.errorCount;
  const errorRate = requestCount ? (errorCount / requestCount) * 100 : 0;
  const avgLatency = requestCount ? telemetry.totalLatency / requestCount : 0;
  const availability = requestCount ? 100 - errorRate : 100;

  const minutesWindow = telemetry.firstRequestAt
    ? Math.max(1, (telemetry.lastRequestAt - telemetry.firstRequestAt) / 60000)
    : 1;
  const requestRate = requestCount / minutesWindow;
  const networkMb = telemetry.bytesTransferred / (1024 * 1024);

  const cpuUsage = Math.min(95, Math.round(12 + requestRate * 2 + uploadQueue * 6 + activeStreams * 8));
  const ramUsage = Math.min(92, Math.round(18 + library.length * 2 + uploadQueue * 4));
  const containerHealth = availability > 98 ? 'Healthy' : availability > 95 ? 'Degraded' : 'Unstable';
  const topTracks = useMemo(
    () => [...library].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 5),
    [library]
  );

  const metrics = useMemo(
    () => ({
      totalStreams: metric('Total Streams', totalStreams, totalStreams.toLocaleString(), 'All time', BarChart3),
      monthlyListeners: metric('Monthly Listeners', monthlyListeners, monthlyListeners.toString(), 'Live', Users),
      activeStreams: metric('Active Streams', activeStreams, activeStreams.toString(), 'Live', Activity),
      uploads: metric('Uploads', library.length, library.length.toString(), 'Published', UploadCloud),
      cpu: metric('CPU', cpuUsage, `${cpuUsage}%`, cpuUsage > 85 ? 'High' : 'Normal', Cpu),
      ram: metric('RAM', ramUsage, `${ramUsage}%`, ramUsage > 85 ? 'High' : 'Normal', HardDrive),
      containerHealth: metric('Container Health', availability, containerHealth, containerHealth, Server),
      networkTraffic: metric('Network Traffic', networkMb, `${networkMb.toFixed(2)} MB`, 'Tracking', Wifi),
      requestRate: metric('Request Rate', requestRate, `${requestRate.toFixed(1)}/min`, 'Live', Server),
      latency: metric('Latency', avgLatency, `${avgLatency.toFixed(0)}ms`, 'Live', Activity),
      errorRate: metric(
        'Error Rate',
        errorRate,
        `${errorRate.toFixed(2)}%`,
        errorRate > 2 ? 'Elevated' : 'Normal',
        Activity
      ),
      activeUsers: metric('Active Users', isAuthenticated ? 1 : 0, isAuthenticated ? '1' : '0', 'Live', Users),
      uploadQueue: metric(
        'Upload Queue',
        uploadQueue,
        uploadQueue.toString(),
        uploadQueue > 0 ? 'Processing' : 'Idle',
        UploadCloud
      ),
      topTrackPlays: metric('Top Track Plays', topTracks[0]?.plays || 0, topTracks[0]?.title || 'N/A', 'Top Track', BarChart3),
      availability: metric('Availability', availability, `${availability.toFixed(2)}%`, 'Live', Server),
      uptime: metric('Uptime', availability, `${availability.toFixed(2)}%`, 'Live', Activity),
      alerts: metric('Alerts', telemetry.alerts.length, telemetry.alerts.length.toString(), 'Live', Activity),
      failedRequests: metric(
        'Failed Requests',
        errorCount,
        errorCount.toString(),
        errorCount > 0 ? 'Elevated' : 'Normal',
        Activity
      ),
    }),
    [
      activeStreams,
      availability,
      avgLatency,
      containerHealth,
      cpuUsage,
      errorCount,
      errorRate,
      isAuthenticated,
      library.length,
      monthlyListeners,
      networkMb,
      ramUsage,
      requestRate,
      telemetry.alerts.length,
      topTracks,
      totalStreams,
      uploadQueue,
    ]
  );
  const metricHistory = useMetricHistory(metrics);

  return (
    <div className="flex-1 bg-yeah-bg overflow-y-auto no-scrollbar pb-32">
      <TopNav />
      <div className="px-8 py-6">
        <h1 className="text-3xl font-bold text-white mb-6">Analytics & Monitoring</h1>

        <MetricGrid keys={['totalStreams', 'monthlyListeners', 'activeStreams', 'uploads']} metrics={metrics} history={metricHistory} variant="stat" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
          <Panel title="Most Played Tracks">
            {topTracks.length === 0 ? (
              <p className="text-gray-500 text-sm">No tracks yet.</p>
            ) : (
              <div className="space-y-3">
                {topTracks.map((track) => (
                  <div key={track.id} className="flex items-center justify-between text-sm">
                    <span className="text-white">{track.title}</span>
                    <span className="text-gray-400">{track.plays || 0} plays</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
          <Panel title="Alerts">
            {telemetry.alerts.length === 0 ? (
              <p className="text-gray-500 text-sm">No active alerts.</p>
            ) : (
              <div className="space-y-3">
                {telemetry.alerts.map((alert) => (
                  <div key={alert.id} className="text-sm text-red-300">
                    {alert.message} · {new Date(alert.createdAt).toLocaleTimeString()}
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <MetricSection title="Infrastructure" keys={['cpu', 'ram', 'containerHealth', 'networkTraffic']} metrics={metrics} history={metricHistory} />
        <MetricSection title="Application" keys={['requestRate', 'latency', 'errorRate', 'activeUsers']} metrics={metrics} history={metricHistory} />
        <MetricSection title="Music Platform" keys={['activeStreams', 'uploadQueue', 'topTrackPlays', 'monthlyListeners']} metrics={metrics} history={metricHistory} />
        <MetricSection title="SRE" keys={['availability', 'uptime', 'alerts', 'failedRequests']} metrics={metrics} history={metricHistory} />
      </div>
    </div>
  );
}

function metric(title, value, displayValue, status, icon) {
  return { title, value, displayValue, status, icon };
}

function useMetricHistory(metrics) {
  const [history, setHistory] = useState({});

  useEffect(() => {
    const sample = () => {
      const now = Date.now();

      setHistory((current) => {
        const next = { ...current };

        Object.entries(metrics).forEach(([key, item]) => {
          const value = Number(item.value);
          next[key] = [
            ...(current[key] || []),
            {
              time: now,
              value: Number.isFinite(value) ? value : 0,
            },
          ].slice(-HISTORY_LIMIT);
        });

        return next;
      });
    };

    sample();
    const timer = window.setInterval(sample, SAMPLE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [metrics]);

  return history;
}

function MetricSection({ title, keys, metrics, history }) {
  return (
    <section className="mt-10">
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{title}</h2>
      <MetricGrid keys={keys} metrics={metrics} history={history} />
    </section>
  );
}

function MetricGrid({ keys, metrics, history, variant = 'health' }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {keys.map((key) => (
        <MetricCard key={key} metric={metrics[key]} history={history[key]} variant={variant} />
      ))}
    </div>
  );
}

function MetricCard({ metric, history = [], variant = 'health' }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = metric.icon;
  const isStat = variant === 'stat';

  return (
    <div className="bg-[#151515] border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between gap-3">
        {isStat ? (
          <p className="text-gray-400 text-sm">{metric.title}</p>
        ) : (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-yeah-accent shrink-0">
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold truncate">{metric.title}</p>
              <p className="text-gray-400 text-xs">{metric.status}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isStat && <Icon size={18} className="text-yeah-accent" />}
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-colors ${
              expanded ? 'bg-yeah-accent text-black' : 'bg-[#242424] text-gray-300 hover:text-white'
            }`}
            aria-label={`${expanded ? 'Hide' : 'Show'} ${metric.title} graph`}
          >
            {expanded ? <ChevronDown size={17} /> : <LineChart size={17} />}
          </button>
        </div>
      </div>

      {isStat ? (
        <div className="text-3xl font-bold text-white mt-2">{metric.displayValue}</div>
      ) : (
        <p className="text-white font-semibold text-right mt-4 truncate">{metric.displayValue}</p>
      )}

      {expanded && (
        <div className="mt-5 border-t border-gray-800 pt-4">
          <MetricSparkline points={history} />
          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
            <span>{history.length ? new Date(history[0].time).toLocaleTimeString() : '--:--'}</span>
            <span>{history.length} samples</span>
            <span>{history.length ? new Date(history[history.length - 1].time).toLocaleTimeString() : '--:--'}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricSparkline({ points }) {
  if (!points || points.length < 2) {
    return (
      <div className="h-36 rounded-xl bg-[#101010] border border-gray-800 flex items-center justify-center text-sm text-gray-600">
        Waiting for data
      </div>
    );
  }

  const width = 320;
  const height = 130;
  const padding = 12;
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const path = points
    .map((point, index) => {
      const x = padding + (index / Math.max(1, points.length - 1)) * (width - padding * 2);
      const y = height - padding - ((point.value - min) / range) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
  const fillPath = `${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;
  const lastValue = values[values.length - 1];
  const lastY = height - padding - ((lastValue - min) / range) * (height - padding * 2);

  return (
    <div className="rounded-xl bg-[#101010] border border-gray-800 p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full overflow-visible" role="img">
        <defs>
          <linearGradient id="metricFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1ED760" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#1ED760" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((line) => (
          <line
            key={line}
            x1={padding}
            x2={width - padding}
            y1={height * line}
            y2={height * line}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}
        <path d={fillPath} fill="url(#metricFill)" />
        <path d={path} fill="none" stroke="#1ED760" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        <circle cx={width - padding} cy={lastY} r="4" fill="#1ED760" />
      </svg>
      <div className="flex items-center justify-between text-[11px] text-gray-500">
        <span>min {formatMetricNumber(min)}</span>
        <span>now {formatMetricNumber(lastValue)}</span>
        <span>max {formatMetricNumber(max)}</span>
      </div>
    </div>
  );
}

function formatMetricNumber(value) {
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

function Panel({ title, children }) {
  return (
    <div className="bg-[#151515] border border-gray-800 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}
