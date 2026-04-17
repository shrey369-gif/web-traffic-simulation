/**
 * Java Fallback Service Layer
 * Handles communication with optional Java backend for intensive computations
 * Falls back gracefully to client-side simulation if backend unavailable
 */

interface JavaBackendConfig {
  url: string;
  timeout: number;
  retries: number;
}

class JavaFallbackService {
  private config: JavaBackendConfig;
  private isAvailable: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<JavaBackendConfig>) {
    this.config = {
      url: config?.url || process.env.NEXT_PUBLIC_JAVA_BACKEND_URL || 'http://localhost:8080',
      timeout: config?.timeout || 5000,
      retries: config?.retries || 2,
    };
  }

  /**
   * Check if Java backend is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.url}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      this.isAvailable = response.ok;
      return this.isAvailable;
    } catch (error) {
      console.log('[v0] Java backend health check failed:', error);
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks(intervalMs: number = 30000): void {
    if (this.healthCheckInterval) return;

    this.healthCheckInterval = setInterval(() => {
      this.checkHealth();
    }, intervalMs);
  }

  /**
   * Stop periodic health checks
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Simulate with Java backend if available, otherwise return null for client-side fallback
   */
  async simulateScenario(
    roadNetwork: any,
    parameters: any,
    duration: number
  ): Promise<any | null> {
    if (!this.isAvailable) return null;

    try {
      const response = await fetch(`${this.config.url}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roadNetwork,
          parameters,
          duration,
          format: 'json',
        }),
      });

      if (!response.ok) {
        this.isAvailable = false;
        return null;
      }

      return await response.json();
    } catch (error) {
      console.log('[v0] Java backend simulation failed:', error);
      this.isAvailable = false;
      return null;
    }
  }

  /**
   * Export scenario to MATLAB format via Java backend
   */
  async exportToMatlab(
    roadNetwork: any,
    simulationData: any,
    fileName: string
  ): Promise<Blob | null> {
    if (!this.isAvailable) return null;

    try {
      const response = await fetch(`${this.config.url}/api/export/matlab`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roadNetwork,
          simulationData,
          fileName,
        }),
      });

      if (!response.ok) return null;
      return await response.blob();
    } catch (error) {
      console.log('[v0] MATLAB export failed:', error);
      return null;
    }
  }

  /**
   * Get backend status
   */
  getStatus(): {
    available: boolean;
    url: string;
  } {
    return {
      available: this.isAvailable,
      url: this.config.url,
    };
  }
}

// Singleton instance
let instance: JavaFallbackService | null = null;

export function getJavaFallbackService(config?: Partial<JavaBackendConfig>): JavaFallbackService {
  if (!instance) {
    instance = new JavaFallbackService(config);
  }
  return instance;
}

export type { JavaBackendConfig };
