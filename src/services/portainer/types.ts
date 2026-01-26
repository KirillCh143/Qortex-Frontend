// Container status types
export type ContainerStatus = 'running' | 'stopped' | 'paused';

// Container health types
export type ContainerHealth = 'healthy' | 'unhealthy' | 'none';

// Container interface
export interface Container {
  id: string;
  name: string;
  status: ContainerStatus;
  uptime: string;
  health: ContainerHealth;
}

// PortainerService interface for both mock and real implementations
export interface PortainerService {
  getContainers: () => Promise<Container[]>;
}
