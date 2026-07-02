import { customAlphabet, nanoid } from "nanoid";

// Short, easy-to-share session id (used in the URL, e.g. /board/x7f3k9qp).
// Alphabet excludes look-alike characters (0/O, 1/l/I) to avoid copy/paste mistakes.
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

export const generateSessionId = customAlphabet(ALPHABET, 8);

// Longer opaque secret known only to the session creator, never returned by
// GET /api/sessions/:id. Lets the host reclaim host privileges (e.g. permission
// to "end session") after a page refresh, since their socket.id changes on
// every reconnect but this token doesn't.
export const generateHostToken = () => nanoid(24);
