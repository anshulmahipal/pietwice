/**
 * Logger utility for development-only logging
 * All logs are automatically disabled in production builds
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LoggerConfig {
  enabled: boolean;
  showTimestamp: boolean;
  showLevel: boolean;
  prefix?: string;
}

class Logger {
  private config: LoggerConfig;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      enabled: __DEV__,
      showTimestamp: true,
      showLevel: true,
      prefix: '[pietwice]',
      ...config,
    };
  }

  private formatMessage(level: LogLevel, ...args: unknown[]): unknown[] {
    const parts: unknown[] = [];

    if (this.config.prefix) {
      parts.push(this.config.prefix);
    }

    if (this.config.showLevel) {
      parts.push(`[${level.toUpperCase()}]`);
    }

    if (this.config.showTimestamp) {
      const timestamp = new Date().toISOString();
      parts.push(`[${timestamp}]`);
    }

    return [...parts, ...args];
  }

  private shouldLog(): boolean {
    return this.config.enabled && __DEV__;
  }

  /**
   * Log general information (equivalent to console.log)
   */
  log(...args: unknown[]): void {
    if (!this.shouldLog()) return;
    console.log(...this.formatMessage('log', ...args));
  }

  /**
   * Log informational messages
   */
  info(...args: unknown[]): void {
    if (!this.shouldLog()) return;
    console.info(...this.formatMessage('info', ...args));
  }

  /**
   * Log warning messages
   */
  warn(...args: unknown[]): void {
    if (!this.shouldLog()) return;
    console.warn(...this.formatMessage('warn', ...args));
  }

  /**
   * Log error messages
   */
  error(...args: unknown[]): void {
    if (!this.shouldLog()) return;
    console.error(...this.formatMessage('error', ...args));
  }

  /**
   * Log debug messages
   */
  debug(...args: unknown[]): void {
    if (!this.shouldLog()) return;
    console.debug(...this.formatMessage('debug', ...args));
  }

  /**
   * Log grouped messages (useful for related logs)
   */
  group(label: string, callback: () => void): void {
    if (!this.shouldLog()) return;
    console.group(label);
    callback();
    console.groupEnd();
  }

  /**
   * Log a table (useful for arrays/objects)
   */
  table(data: unknown): void {
    if (!this.shouldLog()) return;
    console.table(data);
  }

  /**
   * Log with a custom label
   */
  labeled(label: string, ...args: unknown[]): void {
    if (!this.shouldLog()) return;
    console.log(`[${label}]`, ...args);
  }

  /**
   * Log performance timing
   */
  time(label: string): void {
    if (!this.shouldLog()) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (console as any).time(label);
  }

  /**
   * End performance timing
   */
  timeEnd(label: string): void {
    if (!this.shouldLog()) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (console as any).timeEnd(label);
  }

  /**
   * Clear console (use with caution)
   */
  clear(): void {
    if (!this.shouldLog()) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (console as any).clear();
  }

  /**
   * Log a separator line (useful for visual separation)
   */
  separator(char: string = '='): void {
    if (!this.shouldLog()) return;
    console.log(char.repeat(80));
  }

  /**
   * Update logger configuration
   */
  setConfig(config: Partial<LoggerConfig>): void {
    this.config = {...this.config, ...config};
  }

  /**
   * Enable/disable logger
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled && __DEV__;
  }
}

// Create default logger instance
const logger = new Logger();

// Export default logger instance
export default logger;

// Export Logger class for custom instances
export {Logger};

// Export convenience functions
export const log = (...args: unknown[]) => logger.log(...args);
export const info = (...args: unknown[]) => logger.info(...args);
export const warn = (...args: unknown[]) => logger.warn(...args);
export const error = (...args: unknown[]) => logger.error(...args);
export const debug = (...args: unknown[]) => logger.debug(...args);
