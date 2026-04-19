
## Διορθώσεις ExhibitDetail (2026-04-15)
- [x] Διόρθωση μαύρου overlay στην κύρια εικόνα
- [x] Εμφάνιση περιγραφής αντικειμένου
- [x] Εμφάνιση επιπλέον φωτογραφιών στο tab Πολυμέσα
- [x] Εμφάνιση 3D GLB αρχείων με model-viewer (CORS proxy για storage files)
- [x] Πλήρη μεταδεδομένα CIDOC (κωδικός, χρονολογία, κατηγορία, υλικό, διαστάσεις, κατάσταση, συλλογή, απόκτηση κ.λπ.)
- [x] Storage proxy (/diplamus-storage/*) για GLB, εικόνες, βίντεο χωρίς CORS
- [x] proxyStorageUrl() helper για αυτόματη μετατροπή URLs σε proxied

## Νέες Διορθώσεις (2026-04-15 v2)
- [x] Διόρθωση φόρτωσης εικόνων/3D online (CORS proxy δεν λειτουργεί σε production)
- [x] Διόρθωση φιλτραρίσματος συλλογών στη σελίδα Εξερεύνηση
- [x] Αφαίρεση "Περιηγήσεις" από navigation
- [x] Αντικατάσταση logo με το επίσημο DiPlaMus logo
- [x] Προσθήκη footer με εικονίδια δημοσιότητας ΕΣΠΑ/ΕΕ

## Υπολειπόμενες Διορθώσεις (2026-04-16)
- [x] Πλήρης αφαίρεση Περιηγήσεων: App.tsx route, Tours.tsx page, translation keys
- [x] Επαλήθευση logo στον browser (hard refresh)

## Κρίσιμες Διορθώσεις (2026-04-16 #2)
- [x] Μαύρες εικόνες στο published site — CORS ενεργοποιήθηκε από τον developer, αφαιρέθηκε ο proxy, χρησιμοποιούνται direct URLs
- [x] Φίλτρα Εξερεύνησης — server-side filtering με period_id, material_id, place_id, usage_id (υποστηρίζεται πλέον από το API)
- [x] Αφαίρεση "Αίθουσα" από τα φίλτρα — δεν υπάρχει πλέον στο sidebar
- [x] Εμφάνιση συλλογής (period) στις κάρτες εκθεμάτων στη λίστα

## Διορθώσεις (2026-04-16 #3)
- [x] Διόρθωση crash "lt.map is not a function" — null-safe getTranslation/getTaxonomyName σε api.ts
- [x] Αντικατάσταση φίλτρου "Τοποθεσία" με "Κατηγορία" (placeholder "Σύντομα διαθέσιμο" — endpoint δεν υπάρχει ακόμα)
- [x] Αντικατάσταση φίλτρου "Χρήση" με "Είδος αντικειμένου" (placeholder "Σύντομα διαθέσιμο" — endpoint δεν υπάρχει ακόμα)
- [x] Αφαίρεση "Αίθουσες" από Header και Footer navigation

## Διορθώσεις (2026-04-19)
- [x] Fix Explore: φίλτρο Συλλογής — διόρθωση URL param ?period=X σε period_id
- [x] Fix Explore: φίλτρο Υλικού — backend bug (material_id=1 επιστρέφει 1 αντί 62+), αναφέρεται στον developer
- [x] Fix Home stats: δυναμικός αριθμός εκθεμάτων (163 από API)
- [x] Fix Home stats: αντικατάσταση Τοποθεσίες με Κατηγορίες=13

## Εκκρεμότητες (αναμένεται developer)
- [ ] Backend: διόρθωση material_id filtering (επιστρέφει 1 αντικείμενο αντί για όλα με αυτό το υλικό)
- [ ] Backend: νέα endpoints για Κατηγορία και Είδος αντικειμένου
- [ ] Μετά τα endpoints: ενεργοποίηση φίλτρων Κατηγορία/Είδος αντικειμένου στο Explore
