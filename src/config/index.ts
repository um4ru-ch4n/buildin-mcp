import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { z } from 'zod';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Config file schema
const ConfigSchema = z.object({
  api: z.object({
    base_url: z.string().url(),
    timeout_ms: z.number().positive(),
  }),
  rate_limits: z.object({
    read_per_minute: z.number().positive(),
    write_per_minute: z.number().positive(),
    batch_per_minute: z.number().positive(),
  }),
  retry: z.object({
    max_attempts: z.number().int().positive(),
    initial_delay_ms: z.number().positive(),
    backoff_multiplier: z.number().positive(),
    max_delay_ms: z.number().positive(),
  }),
  pagination: z.object({
    default_page_size: z.number().int().positive(),
    max_page_size: z.number().int().positive(),
  }),
  logging: z.object({
    default_level: z.enum(['debug', 'info', 'warn', 'error']),
  }),
});

// Env schema
const EnvSchema = z.object({
  BUILDIN_BOT_TOKEN: z.string().min(1, 'BUILDIN_BOT_TOKEN is required'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('production'),
});

export type AppConfig = z.infer<typeof ConfigSchema>;
export type AppEnv = z.infer<typeof EnvSchema>;

function loadConfig(): AppConfig {
  // Walk up from dist/ or src/ to find config.yaml at project root
  const configPath = resolve(__dirname, '..', '..', 'config.yaml');
  const raw = readFileSync(configPath, 'utf-8');
  const parsed = yaml.load(raw);
  return ConfigSchema.parse(parsed);
}

function loadEnv(): AppEnv {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Environment validation failed:\n${issues}`);
  }
  return result.data;
}

let _config: AppConfig | null = null;
let _env: AppEnv | null = null;

export function getConfig(): AppConfig {
  if (!_config) _config = loadConfig();
  return _config;
}

export function getEnv(): AppEnv {
  if (!_env) _env = loadEnv();
  return _env;
}
