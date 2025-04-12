# Cloudflare Worker Emails to Discord

Use Email Workers to forward the emails you receive to a discord webhook! This handles respecting Discord's various embed limits, trimming if necessary, and attaching email as an attachment.

# AGPL

Note this uses the postal-mime library which is AGPL. It's the only decent browser/working in Cloudflare Workers (not dependent on Node) email parsing library that I could find. If you find another one with less restrictive licensing, please let me know!

# How to setup:

Create a webhook to the channel you want your emails in:
https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks

Add it as a secret:

i.e from CLI, you can do: `wrangler secret put DISCORD_WEBHOOK_URLS`

Then enter your webhook urls (separated by `,`), fully qualified with https:// and the domain, for example:

`https://discord.com/api/webhooks/1062548905558016052/uz0cLqaJYtcFp78I5WYsBcc1MOQ4AAX1xMDafVAiuJRqp7sQdWhR1dXkvKx0oADFakSA,https://discord.com/api/webhooks/1062548905558016052/uz0cLqaJYtcFp78I5WYsBcc1MOQ4AAX1xMDafVAiuJRqp7sQdWhR1dXkvKx0oADFakSB`

then deploy, i.e `npx wrangler deploy`. Create the email routes to the worker within the dashboard as you like. Note that a worker running will override any normal forwarding you have on the domain, so you have to use the option below if you want that.

You can also forward to an address if you want, just set the `FORWARD_ADDRESSES` secret the same way to verified destination addresses you have. If you want to send to more then one, you can just modify the script.

# Limit

Any emails over the discord embed description size limit will be trimmed, and the full contents uploaded as files.

The file will still be trimmed (and the name will reflect that, email-trimmed.txt), if it is over 8MB, the default upload limit. 

If you have a boosted server, Level 2 (50MB) or Level 3 (100MB), you can change that constant in the code to not unnecessarily trim files until they hit your limit. 

Note that the current limit of Cloudflare's Postmaster (inbound email service) is 25MB.

# Warning:

There is currently no sanity checks/retries with this. If your message fails to send to your discord webhook, or the worker fails to parse the email in time, the email will just be rejected (521 5.3.0 Upstream error). You can set up forwarding to an address, which will occur before any parsing/discordhook sending.

It will still forward your email without issue if you have that enabled, as it tries that first.
