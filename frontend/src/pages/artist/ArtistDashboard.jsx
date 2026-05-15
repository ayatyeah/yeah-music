import { Activity, Server, UploadCloud, Wifi, Cpu, HardDrive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../../components/layout/TopNav';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { useDataStore } from '../../store/useDataStore';
import { usePlayerStore } from '../../store/usePlayerStore';

export default function ArtistDashboard() {
  const navigate = useNavigate();
  const telemetry = useTelemetryStore();
  const { uploadQueue, library } = useDataStore();
  const { isPlaying } = usePlayerStore();

  const requestCount = telemetry.requestCount;
  const errorCount = telemetry.errorCount;
  const errorRate = requestCount ? (errorCount / requestCount) * 100 : 0;
  const availability = requestCount ? 100 - errorRate : 100;
  const avgLatency = requestCount ? telemetry.totalLatency / requestCount : 0;
  const networkMb = telemetry.bytesTransferred / (1024 * 1024);
  const activeStreams = isPlaying ? 1 : 0;

  const cpuUsage = Math.min(95, Math.round(12 + requestCount * 0.2 + activeStreams * 8));
  const ramUsage = Math.min(92, Math.round(18 + library.length * 2 + uploadQueue * 4));
  const containerHealth = availability > 98 ? 'Healthy' : availability > 95 ? 'Degraded' : 'Unstable';
  return (
    <div className="flex-1 bg-yeah-bg overflow-y-auto no-scrollbar pb-48 md:pb-32">
      <TopNav />
      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Artist Studio</h1>
          <p className="text-gray-400 mt-1">Manage your releases and monitor infrastructure.</p>
        </div>
        <button
          onClick={() => navigate('/artist/upload')}
          className="bg-yeah-accent text-black px-6 py-2.5 rounded-full font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform"
        >
          <UploadCloud size={20} /> New Release
        </button>
      </div>

      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Platform Telemetry</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10">
        <HealthCard
          title="API Gateway"
          latency={`${avgLatency.toFixed(0)}ms`}
          status={availability > 98 ? 'Healthy' : 'Degraded'}
          uptime={`${availability.toFixed(2)}%`}
          icon={Server}
          color={availability > 98 ? 'text-yeah-accent' : 'text-yellow-500'}
        />
        <HealthCard
          title="Container Health"
          latency={`${cpuUsage}% CPU`}
          status={containerHealth}
          uptime={`${ramUsage}% RAM`}
          icon={Cpu}
          color={containerHealth === 'Healthy' ? 'text-yeah-accent' : 'text-yellow-500'}
        />
        <HealthCard
          title="Network Traffic"
          latency={`${networkMb.toFixed(2)} MB`}
          status={uploadQueue > 0 ? 'Processing' : 'Idle'}
          uptime={`${activeStreams} active streams`}
          icon={Wifi}
          color="text-yeah-accent"
        />
      </div>

      {/* Drag & Drop Upload Placeholder */}
      <div className="mt-10 border-2 border-dashed border-gray-700 rounded-2xl p-6 sm:p-10 lg:p-16 flex flex-col items-center justify-center text-center bg-[#181818]/50 hover:bg-[#181818] transition-colors cursor-pointer group">
        <div className="w-16 h-16 bg-[#282828] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <UploadCloud size={32} className="text-yeah-accent" />
        </div>
        <h3 className="text-white font-bold text-xl mb-2">Drop your master tracks here</h3>
        <p className="text-gray-400 text-sm">Supports WAV, FLAC, and high-bitrate MP3.</p>
        <p className="text-xs text-gray-600 mt-4">Uploads are processed via the yeah-upload-service worker queue.</p>
      </div>
      </div>
    </div>
  );
}

function HealthCard({ title, latency, status, uptime, icon: Icon, color }) {
  return (
    <div className="bg-[#181818] p-4 sm:p-5 rounded-xl border border-gray-800">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-black rounded-lg ${color} bg-opacity-20`}>
            <Icon size={20} className={color} />
          </div>
          <h3 className="text-white font-medium">{title}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${status === 'Healthy' || status === 'Optimal' ? 'bg-yeah-accent' : 'bg-yellow-500'} animate-pulse`}></div>
          <span className="text-xs text-gray-400">{status}</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
        <span className="text-gray-400">Latency: <span className="text-white">{latency}</span></span>
        <span className="text-gray-400">Uptime: <span className="text-white">{uptime}</span></span>
      </div>
    </div>
  );
}

