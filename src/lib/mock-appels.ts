import { mockDelay } from "@/lib/mock-delay";

export type AppelRow = {
  id: string;
  appelant: string;
  appele: string;
  identiteAppelee: string;
  date: string;
  heure: string;
  duree: string;
  type: string;
  sens: string;
  imsi: string;
  imei: string;
  localisation: string;
};

export const APPELS_RESULT_META = {
  nom: "TEST KITDATA DEV TEST KITDATA DEV",
  adresse: "rue gta",
  abonne: "22870210044",
  periodeDebut: "16-09-2026",
  periodeFin: "17-09-2026",
};

const MOCK_APPELS: AppelRow[] = [
  { id: "1", appelant: "22870210044", appele: "Yas", identiteAppelee: "", date: "2026-09-16", heure: "09:20:02", duree: "", type: "SMS", sens: "E", imsi: "615010115807151", imei: "86923604895075", localisation: "L_2_WOUGOMEDEKPO-MOOV_L18_3" },
  { id: "2", appelant: "22870210044", appele: "Yas", identiteAppelee: "", date: "2026-09-16", heure: "10:01:17", duree: "", type: "SMS", sens: "E", imsi: "615010115807151", imei: "86923604895075", localisation: "L_0_ADIDOADIN_L18_1" },
  { id: "3", appelant: "22870210044", appele: "LEMA", identiteAppelee: "", date: "2026-09-16", heure: "16:48:39", duree: "", type: "SMS", sens: "E", imsi: "615010115807151", imei: "86923604895075", localisation: "L_3_GTA_L18_3" },
  { id: "4", appelant: "22870210044", appele: "LEMA", identiteAppelee: "", date: "2026-09-16", heure: "16:48:39", duree: "", type: "SMS", sens: "E", imsi: "615010115807151", imei: "86923604895075", localisation: "L_3_GTA_L18_3" },
  { id: "5", appelant: "22870210044", appele: "LEMA", identiteAppelee: "", date: "2026-09-16", heure: "16:48:39", duree: "", type: "SMS", sens: "E", imsi: "615010115807151", imei: "86923604895075", localisation: "L_3_GTA_L18_3" },
  { id: "6", appelant: "22870210044", appele: "SPLAB", identiteAppelee: "", date: "2026-09-17", heure: "09:21:03", duree: "", type: "SMS", sens: "E", imsi: "615010115807151", imei: "86923604895075", localisation: "L_3_GTA_L18_3" },
  { id: "7", appelant: "22870210044", appele: "SPLAB", identiteAppelee: "", date: "2026-09-17", heure: "09:30:36", duree: "", type: "SMS", sens: "E", imsi: "615010115807151", imei: "86923604895075", localisation: "L_3_GTA_L18_3" },
  { id: "8", appelant: "22870210044", appele: "SPLAB", identiteAppelee: "", date: "2026-09-17", heure: "11:56:32", duree: "", type: "SMS", sens: "E", imsi: "615010115807151", imei: "86923604895075", localisation: "L_3_GTA_L18_3" },
  { id: "9", appelant: "22870210044", appele: "SPLAB", identiteAppelee: "", date: "2026-09-17", heure: "11:56:33", duree: "", type: "SMS", sens: "E", imsi: "615010115807151", imei: "86923604895075", localisation: "L_3_GTA_L18_3" },
  { id: "10", appelant: "22870210044", appele: "SPLAB", identiteAppelee: "", date: "2026-09-17", heure: "12:05:05", duree: "", type: "SMS", sens: "E", imsi: "615010115807151", imei: "86923604895075", localisation: "L_3_GTA_L18_3" },
  { id: "11", appelant: "22870210044", appele: "SPLAB", identiteAppelee: "", date: "2026-09-17", heure: "12:07:05", duree: "", type: "SMS", sens: "E", imsi: "615010115807151", imei: "86923604895075", localisation: "L_3_TOGOCOM_L18_3" },
  { id: "12", appelant: "22870210044", appele: "SPLAB", identiteAppelee: "", date: "2026-09-17", heure: "12:07:59", duree: "", type: "SMS", sens: "E", imsi: "615010115807151", imei: "86923604895075", localisation: "L_3_TOGOCOM_L18_3" },
  { id: "13", appelant: "22870210044", appele: "SPLAB", identiteAppelee: "", date: "2026-09-17", heure: "12:08:00", duree: "", type: "SMS", sens: "E", imsi: "615010115807151", imei: "86923604895075", localisation: "L_3_TOGOCOM_L18_3" },
  { id: "14", appelant: "22870210044", appele: "SPLAB", identiteAppelee: "", date: "2026-09-17", heure: "12:18:48", duree: "", type: "SMS", sens: "E", imsi: "615010115807151", imei: "86923604895075", localisation: "L_3_GTA_L18_3" },
  { id: "15", appelant: "22870210044", appele: "Yas", identiteAppelee: "", date: "2026-09-17", heure: "13:16:27", duree: "", type: "SMS", sens: "E", imsi: "615010115807151", imei: "86923604895075", localisation: "L_3_GTA_L18_3" },
];

export function searchAppelsMock(): Promise<AppelRow[]> {
  return mockDelay(MOCK_APPELS);
}
