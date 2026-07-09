import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  StatCard, 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Badge, StatusBadge, Button, ProgressBar
} from '../../components/ui';
import { 
  Users, Briefcase, Activity, ShieldAlert,
  ArrowRight, Download, Server, Database, Zap,
  CheckCircle, AlertCircle, Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger entrance animations shortly after mount
    const timer = setTimeout(() => setIsLoaded(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const fadeUp = isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8';

  const systemMetrics = [
    { label: 'Total Users', value: '12,450', icon: Users, trend: { direction: 'up', value: '+14% this month' } },
    { label: 'Active Jobs', value: '843', icon: Briefcase, trend: { direction: 'up', value: '+5% this week' } },
    { label: 'API Requests / Min', value: '1,045', icon: Activity, trend: { direction: 'down', value: '-2% vs avg' }, trendUpIsGood: false },
    { label: 'Security Alerts', value: '2', icon: ShieldAlert, trend: { direction: 'down', value: '0 unresolved' }, trendUpIsGood: false },
  ];

  const recentActivity = [
    { id: 1, action: 'New Company Registration', details: 'TechFlow Inc. registered.', time: '2 mins ago', status: 'success', icon: CheckCircle, color: 'text-emerald-500' },
    { id: 2, action: 'Role Update', details: 'User ID 459 role changed to Recruiter.', time: '15 mins ago', status: 'info', icon: Users, color: 'text-blue-500' },
    { id: 3, action: 'Failed Login Spikes', details: 'Detected 40 failed attempts from IP 192.168.1.4.', time: '1 hour ago', status: 'danger', icon: AlertCircle, color: 'text-rose-500' },
    { id: 4, action: 'System Backup', details: 'Daily database backup completed successfully.', time: '4 hours ago', status: 'success', icon: Database, color: 'text-emerald-500' },
    { id: 5, action: 'High Latency', details: 'AI Screening API response > 5s.', time: '6 hours ago', status: 'warning', icon: Clock, color: 'text-amber-500' },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-sky-500/10 blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <div className="space-y-10 max-w-7xl mx-auto pb-10">
        {/* Header Section */}
        <div className={`transition-all duration-1000 ease-out ${fadeUp} flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
              <Zap size={14} className="animate-pulse" />
              <span>System Status: All systems operational</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent tracking-tight">
              Admin Overview
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-200">{profile?.firstName || 'Admin'}</span>. Here's what's happening today.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={<Download size={16} />} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors border-slate-200 dark:border-slate-700 shadow-sm">
              Export Report
            </Button>
            <Button variant="primary" className="shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all">
              System Settings
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemMetrics.map((metric, i) => (
            <div 
              key={metric.label} 
              className={`transition-all duration-700 ease-out ${fadeUp}`}
              style={{ transitionDelay: `${(i + 2) * 150}ms` }}
            >
              <div className="group relative rounded-3xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-500 h-full overflow-hidden">
                {/* Glossy overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="p-1 h-full relative z-10">
                  <StatCard {...metric} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Activity Table */}
          <div className={`xl:col-span-2 transition-all duration-1000 delay-700 ease-out ${fadeUp}`}>
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl border border-white dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-500">
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-slate-800/40">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity size={20} className="text-indigo-500" /> Recent Activity Log
                </h2>
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={16} />} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10">View All</Button>
              </div>
              <div className="p-2 overflow-x-auto">
                <Table density="comfortable">
                  <TableHeader>
                    <TableRow isHeader className="border-none">
                      <TableHead className="font-semibold text-slate-500 uppercase tracking-wider text-xs">Event</TableHead>
                      <TableHead className="font-semibold text-slate-500 uppercase tracking-wider text-xs">Details</TableHead>
                      <TableHead className="font-semibold text-slate-500 uppercase tracking-wider text-xs">Time</TableHead>
                      <TableHead className="font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((activity, idx) => (
                      <TableRow key={activity.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700/50 transition-colors group cursor-pointer">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform duration-300 ${activity.color} shadow-sm border border-slate-100 dark:border-slate-700`}>
                              <activity.icon size={16} strokeWidth={2.5} />
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{activity.action}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400 max-w-[250px] truncate" title={activity.details}>
                          {activity.details}
                        </TableCell>
                        <TableCell className="text-slate-400 dark:text-slate-500 text-sm font-medium">
                          {activity.time}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={activity.status} size="sm" className="shadow-sm">{activity.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className={`xl:col-span-1 transition-all duration-1000 delay-1000 ease-out ${fadeUp}`}>
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl border border-white dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-500 p-8 space-y-8 relative">
              {/* Internal decorative gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full blur-2xl -z-10 pointer-events-none" />
              
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Server size={20} className="text-indigo-500" /> System Health
              </h2>
              
              <div className="space-y-8">
                {/* Metric 1 */}
                <div className="space-y-3 group cursor-pointer">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">API Servers</span>
                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm border border-emerald-100 dark:border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 35ms
                    </span>
                  </div>
                  <ProgressBar value={15} size="sm" className="bg-slate-100 dark:bg-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-emerald-500 [&>div]:shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                </div>

                {/* Metric 2 */}
                <div className="space-y-3 group cursor-pointer">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Database size={14} className="text-slate-400 group-hover:text-amber-500 transition-colors"/> Database Load
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md shadow-sm border border-amber-100 dark:border-amber-500/20">Moderate</span>
                  </div>
                  <ProgressBar value={62} size="sm" className="bg-slate-100 dark:bg-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-amber-500 [&>div]:shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
                </div>

                {/* Metric 3 */}
                <div className="space-y-3 group cursor-pointer">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Server size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" /> Storage (AWS S3)
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md shadow-sm border border-indigo-100 dark:border-indigo-500/20">42% Used</span>
                  </div>
                  <ProgressBar value={42} size="sm" className="bg-slate-100 dark:bg-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-indigo-400 [&>div]:to-indigo-500 [&>div]:shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:shadow-md hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Version</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">v2.4.1 (Latest)</span>
                  </div>
                  <StatusBadge status="active" type="job" size="sm" className="shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
