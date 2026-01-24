import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, Pause, Play } from 'lucide-react';

export default function Logs() {
    const [isPaused, setIsPaused] = useState(false);

    // Mock logs
    const logs = [
        { id: 101, timestamp: '2026-01-24 14:02:45.123', level: 'INFO', service: 'api-gateway', message: 'Incoming request GET /api/v1/users/me from 192.168.1.42' },
        { id: 102, timestamp: '2026-01-24 14:02:45.150', level: 'DEBUG', service: 'auth-service', message: 'Token validation success for user_123' },
        { id: 103, timestamp: '2026-01-24 14:02:45.180', level: 'INFO', service: 'db-primary', message: 'Query executed in 4.2ms: SELECT * FROM users WHERE id = ?' },
        { id: 104, timestamp: '2026-01-24 14:02:46.002', level: 'WARN', service: 'rate-limiter', message: 'User user_123 approaching rate limit (85%)' },
        { id: 105, timestamp: '2026-01-24 14:02:46.420', level: 'ERROR', service: 'payment-service', message: 'Payment gateway timeout: connection reset by peer' },
        { id: 106, timestamp: '2026-01-24 14:02:47.110', level: 'INFO', service: 'api-gateway', message: 'Response sent 200 OK (45ms)' },
        { id: 107, timestamp: '2026-01-24 14:02:48.005', level: 'INFO', service: 'worker-01', message: 'Job job_pdf_generate started' },
        { id: 108, timestamp: '2026-01-24 14:02:49.230', level: 'INFO', service: 'worker-01', message: 'Job job_pdf_generate completed successfully' },
    ];

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'INFO': return 'text-blue-400';
            case 'DEBUG': return 'text-slate-400';
            case 'WARN': return 'text-yellow-400';
            case 'ERROR': return 'text-red-400';
            default: return 'text-slate-200';
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold gradient-text">Logs Système</h1>
                    <p className="text-sm text-muted-foreground">Streaming des logs en temps réel</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsPaused(!isPaused)}>
                        {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                        {isPaused ? 'Reprendre' : 'Pause'}
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="flex gap-4 shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Rechercher (regex supporté)..." className="pl-9" />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filtres
                </Button>
            </div>

            <Card className="flex-1 min-h-0 bg-slate-950 border-slate-800 font-mono text-sm overflow-hidden flex flex-col">
                <CardContent className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-1">
                    {logs.map((log) => (
                        <div key={log.id} className="grid grid-cols-[160px_60px_140px_1fr] gap-4 hover:bg-slate-900/50 p-1 rounded cursor-pointer">
                            <span className="text-slate-500 text-xs">{log.timestamp.split(' ')[1]}</span>
                            <span className={`font-bold text-xs ${getLevelColor(log.level)}`}>{log.level}</span>
                            <span className="text-slate-400 text-xs truncate" title={log.service}>{log.service}</span>
                            <span className="text-slate-300 truncate">{log.message}</span>
                        </div>
                    ))}
                    <div className="h-4" />
                    <div className="text-center text-xs text-slate-600 animate-pulse">
                        Waiting for new logs...
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
