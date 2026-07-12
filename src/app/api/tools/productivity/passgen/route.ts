import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "node:crypto";

type PasswordOptions = {
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
};

const CHARACTER_GROUPS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
};

function secureCharacter(characters: string) {
  return characters[randomInt(characters.length)];
}

function shuffle(values: string[]) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
  return values;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as PasswordOptions & { length?: number };
    const length = Math.min(128, Math.max(8, Number.isFinite(body.length) ? Math.floor(body.length as number) : 16));
    const options = {
      uppercase: body.uppercase ?? true,
      lowercase: body.lowercase ?? true,
      numbers: body.numbers ?? true,
      symbols: body.symbols ?? true,
    };
    const groups = (Object.keys(options) as Array<keyof typeof options>)
      .filter((key) => options[key])
      .map((key) => CHARACTER_GROUPS[key]);

    if (groups.length === 0) {
      return NextResponse.json({ error: "Select at least one character type." }, { status: 400 });
    }

    const allCharacters = groups.join("");
    const passwordCharacters = groups.map(secureCharacter);
    while (passwordCharacters.length < length) passwordCharacters.push(secureCharacter(allCharacters));
    const password = shuffle(passwordCharacters).join("");

    return NextResponse.json({ 
      success: true, 
      result: password,
      length,
    });

  } catch {
    return NextResponse.json({ error: "Failed to generate password" }, { status: 500 });
  }
}
