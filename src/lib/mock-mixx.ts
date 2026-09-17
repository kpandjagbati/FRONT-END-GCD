import { mockDelay } from "@/lib/mock-delay";

export type MixxRow = {
  id: string;
  date: string;
  heure: string;
  numero: string;
  reference: string;
  type: string;
  montant: string;
  statut: string;
};

const MOCK_MIXX: MixxRow[] = [
  { id: "1", date: "12-04-2026", heure: "17:10:53", numero: "22890123456", reference: "MX-884120", type: "Envoi", montant: "15 000 F", statut: "Succès" },
  { id: "2", date: "12-04-2026", heure: "14:22:11", numero: "22890123456", reference: "MX-884098", type: "Retrait", montant: "5 000 F", statut: "Succès" },
  { id: "3", date: "11-04-2026", heure: "19:44:09", numero: "22890123456", reference: "MX-883901", type: "Paiement", montant: "2 500 F", statut: "Succès" },
  { id: "4", date: "11-04-2026", heure: "09:07:55", numero: "22890123456", reference: "MX-883744", type: "Réception", montant: "20 000 F", statut: "Succès" },
  { id: "5", date: "10-04-2026", heure: "21:03:18", numero: "22890123456", reference: "MX-883510", type: "Envoi", montant: "8 000 F", statut: "Échoué" },
  { id: "6", date: "10-04-2026", heure: "13:12:33", numero: "22890123456", reference: "MX-883402", type: "Paiement", montant: "1 200 F", statut: "Succès" },
  { id: "7", date: "09-04-2026", heure: "18:02:47", numero: "22890123456", reference: "MX-883211", type: "Retrait", montant: "10 000 F", statut: "Succès" },
  { id: "8", date: "09-04-2026", heure: "08:31:14", numero: "22890123456", reference: "MX-883088", type: "Envoi", montant: "3 500 F", statut: "Succès" },
  { id: "9", date: "08-04-2026", heure: "22:15:02", numero: "22890123456", reference: "MX-882941", type: "Réception", montant: "7 000 F", statut: "Succès" },
  { id: "10", date: "08-04-2026", heure: "11:28:19", numero: "22890123456", reference: "MX-882770", type: "Paiement", montant: "4 800 F", statut: "Succès" },
  { id: "11", date: "07-04-2026", heure: "16:17:53", numero: "22890123456", reference: "MX-882501", type: "Envoi", montant: "12 000 F", statut: "Succès" },
  { id: "12", date: "07-04-2026", heure: "10:33:21", numero: "22890123456", reference: "MX-882388", type: "Retrait", montant: "6 000 F", statut: "Succès" },
];

export function searchMixxMock(): Promise<MixxRow[]> {
  return mockDelay(MOCK_MIXX);
}
