
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

## Διορθώσεις (2026-04-21 #2)
- [x] Fix Home 502 error: graceful fallback \u03cc\u03c4\u03b1\u03bd \u03c4\u03bf API \u03b5\u03c0\u03b9\u03c3\u03c4\u03c1\u03ad\u03c6\u03b5\u03b9 502 (\u03b5\u03bc\u03c6\u03ac\u03bd\u03b9\u03c3\u03b7 fallback \u03c4\u03b9\u03bc\u03ce\u03bd \u03b1\u03bd\u03c4\u03af \u03b3\u03b9\u03b1 crash)

## Διορθώσεις (2026-04-22)
- [x] Fix: single material filter να χρησιμοποιεί πάντα ?materials=X (όχι material_id) — διορθώθηκε
- [x] Test: αναζήτηση κειμένου - ?content= δεν φιλτράρει ακόμα (backend αναμένει υλοποίηση)
- [x] Fix: αναζήτηση — backend δεν υποστηρίζει ?content= ακόμα, γραμμή αναζήτησης απενεργοποιήθηκε

## Διορθώσεις (2026-04-23)
- [x] Fix: Είδος αντικειμένου (subcategory) filter — διορθώθηκε: χρήση sub_category_id αντί category_id για subcategories (Explore.tsx)
- [x] Fix: εμφάνιση όλων των υλικών ανά αντικείμενο στις κάρτες Εξερεύνησης (ExhibitCard.tsx — loop through materials[])
- [x] Fix: εμφάνιση όλων των υλικών στα μεταδεδομένα σελίδας εκθέματος (ExhibitDetail.tsx — badges για κάθε υλικό)
- [x] Έλεγχος: υπάρχουν περισσότερες κατηγορίες πέρα από τις 3; — Επιβεβαιώθηκε: 13 top-level κατηγορίες με limit=1000 (API αγνοούσε pageSize, τώρα χρησιμοποιεί limit=)
- [x] Developer instructions: αναζήτηση κειμένου (?content= endpoint) — ενεργοποιήθηκε η search bar, content= λειτουργεί σωστά

## Νέα Φίλτρα (2026-04-28)
- [ ] Προσθήκη φίλτρου "Χρήση" (usage_id) στο sidebar της σελίδας Εξερεύνησης

## Home Page Διορθώσεις (2026-04-28)
- [x] Αφαίρεση 3D documentation section από την αρχική σελίδα
- [x] Ενεργοποίηση section υλικών με όλα τα 21 υλικά από το API (φόρτωση 3 σελίδων με fetchAllPages)
- [x] Ελεγχος στατιστικών: exhibits=163, periods=3, materials=21, categories=13 — όλα σωστά
- [x] Σύνδεση ματεριαλ links από Home στο Explore με προεπιλεγμένο φίλτρο υλικού (?material=X)
