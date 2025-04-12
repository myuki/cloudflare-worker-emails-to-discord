# Cloudflare Worker Emails to Discord

Use Cloudflare Email Worker to Forward the email to multiple discord webhooks.

# Environment Variable (Secret)

| Name                   | Description                                            | Example                                                                               |
| ---------------------- |------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `DISCORD_WEBHOOK_URLS` | The discord webhook urls, separated by `,`             | `https://discord.com/api/webhooks/example1,https://discord.com/api/webhooks/example2` |
| `FORWARD_ADDRESSES`    | Forward the email to these addresses, separated by `,` | `example1@example1.com,example2@example2.com`                                         |
| `FORCE_CONVERT_HTML `  | Enable force conversion of HTML to text                | `true`                                                                                |
