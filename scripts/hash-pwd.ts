import { getSha256 } from "../lib/crypto";

const input = process.argv[2];

getSha256(input).then((output) => {
    console.log();
    console.log(`SHA256 "${input}" => ${output}`)
    console.log();
});

export {};