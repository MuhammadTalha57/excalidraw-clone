import { customAlphabet, nanoid } from "nanoid";

const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

export const generateSessionId = customAlphabet(ALPHABET, 8);

export const generateHostToken = () => nanoid(24);
