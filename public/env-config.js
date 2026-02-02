// Runtime configuration — overwritten by Docker entrypoint at container start.
// During local development this file is served as-is (empty config),
// so import.meta.env values from .env are used as the fallback.
window.__RUNTIME_CONFIG__ = {};
