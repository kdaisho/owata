## Deployment

Running PM2 for Deno is a bit different for Node.js.

- Deno.env does nothing in prod. You'll need to pull a third-party, e.g. dotenv,
  just like Node.js
- Use interpreter flag as follows:

```sh
pm2 start --interpreter="deno" --interpreter-args="run --allow-read --allow-net --allow-env" index.ts --name owata
```
