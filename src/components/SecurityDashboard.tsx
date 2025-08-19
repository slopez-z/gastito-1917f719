import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, ShieldAlert, ShieldCheck, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { 
  getSecurityLogs, 
  clearSecurityLogs, 
  getSecuritySummary 
} from '@/lib/security-monitor';
import { isSessionExpired, clearEncryptionSession } from '@/lib/encryption';

interface SecurityEvent {
  type: 'XSS_ATTEMPT' | 'INVALID_INPUT' | 'SUSPICIOUS_PATTERN' | 'DATA_ANOMALY';
  message: string;
  data?: any;
  timestamp: number;
  userAgent: string;
}

export const SecurityDashboard = () => {
  const [logs, setLogs] = useState<SecurityEvent[]>([]);
  const [summary, setSummary] = useState<ReturnType<typeof getSecuritySummary> | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const loadSecurityData = () => {
      setLogs(getSecurityLogs());
      setSummary(getSecuritySummary());
      setSessionExpired(isSessionExpired());
    };

    loadSecurityData();
    
    // Update every 30 seconds
    const interval = setInterval(loadSecurityData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleClearLogs = () => {
    clearSecurityLogs();
    setLogs([]);
    setSummary(getSecuritySummary());
  };

  const handleRefreshSession = () => {
    clearEncryptionSession();
    setSessionExpired(false);
    window.location.reload();
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'XSS_ATTEMPT':
        return <ShieldAlert className="h-4 w-4 text-destructive" />;
      case 'SUSPICIOUS_PATTERN':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'INVALID_INPUT':
        return <ShieldAlert className="h-4 w-4 text-yellow-500" />;
      case 'DATA_ANOMALY':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'XSS_ATTEMPT':
        return 'destructive';
      case 'SUSPICIOUS_PATTERN':
        return 'secondary';
      case 'INVALID_INPUT':
        return 'outline';
      case 'DATA_ANOMALY':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Security Dashboard</h1>
        <p className="text-muted-foreground">Monitor security events and system status</p>
      </div>

      {sessionExpired && (
        <Alert className="mb-6">
          <Clock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Your encryption session has expired. Refresh to re-encrypt your data.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshSession}
              className="ml-4"
            >
              Refresh Session
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary?.totalEvents || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">XSS Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summary?.xssAttempts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Invalid Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{summary?.invalidInputs || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Data Anomalies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{summary?.dataAnomalies || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="status">System Status</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Security Events</CardTitle>
                  <CardDescription>
                    Security events from the last 24 hours
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearLogs}
                  disabled={logs.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-8">
                  <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No security events detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.slice(0, 20).map((event, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getEventIcon(event.type)}
                          <Badge variant={getEventColor(event.type) as any}>
                            {event.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-foreground mb-1">
                        {event.message}
                      </p>
                      
                      {event.data && (
                        <details className="text-xs text-muted-foreground">
                          <summary className="cursor-pointer hover:text-foreground">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Security Status</CardTitle>
              <CardDescription>Current security configuration and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Data Encryption</span>
                </div>
                <Badge variant="outline">
                  {sessionExpired ? 'Session Expired' : 'Active'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Input Sanitization</span>
                </div>
                <Badge variant="outline">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Security Monitoring</span>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Data Validation</span>
                </div>
                <Badge variant="outline">Enabled</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};