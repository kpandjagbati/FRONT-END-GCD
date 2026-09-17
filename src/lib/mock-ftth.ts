import { mockDelay } from "@/lib/mock-delay";

export type FtthRow = {
  id: string;
  ligne: string;
  login: string;
  offre: string;
  statut: string;
  dateCreation: string;
};

const MOCK_FTTH: FtthRow[] = [
  { id: "1", ligne: "22890123456", login: "ftth.lome.12045", offre: "Fibre 100 Mo", statut: "Actif", dateCreation: "12-04-2023 17:10:53" },
  { id: "2", ligne: "22891169206", login: "ftth.lome.11802", offre: "Fibre 50 Mo", statut: "Actif", dateCreation: "03-06-2022 04:47:18" },
  { id: "3", ligne: "22891150681", login: "ftth.kara.09411", offre: "Fibre 200 Mo", statut: "Suspendu", dateCreation: "13-08-2021 15:12:06" },
];

export function searchFtthMock(): Promise<FtthRow[]> {
  return mockDelay(MOCK_FTTH);
}
