import { Link } from "../models/Link";
import { SHORTEN_LINK_LENGTH } from "../config/constants";

export function generateShortenLink(
    links: Link[]
): string {
    let shortenLink = "";

    do {
        shortenLink = generateRandomString(SHORTEN_LINK_LENGTH);
    } while (links.find(link => link.shortenUrl === shortenLink));

    console.log(`generated random string ${shortenLink}`);
    return shortenLink;
}

function generateRandomString(
    length: number
): string {
    let result = "";
    let characters = "abcdefghijklmnopqrstuvwxyz";
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
