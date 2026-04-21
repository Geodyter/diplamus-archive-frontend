
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
- [x] Backend: διόρθωση material_id filtering — λύθηκε με ?materials=1,2 (multi-value endpoint)
- [x] Backend: νέα endpoints για Κατηγορία και Είδος αντικειμένου — /navigation_point_categories

## Νέα API endpoints (2026-04-21)
- [x] api.ts: προσθήκη getCategories() με endpoint /navigation_point_categories
- [x] api.ts: ενημέρωση getNavigationPoints() με ?materials=1,2 (multi-value)
- [x] Explore: φίλτρο Υλικού με checkboxes (multi-select, ?materials=1,2)
- [x] Explore: φίλτρο Κατηγορίας (radio, από /navigation_point_categories top-level)
- [x] Explore: φίλτρο Είδους αντικειμένου (radio, υποκατηγορίες, εμφανίζεται αυτόματα όταν επιλεγεί κατηγορία)
