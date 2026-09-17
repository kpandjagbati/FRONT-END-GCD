import { mockDelay } from "@/lib/mock-delay";

export type IdentiteRow = {
  id: string;
  nom: string;
  prenoms: string;
  naissance: string;
  typePiece: string;
  numPiece: string;
  mobile: string;
  dateCreation: string;
  dateActualisation: string;
};

const MOCK_IDENTITES: IdentiteRow[] = [
  { id: "1", nom: "KPANDJA", prenoms: "DJATO", naissance: "30-09-1972", typePiece: "national_id", numPiece: "0137-164-2063", mobile: "22891169206", dateCreation: "11-08-2012 16:26:15", dateActualisation: "08-10-2024 09:12:03" },
  { id: "2", nom: "KPANDJA", prenoms: "GMATCHAME", naissance: "31-12-1985", typePiece: "voter_card", numPiece: "T000009858/101110", mobile: "22891150681", dateCreation: "03-06-2012 04:47:18", dateActualisation: "09-10-2024 11:04:22" },
  { id: "3", nom: "KPANDJA", prenoms: "TIMOLA", naissance: "26-05-1996", typePiece: "voter_card", numPiece: "5-106-02-00-07-01-02-00066", mobile: "22891201263", dateCreation: "12-04-2023 17:10:53", dateActualisation: "12-04-2026 08:20:11" },
  { id: "4", nom: "KPANDJA", prenoms: "KOKOUVI", naissance: "22-11-1991", typePiece: "voter_card", numPiece: "1-107-01-00-05-01-17-02622", mobile: "22891170341", dateCreation: "13-08-2021 15:12:06", dateActualisation: "13-08-2025 16:44:09" },
  { id: "5", nom: "KPANDJA", prenoms: "BIO CHERIF", naissance: "23-07-1973", typePiece: "national_id", numPiece: "0895-864-0064", mobile: "22891225114", dateCreation: "05-04-2019 13:12:23", dateActualisation: "22-06-2025 10:03:41" },
  { id: "6", nom: "KPANDJA", prenoms: "ARMEL MOLLAH", naissance: "16-08-2001", typePiece: "national_id", numPiece: "12846045063", mobile: "22891239979", dateCreation: "28-05-2021 15:53:12", dateActualisation: "28-05-2025 18:09:30" },
  { id: "7", nom: "KPANDJA", prenoms: "AMA", naissance: "14-02-1988", typePiece: "national_id", numPiece: "0744-221-1180", mobile: "22890011223", dateCreation: "02-03-2016 09:18:44", dateActualisation: "02-03-2026 09:18:44" },
  { id: "8", nom: "KPANDJA", prenoms: "YAO", naissance: "09-11-1994", typePiece: "voter_card", numPiece: "T000012441/204210", mobile: "22890998877", dateCreation: "19-07-2018 11:05:02", dateActualisation: "19-07-2025 12:40:17" },
  { id: "9", nom: "KPANDJA", prenoms: "SENYO", naissance: "03-01-1979", typePiece: "national_id", numPiece: "0551-902-4412", mobile: "22890123456", dateCreation: "08-01-2014 07:22:51", dateActualisation: "08-01-2026 07:22:51" },
  { id: "10", nom: "KPANDJA", prenoms: "FELICITE", naissance: "27-06-1999", typePiece: "voter_card", numPiece: "2-108-03-01-04-02-11-01408", mobile: "22890334455", dateCreation: "21-09-2020 16:31:08", dateActualisation: "21-09-2025 16:31:08" },
  { id: "11", nom: "KPANDJA", prenoms: "KODJO", naissance: "18-04-1982", typePiece: "national_id", numPiece: "1022-774-3301", mobile: "22890776688", dateCreation: "14-11-2015 10:09:27", dateActualisation: "14-11-2025 10:09:27" },
  { id: "12", nom: "KPANDJA", prenoms: "AFI", naissance: "05-12-2000", typePiece: "national_id", numPiece: "3341-118-2098", mobile: "22890445566", dateCreation: "30-01-2022 08:14:39", dateActualisation: "30-01-2026 08:14:39" },
];

export function searchIdentitesMock(): Promise<IdentiteRow[]> {
  return mockDelay(MOCK_IDENTITES);
}
