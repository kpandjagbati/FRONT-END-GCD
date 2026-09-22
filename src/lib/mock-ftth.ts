import { mockDelay } from "@/lib/mock-delay";

export type FtthRow = {
  id: string;
  ligne: string;
  login: string;
};

const MOCK_FTTH: FtthRow[] = [
  { id: "1", ligne: "22890123456", login: "ftth.lome.12045" },
  { id: "2", ligne: "22891169206", login: "ftth.lome.11802" },
  { id: "3", ligne: "22891150681", login: "ftth.kara.09411" },
];

export function searchFtthMock(localNumber = ""): Promise<FtthRow[]> {
  const digits = localNumber.replace(/\D/g, "");
  const ligne = digits ? (digits.startsWith("228") ? digits : `228${digits}`) : "";
  const found = MOCK_FTTH.find(
    (row) => row.ligne === ligne || (digits.length >= 8 && row.ligne.endsWith(digits.slice(-8))),
  );
  const row =
    found ??
    ({
      id: "lookup",
      ligne: ligne || MOCK_FTTH[0].ligne,
      login: digits ? `ftth.lome.${digits.slice(-5)}` : MOCK_FTTH[0].login,
    } satisfies FtthRow);

  return mockDelay([row]);
}
