import PostalMime from "postal-mime";
import { convert } from "html-to-text";

export default {
  async email(message, env, ctx) {
    let forceConvertHtml = env.FORCE_CONVERT_HTML ? true : false;

    // Forward to email addresses
    let forwardPromiseList: Promise<void>[] = [];
    if (env.FORWARD_ADDRESSES) {
      const forwardAddresses: string = env.FORWARD_ADDRESSES.trim()
      const addressList = forwardAddresses.split(",")
      forwardPromiseList = addressList.map((address) =>
        forwardToAddress(message, address)
      )
    }

    // Parse email
    let rawEmail = new Response(message.raw);
    let arrayBuffer = await rawEmail.arrayBuffer();
    const parser = new PostalMime();
    const email = await parser.parse(arrayBuffer);

    const webhooks: string = env.DISCORD_WEBHOOK_URLS.trim()
    const webhookList = webhooks.split(",")

    const sendPromiseList = webhookList.map((webhook) =>
      sendToDiscord(webhook, email, message.from, message.to, forceConvertHtml)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`${response.url}: ${response.status} ${response.statusText}`);
          }
          return response.json()
        })
        .then((data) => console.log(data))
        .catch((err) => console.error(err))
    )

    await Promise.all([...forwardPromiseList, ...sendPromiseList])
  }
}

async function forwardToAddress(message, address: string) {
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (address && emailReg.test(address))
    await message.forward(address)
}

async function sendToDiscord(webhook: string, email: any, from: string, to: string, convertHtml: boolean): Promise<Response> {
  const text = convertHtml ? convert(email.html) : email.text;

  const title = trimToLimit(email.subject, 256);
  const description = trimToLimit(text, 4096);
  const author = { name: trimToLimit(email.from.name, 256) };
  const footer = { text: trimToLimit(`${from} -> ${to}`, 2048) };

  const embedBody = JSON.stringify({
    embeds: [
      {
        title: title,
        description: description,
        author: author,
        footer: footer,
      },
    ],
  });
  const formData = new FormData();
  formData.append("payload_json", embedBody);
  const response = await fetch(webhook, {
    method: "POST",
    body: formData,
  });
  return response
}

function trimToLimit(text: string, limit: number): string {
  return text.length > limit ? `${text.substring(0, limit - 3)}...` : text;
}
