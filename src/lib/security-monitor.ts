/**
 * Security monitoring and logging utilities
 * Detects suspicious patterns and logs security events
 */

interface SecurityEvent {
  type: 'XSS_ATTEMPT' | 'INVALID_INPUT' | 'SUSPICIOUS_PATTERN' | 'DATA_ANOMALY';
  message: string;
  data?: any;
  timestamp: number;
  userAgent: string;
}

// Security event storage
const SECURITY_LOG_KEY = 'security-events';
const MAX_LOG_ENTRIES = 100;

// Suspicious patterns to detect
const SUSPICIOUS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /eval\s*\(/gi,
  /document\.cookie/gi,
  /window\.location/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /data:text\/html/gi,
  /vbscript:/gi
];

/**
 * Log security event
 */
function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp' | 'userAgent'>): void {
  try {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    };

    // Get existing logs
    const existingLogs = getSecurityLogs();
    
    // Add new event and limit size
    const updatedLogs = [securityEvent, ...existingLogs].slice(0, MAX_LOG_ENTRIES);
    
    // Store updated logs
    localStorage.setItem(SECURITY_LOG_KEY, JSON.stringify(updatedLogs));
    
    // Console warning for developers
    console.warn('🔒 Security Event:', event.type, event.message);
    
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Get security logs
 */
export function getSecurityLogs(): SecurityEvent[] {
  try {
    const logs = localStorage.getItem(SECURITY_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch {
    return [];
  }
}

/**
 * Clear security logs
 */
export function clearSecurityLogs(): void {
  localStorage.removeItem(SECURITY_LOG_KEY);
}

/**
 * Check input for suspicious patterns
 */
export function detectSuspiciousInput(input: string): boolean {
  if (typeof input !== 'string') return false;
  
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(input)) {
      logSecurityEvent({
        type: 'XSS_ATTEMPT',
        message: 'Suspicious pattern detected in user input',
        data: { 
          input: input.substring(0, 200), // Log first 200 chars only
          pattern: pattern.source
        }
      });
      return true;
    }
  }
  
  return false;
}

/**
 * Monitor data anomalies
 */
export function detectDataAnomaly(data: any, context: string): void {
  try {
    // Check for unusually large data structures
    const jsonString = JSON.stringify(data);
    if (jsonString.length > 100000) { // 100KB limit
      logSecurityEvent({
        type: 'DATA_ANOMALY',
        message: 'Unusually large data structure detected',
        data: { 
          context,
          size: jsonString.length,
          type: typeof data
        }
      });
    }
    
    // Check for unusual nesting depth
    const checkDepth = (obj: any, depth = 0): number => {
      if (depth > 20) return depth; // Prevent stack overflow
      if (typeof obj !== 'object' || obj === null) return depth;
      
      let maxDepth = depth;
      for (const value of Object.values(obj)) {
        const currentDepth = checkDepth(value, depth + 1);
        maxDepth = Math.max(maxDepth, currentDepth);
      }
      return maxDepth;
    };
    
    const depth = checkDepth(data);
    if (depth > 10) {
      logSecurityEvent({
        type: 'DATA_ANOMALY',
        message: 'Unusual object nesting depth detected',
        data: { context, depth }
      });
    }
    
  } catch (error) {
    // Ignore errors in anomaly detection
  }
}

/**
 * Monitor invalid input attempts
 */
export function logInvalidInput(input: any, expectedType: string, context: string): void {
  logSecurityEvent({
    type: 'INVALID_INPUT',
    message: 'Invalid input type detected',
    data: {
      context,
      expectedType,
      actualType: typeof input,
      value: typeof input === 'string' ? input.substring(0, 100) : String(input).substring(0, 100)
    }
  });
}

/**
 * Get security summary for the last 24 hours
 */
export function getSecuritySummary(): {
  totalEvents: number;
  xssAttempts: number;
  invalidInputs: number;
  suspiciousPatterns: number;
  dataAnomalies: number;
  lastEvent?: SecurityEvent;
} {
  const logs = getSecurityLogs();
  const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
  const recentLogs = logs.filter(log => log.timestamp > last24Hours);
  
  return {
    totalEvents: recentLogs.length,
    xssAttempts: recentLogs.filter(log => log.type === 'XSS_ATTEMPT').length,
    invalidInputs: recentLogs.filter(log => log.type === 'INVALID_INPUT').length,
    suspiciousPatterns: recentLogs.filter(log => log.type === 'SUSPICIOUS_PATTERN').length,
    dataAnomalies: recentLogs.filter(log => log.type === 'DATA_ANOMALY').length,
    lastEvent: recentLogs[0]
  };
}

/**
 * Initialize security monitoring
 */
export function initializeSecurityMonitoring(): void {
  // Monitor for console access attempts
  if (typeof window !== 'undefined') {
    const originalConsole = { ...console };
    
    // Override console methods to detect potential debugging attempts
    ['log', 'warn', 'error', 'info'].forEach(method => {
      (console as any)[method] = (...args: any[]) => {
        // Check for suspicious console usage patterns
        const argString = args.join(' ');
        if (detectSuspiciousInput(argString)) {
          logSecurityEvent({
            type: 'SUSPICIOUS_PATTERN',
            message: 'Suspicious console usage detected',
            data: { method, args: args.slice(0, 3) } // Limit logged args
          });
        }
        
        // Call original method
        (originalConsole as any)[method](...args);
      };
    });
  }
  
  console.info('🔒 Security monitoring initialized');
}