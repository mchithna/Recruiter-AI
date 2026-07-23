export function getEnv(name, defaultValue = '') {
  const runtimeValue = typeof window !== 'undefined'
    ? window.__APP_CONFIG__?.[name]
    : undefined;
  const buildValue = import.meta.env[name];
  const value = runtimeValue ?? buildValue ?? defaultValue;

  return typeof value === 'string' ? value.trim() : '';
}

export function requireEnv(name) {
  const value = getEnv(name);

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
