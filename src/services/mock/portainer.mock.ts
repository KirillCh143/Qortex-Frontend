import { PortainerService, Container } from '../portainer/types';

// Mock container data with varied statuses
const mockContainers: Container[] = [
  {
    id: '1a2b3c4d5e6f',
    name: 'nexus-frontend',
    status: 'running',
    uptime: '2d 14h',
    health: 'healthy',
    port: '3000:3000',
    image: 'node:18-alpine',
  },
  {
    id: '2b3c4d5e6f7g',
    name: 'nexus-directus',
    status: 'running',
    uptime: '2d 14h',
    health: 'healthy',
    port: '8055:8055',
    image: 'directus/directus:latest',
  },
  {
    id: '3c4d5e6f7g8h',
    name: 'nexus-n8n',
    status: 'running',
    uptime: '2d 13h',
    health: 'none',
    port: '5678:5678',
    image: 'n8nio/n8n:latest',
  },
  {
    id: '4d5e6f7g8h9i',
    name: 'nexus-postgres',
    status: 'running',
    uptime: '5d 8h',
    health: 'healthy',
    port: '5432:5432',
    image: 'postgres:15-alpine',
  },
  {
    id: '5e6f7g8h9i0j',
    name: 'nexus-redis',
    status: 'running',
    uptime: '5d 8h',
    health: 'none',
    port: '6379:6379',
    image: 'redis:7.0-alpine',
  },
  {
    id: '6f7g8h9i0j1k',
    name: 'nexus-portainer',
    status: 'running',
    uptime: '5d 8h',
    health: 'none',
    port: '9443:9443',
    image: 'portainer/portainer-ce:latest',
  },
  {
    id: '7g8h9i0j1k2l',
    name: 'nexus-backup',
    status: 'stopped',
    uptime: '-',
    health: 'none',
    port: '-',
    image: 'alpine:latest',
  },
  {
    id: '8h9i0j1k2l3m',
    name: 'nexus-monitoring',
    status: 'stopped',
    uptime: '-',
    health: 'none',
    port: '-',
    image: 'grafana/grafana:latest',
  },
  {
    id: '9i0j1k2l3m4n',
    name: 'nexus-worker',
    status: 'paused',
    uptime: '5h 23m',
    health: 'none',
    port: '-',
    image: 'python:3.11-slim',
  },
  {
    id: '0j1k2l3m4n5o',
    name: 'nexus-cache',
    status: 'running',
    uptime: '1d 2h',
    health: 'unhealthy',
    port: '11211:11211',
    image: 'memcached:alpine',
  },
];

// Mock implementation
export const createMockPortainerService = (): PortainerService => ({
  async getContainers() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return [...mockContainers];
  },
});
