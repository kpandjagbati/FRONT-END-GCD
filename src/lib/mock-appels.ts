import { mockDelay } from "@/lib/mock-delay";

export type AppelRow = {
  id: string;
  date: string;
  heure: string;
  appelant: string;
  appele: string;
  duree: string;
  type: string;
  imei: string;
  imsi: string;
};

const MOCK_APPELS: AppelRow[] = [
  { id: "1", date: "12-04-2026", heure: "17:10:53", appelant: "22891169206", appele: "22890123456", duree: "00:03:12", type: "Voix", imei: "356938035643809", imsi: "208011234567890" },
  { id: "2", date: "12-04-2026", heure: "16:48:02", appelant: "22891150681", appele: "22890123456", duree: "00:01:04", type: "Voix", imei: "356938035643809", imsi: "208011234567890" },
  { id: "3", date: "12-04-2026", heure: "15:22:41", appelant: "22890123456", appele: "22891201263", duree: "00:00:08", type: "SMS", imei: "356938035643809", imsi: "208011234567890" },
  { id: "4", date: "11-04-2026", heure: "21:03:18", appelant: "22890123456", appele: "22891170341", duree: "00:12:47", type: "Voix", imei: "356938035643809", imsi: "208011234567890" },
  { id: "5", date: "11-04-2026", heure: "19:44:09", appelant: "22891225114", appele: "22890123456", duree: "00:02:21", type: "Voix", imei: "356938035643809", imsi: "208011234567890" },
  { id: "6", date: "11-04-2026", heure: "13:12:33", appelant: "22890123456", appele: "22891239979", duree: "00:00:02", type: "SMS", imei: "356938035643809", imsi: "208011234567890" },
  { id: "7", date: "10-04-2026", heure: "09:07:55", appelant: "22890011223", appele: "22890123456", duree: "00:06:40", type: "Voix", imei: "356938035643809", imsi: "208011234567890" },
  { id: "8", date: "10-04-2026", heure: "08:31:14", appelant: "22890123456", appele: "22890998877", duree: "00:04:18", type: "Voix", imei: "356938035643809", imsi: "208011234567890" },
  { id: "9", date: "09-04-2026", heure: "22:15:02", appelant: "22890123456", appele: "22891169206", duree: "00:00:41", type: "Voix", imei: "356938035643809", imsi: "208011234567890" },
  { id: "10", date: "09-04-2026", heure: "18:02:47", appelant: "22891150681", appele: "22890123456", duree: "00:09:05", type: "Voix", imei: "356938035643809", imsi: "208011234567890" },
  { id: "11", date: "08-04-2026", heure: "11:28:19", appelant: "22890123456", appele: "22891201263", duree: "00:01:33", type: "SMS", imei: "356938035643809", imsi: "208011234567890" },
  { id: "12", date: "08-04-2026", heure: "07:54:06", appelant: "22891170341", appele: "22890123456", duree: "00:05:11", type: "Voix", imei: "356938035643809", imsi: "208011234567890" },
  { id: "13", date: "07-04-2026", heure: "20:40:28", appelant: "22890123456", appele: "22891225114", duree: "00:14:02", type: "Voix", imei: "356938035643809", imsi: "208011234567890" },
  { id: "14", date: "07-04-2026", heure: "16:17:53", appelant: "22891239979", appele: "22890123456", duree: "00:00:19", type: "SMS", imei: "356938035643809", imsi: "208011234567890" },
  { id: "15", date: "06-04-2026", heure: "12:09:44", appelant: "22890123456", appele: "22890011223", duree: "00:02:58", type: "Voix", imei: "356938035643809", imsi: "208011234567890" },
  { id: "16", date: "06-04-2026", heure: "10:33:21", appelant: "22890998877", appele: "22890123456", duree: "00:07:26", type: "Voix", imei: "356938035643809", imsi: "208011234567890" },
  { id: "17", date: "05-04-2026", heure: "23:11:08", appelant: "22890123456", appele: "22891169206", duree: "00:00:54", type: "Voix", imei: "356938035643809", imsi: "208011234567890" },
  { id: "18", date: "05-04-2026", heure: "14:46:37", appelant: "22890123456", appele: "22891150681", duree: "00:03:49", type: "SMS", imei: "356938035643809", imsi: "208011234567890" },
  { id: "19", date: "04-04-2026", heure: "09:25:15", appelant: "22891201263", appele: "22890123456", duree: "00:11:07", type: "Voix", imei: "356938035643809", imsi: "208011234567890" },
  { id: "20", date: "04-04-2026", heure: "08:02:40", appelant: "22890123456", appele: "22891170341", duree: "00:01:22", type: "Voix", imei: "356938035643809", imsi: "208011234567890" },
  { id: "21", date: "03-04-2026", heure: "19:18:59", appelant: "22891225114", appele: "22890123456", duree: "00:08:33", type: "Voix", imei: "356938035643809", imsi: "208011234567890" },
  { id: "22", date: "03-04-2026", heure: "13:51:12", appelant: "22890123456", appele: "22891239979", duree: "00:00:06", type: "SMS", imei: "356938035643809", imsi: "208011234567890" },
  { id: "23", date: "02-04-2026", heure: "11:04:27", appelant: "22890011223", appele: "22890123456", duree: "00:04:45", type: "Voix", imei: "356938035643809", imsi: "208011234567890" },
  { id: "24", date: "02-04-2026", heure: "06:39:01", appelant: "22890123456", appele: "22890998877", duree: "00:02:17", type: "Voix", imei: "356938035643809", imsi: "208011234567890" },
];

export function searchAppelsMock(): Promise<AppelRow[]> {
  return mockDelay(MOCK_APPELS);
}
