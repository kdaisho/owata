import { deflate, inflate } from "https://deno.land/x/compress@v0.4.5/mod.ts"

export function replaceValue(
  html: string,
  value: { [key: string]: string },
): string {
  let output = html
  for (const key in value) {
    output = output.replace(
      new RegExp(`{{\\s?${key}\\s?}}`, "g"),
      value[key],
    )
  }
  return output
}

let salt: number

try {
  salt = Number(Deno.env.get("SALT"))
} catch (_) {
  throw new Error("Invalid salt")
}

export function encrypt(input: string): string {
  return encode(deflate(new TextEncoder().encode(input)).toString())
}

export function decrypt(input: string): string {
  return new TextDecoder().decode(
    inflate(
      new Uint8Array(
        decode(input)
          .split(",")
          .map((str) => parseInt(str, 10)),
      ),
    ),
  )
}

function encode(input: string): string {
  let output = input

  for (let i = 0; i < salt; i++) {
    const index = i % input.length
    const charToAppend = input[index]
    output += charToAppend
    output = btoa(output)
  }

  return output
}

export function decode(input: string): string {
  let output = input

  for (let i = 0; i < salt; i++) {
    output = atob(output)
    const length = output.length
    const index = length - 1

    output = output.slice(0, index)
  }

  return output
}
