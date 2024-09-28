let salt: number;

try {
    salt = Number(Deno.env.get("SALT"));
} catch (_) {
    throw new Error("Invalid salt");
}

export function encode(input: string): string {
    let output = input;

    for (let i = 0; i < salt; i++) {
        const index = i % input.length;
        const charToAppend = input[index];
        output += charToAppend;
        output = btoa(output);
    }

    return output;
}

export function decode(input: string): string {
    let output = input;

    for (let i = 0; i < salt; i++) {
        output = atob(output);
        const length = output.length;
        const index = length - 1;

        output = output.slice(0, index);
    }

    return output;
}
