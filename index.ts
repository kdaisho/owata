import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";
import { decode, encode } from "./lib/utils.ts";

const books = new Map<string, Record<string, string>>();
books.set("1", {
    id: "1",
    title: "The Hound of the Baskervilles",
    author: "Conan Doyle, Arthur"
});

const decoder = new TextDecoder("utf-8");
const router = new Router();

router
    .get("/", async context => {
        const data = await Deno.readFile("index.html");
        const html = decoder.decode(data);
        context.response.headers.set("Content-Type", "text/html");
        context.response.body = html;
    })
    .post("/encode", async ({ request, response }) => {
        const res = await request.body.formData();
        const url = res.get("url");
        let result = "";
        if (typeof url === "string") {
            result = encode(url);
            result = decode(result);
        }
        console.log("==> END", result);
        response.body = result;
    })
    .get("/book", ({ response }) => {
        console.log("==>", books.values());
        response.body = Array.from(books.values());
    })
    .get("/book/:id", ({ response, params }) => {
        if (books.has(params?.id)) {
            response.body = books.get(params.id);
            return;
        }
        response.status = 404;
        response.body = { message: "No book Found" };
    });

const app = new Application();

app.use(async (context, next) => {
    try {
        await context.send({
            root: `${Deno.cwd()}/static`,
            index: "index200.html"
        });
    } catch {
        await next();
    }
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(context => {
    if (context.response.status === 404) {
        context.response.status = 404;
        context.response.body = { message: "Not Found" };
    }
});

await app
    .listen({ port: 8000 })
    .then(() => {
        console.log("==>", "Server is running on http://localhost:8000");
    })
    .finally(() => {
        console.log("==>", "Server is stopped2");
    });
