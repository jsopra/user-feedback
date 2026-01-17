# Deployment Best Practices

Este documento fornece orientações para um deployment seguro e confiável do User Feedback System.

## Preparação para Produção

### 1. Checklist Pré-Deploy

Antes de fazer deploy para produção, certifique-se de:

#### Segurança
- [ ] Todas as variáveis de ambiente sensíveis estão definidas
- [ ] Usuário admin criado com senha forte (mínimo 12 caracteres)
- [ ] `NODE_ENV=production` configurado
- [ ] Build passa sem warnings (`pnpm build`)
- [ ] Audit de segurança executado (`pnpm audit`)
- [ ] Nenhuma credencial hardcoded no código
- [ ] `.env` files não estão no repositório

#### Configuração
- [ ] Banco de dados em produção configurado (Supabase ou PostgreSQL)
- [ ] Migrations executadas com sucesso
- [ ] CORS configurado para seus domínios
- [ ] Rate limiting implementado (Cloudflare, nginx ou middleware)
- [ ] Logs configurados (não usar console.log em produção)
- [ ] Backup automático do banco configurado

#### Performance
- [ ] Build otimizado gerado (`pnpm build`)
- [ ] Imagens otimizadas
- [ ] Cache configurado (CDN/Edge)
- [ ] Compressão gzip/brotli habilitada

### 2. Variáveis de Ambiente

```bash
# Arquivo .env.production (não commitar!)

# Ambiente
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Manter SECRETO!

# Next.js (se necessário)
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=generated-secret-here
```

### 3. Deploy com Docker

#### Produção com Docker

```bash
# Build
docker build -t user-feedback:latest .

# Verificar imagem
docker images | grep user-feedback

# Run (usando .env.production)
docker run -d \
  --name user-feedback-prod \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  user-feedback:latest

# Verificar logs
docker logs -f user-feedback-prod

# Health check
curl http://localhost:3000/api/health
```

#### Docker Compose Produção

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 4. Nginx Reverse Proxy (Recomendado)

```nginx
# /etc/nginx/sites-available/user-feedback

upstream user_feedback {
    server localhost:3000;
}

server {
    listen 80;
    server_name seu-dominio.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com;

    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Logs
    access_log /var/log/nginx/user-feedback-access.log;
    error_log /var/log/nginx/user-feedback-error.log;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://user_feedback;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Plataformas de Deploy

#### Vercel

1. Conecte seu repositório GitHub
2. Configure variáveis de ambiente no dashboard
3. Deploy automático a cada push

```bash
# vercel.json
{
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "DATABASE_URL": "@database-url",
      "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
      "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key"
    }
  }
}
```

#### Railway

1. Conecte repositório
2. Configure variáveis de ambiente
3. Deploy automático

#### DigitalOcean App Platform

1. Crie novo App
2. Conecte repositório
3. Configure environment variables
4. Deploy

### 6. Monitoramento

#### Logs Centralizados

Configure logs para serviços como:
- **Papertrail**
- **Loggly**
- **DataDog**
- **New Relic**

#### Uptime Monitoring

Configure monitoramento com:
- **UptimeRobot**
- **Pingdom**
- **StatusCake**

#### APM (Application Performance Monitoring)

- **Sentry** - Error tracking
- **New Relic** - Performance
- **DataDog** - Full stack observability

### 7. Backup e Recuperação

#### Banco de Dados

```bash
# Backup automático (cron job diário)
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Retenção: manter últimos 30 dias
find /backups -name "db_*.sql.gz" -mtime +30 -delete
```

#### Backup Supabase

Supabase faz backup automático, mas você pode:
1. Acessar Dashboard → Database → Backups
2. Configurar Point-in-Time Recovery (PITR)
3. Fazer backups manuais antes de mudanças críticas

### 8. Scaling

#### Horizontal Scaling

Com Docker e load balancer:

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  app:
    build: .
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - app
```

#### Database Scaling

- Use Supabase Pro ou Enterprise para read replicas
- Configure connection pooling (pgBouncer)
- Implemente caching (Redis)

### 9. Atualizações

```bash
# 1. Backup do banco
pg_dump $DATABASE_URL > backup_pre_update.sql

# 2. Pull latest code
git pull origin main

# 3. Update dependencies
pnpm install

# 4. Run new migrations
pnpm migrate

# 5. Build
pnpm build

# 6. Restart service
docker-compose restart
# ou
systemctl restart user-feedback

# 7. Verify
curl https://seu-dominio.com/api/health
```

### 10. Troubleshooting

#### Logs

```bash
# Docker
docker logs -f user-feedback-prod

# PM2
pm2 logs user-feedback

# Nginx
tail -f /var/log/nginx/user-feedback-error.log
```

#### Common Issues

**Problema:** 500 Internal Server Error
- Verificar logs da aplicação
- Verificar conexão com banco
- Verificar variáveis de ambiente

**Problema:** Migrations falhando
- Verificar DATABASE_URL
- Verificar se `psql` está instalado
- Executar migrations manualmente

**Problema:** Performance lenta
- Verificar queries no banco
- Adicionar índices necessários
- Configurar cache
- Usar CDN para assets estáticos

## Contato

Para suporte em produção:
- GitHub Issues: https://github.com/jsopra/user-feedback/issues
- Security: Veja [SECURITY.md](SECURITY.md)
