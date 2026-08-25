# Vultr static deployment

目标域名：`eason.sanhehangjm.cn`

该方案保留 GitHub Pages，并把同一份 Next.js 静态导出部署到 Vultr：

- GitHub Pages：`DEPLOY_TARGET=github-pages`、`NEXT_PUBLIC_BASE_PATH=/portfolio-site`
- Vultr：`DEPLOY_TARGET=vultr`、`NEXT_PUBLIC_BASE_PATH` 为空，网站从 `/` 提供
- `GITHUB_ACTIONS=true` 不再决定 base path；Vultr 在 GitHub Actions runner 上构建也不会带 `/portfolio-site`

## 需要先提供/确认的信息

目前还不能直接连接服务器或修改 DNS。需要确认：

1. Vultr 实例公网 IPv4；如启用 IPv6，再提供 IPv6
2. Linux 发行版/版本
3. SSH 主机、端口、登录用户，以及该用户是否能写入 `/var/www/eason.sanhehangjm.cn`
4. 是否允许安装 Nginx、rsync、Certbot
5. DNS 服务商后台是否可创建 `eason` 的 A/AAAA 记录
6. 用于 Let's Encrypt 的邮箱

不要在聊天中发送私钥、密码、Cookie 或 token。

## DNS

在 `sanhehangjm.cn` 的 DNS 服务商创建：

```text
类型  主机记录  值                         TTL
A     eason     <Vultr 公网 IPv4>           300/自动
AAAA  eason     <Vultr 公网 IPv6>           300/自动（仅在 IPv6 可用时）
```

本方案不需要把 `sanhehangjm.cn` 或 `www` 指向该站点；目标只有 `eason.sanhehangjm.cn`。

## 当前 HTTPS 方案

IPv4 的 Xray 入站已迁移到新端口，IPv6 旧入站保留；网站现在使用：

```text
Caddy IPv4 443 (HTTPS) -> Nginx 127.0.0.1:8080 (静态文件)
Caddy 8443 保留为回滚入口
Xray IPv6 443、IPv4 2053 继续运行
```

正式地址：`https://eason.sanhehangjm.cn/`。Caddy 负责证书签发和自动续期，Nginx 只监听 loopback。对应片段见 `deploy/caddy/eason.sanhehangjm.cn.clean-https.Caddyfile`；旧的 `deploy/caddy/eason.sanhehangjm.cn.mvp.Caddyfile` 仍用于 8443 回滚。

DNS 生效前可用以下方式验证虚拟主机：

```bash
curl --resolve eason.sanhehangjm.cn:80:<VULTR_IPV4> \
  -I http://eason.sanhehangjm.cn/
```

## Vultr 首次配置

以下命令在服务器终端执行。部署用户需要能写入部署目录，Nginx 只需要读取 `current`。

```bash
sudo apt update
sudo apt install -y nginx rsync certbot
sudo mkdir -p /var/www/eason.sanhehangjm.cn/releases /var/www/certbot
sudo chown -R <DEPLOY_USER>:<DEPLOY_USER> /var/www/eason.sanhehangjm.cn
sudo install -d -m 0755 /etc/nginx/snippets
```

复制本目录的 Nginx 文件到服务器：

```bash
sudo install -m 0644 deploy/nginx/portfolio-security-headers.conf \
  /etc/nginx/snippets/portfolio-security-headers.conf
sudo install -m 0644 deploy/nginx/eason.sanhehangjm.cn.http.conf \
  /etc/nginx/sites-available/eason.sanhehangjm.cn.conf
sudo ln -sfn /etc/nginx/sites-available/eason.sanhehangjm.cn.conf \
  /etc/nginx/sites-enabled/eason.sanhehangjm.cn.conf
sudo nginx -t
sudo systemctl reload nginx
```

确认 DNS 已指向 Vultr 且 80 端口可访问后申请证书：

```bash
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d eason.sanhehangjm.cn \
  --agree-tos \
  --email <LETS_ENCRYPT_EMAIL> \
  --no-eff-email
```

证书成功后切换最终 HTTPS 配置：

```bash
sudo install -m 0644 deploy/nginx/eason.sanhehangjm.cn.https.conf \
  /etc/nginx/sites-available/eason.sanhehangjm.cn.conf
sudo nginx -t
sudo systemctl reload nginx
sudo certbot renew --dry-run
```

防火墙至少允许 TCP `22`、`80`、`443`；不要关闭 SSH 后再切换 Nginx。

## GitHub Actions 自动部署

`.github/workflows/deploy-vultr.yml` 会在 `main` push 时运行测试和根路径构建。为避免服务器信息尚未配置时误部署，生产 deploy job 只有在仓库变量设置后才启用：

```text
VULTR_DEPLOY_ENABLED=true
VULTR_DEPLOY_ROOT=/var/www/eason.sanhehangjm.cn   # 可选，默认即此路径
```

在 GitHub 的 `vultr-production` Environment 中配置以下 Secrets：

```text
VULTR_HOST              Vultr 公网主机/IP
VULTR_PORT              SSH 端口；不填时工作流使用 22
VULTR_USER              部署用户
VULTR_SSH_PRIVATE_KEY   部署用 SSH 私钥
VULTR_KNOWN_HOSTS       服务器的 SSH host key 行
```

`VULTR_KNOWN_HOSTS` 应在可信终端核对后录入，避免工作流使用不安全的 `ssh-keyscan` 自动信任。工作流使用版本化目录：

```text
/var/www/eason.sanhehangjm.cn/releases/<commit-sha>/
/var/www/eason.sanhehangjm.cn/current -> releases/<commit-sha>
```

每次切换保留当前版本和一个旧版本。回滚时在服务器执行：

```bash
cd /var/www/eason.sanhehangjm.cn
ln -sfn releases/<OLD_COMMIT_SHA> .current-rollback
mv -Tf .current-rollback current
sudo nginx -t
sudo systemctl reload nginx
```

## 验证清单

部署后检查：

```bash
curl -I https://eason.sanhehangjm.cn/
curl -I https://eason.sanhehangjm.cn/work/cic-ai-assessment/
curl -I https://eason.sanhehangjm.cn/work/portfolio-site/
curl -I https://eason.sanhehangjm.cn/Zhicheng-Situ-CV.pdf
curl -I https://eason.sanhehangjm.cn/models/hero-delivery-system.glb
curl -I https://eason.sanhehangjm.cn/models/hero-delivery-system-A-editorial-light.glb
```

同时确认：

- HTTP 自动跳转 HTTPS
- 证书 SAN 包含 `eason.sanhehangjm.cn`
- `certbot.timer` 存在且 `certbot renew --dry-run` 成功
- CSS、JS、favicon、manifest、图片、GLB、PDF 和案例页链接均从根路径加载
- GitHub Pages 仍从 `/portfolio-site/` 加载，不受 Vultr 构建影响
