const blockedWords = [
  "aq",
  "amina",
  "orospu",
  "amk",
  "sik",
  "piç",
  "mal",
  "gerizekalı",
  "salak",
  "aptal",
  "şerefsiz",
  "haysiyetsiz",
  "ibne",
  "yavşak",
  "pezevenk",
  "kahpe",
  "sürtük",
  "bok",
  "boktan",
  "siktir",
  "sikik",
  "ananı",
  "avradını",
  "göt",
  "götveren",
  "dalyarak",
  "it",
  "eşek",
  "lan",
  "ulan",
];

export function findBlockedWord(text: string): string | null {
  const normalized = text.toLocaleLowerCase("tr-TR");
  return blockedWords.find((word) => new RegExp(`(^|[^a-zçğıöşü0-9])${word}([^a-zçğıöşü0-9]|$)`, "i").test(normalized)) ?? null;
}

export function containsProfanity(text: string): boolean {
  const normalized = text.toLocaleLowerCase("tr-TR").replace(/[._-]+/g, " ");
  return findBlockedWord(normalized) !== null;
}

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,30}$/.test(username) && !findBlockedWord(username);
}
