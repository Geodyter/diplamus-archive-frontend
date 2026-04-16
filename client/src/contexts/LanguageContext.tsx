/**
 * DiPlaMus Archive — Language Context (Greek / English)
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

export type Lang = 'el' | 'en';

interface Translations {
  [key: string]: string;
}

const el: Translations = {
  // Navigation
  'nav.home': 'Αρχική',
  'nav.explore': 'Εξερεύνηση',
  'nav.collections': 'Συλλογές',
  'nav.halls': 'Αίθουσες',
  'nav.about': 'Σχετικά',

  // Home
  'home.hero.title': 'Ψηφιακό Αρχείο',
  'home.hero.subtitle': 'Τεκμηρίωση Μουσειακών Εκθεμάτων',
  'home.hero.description': 'Εξερευνήστε τη συλλογή μας από εκθέματα, φωτογραφίες, βίντεο και τρισδιάστατα αντικείμενα με βάση το πρότυπο CIDOC-CRM.',
  'home.hero.cta': 'Εξερεύνηση Συλλογής',
  'home.stats.exhibits': 'Εκθέματα',
  'home.stats.collections': 'Συλλογές',
  'home.stats.places': 'Τοποθεσίες',
  'home.stats.materials': 'Υλικά',
  'home.featured.title': 'Προτεινόμενα Εκθέματα',
  'home.featured.subtitle': 'Ανακαλύψτε τα πιο σημαντικά αντικείμενα της συλλογής',
  'home.collections.title': 'Συλλογές',
  'home.collections.subtitle': 'Περιηγηθείτε ανά θεματική συλλογή',
  'home.materials.title': 'Κατά Υλικό',
  'home.materials.subtitle': 'Αναζητήστε εκθέματα βάσει υλικού κατασκευής',
  'home.3d.title': 'Τρισδιάστατη Τεκμηρίωση',
  'home.3d.description': 'Εξερευνήστε εκθέματα σε τρισδιάστατη απεικόνιση υψηλής ανάλυσης',
  'home.3d.cta': 'Δείτε 3D Εκθέματα',

  // Explore
  'explore.title': 'Εξερεύνηση Συλλογής',
  'explore.subtitle': 'Αναζητήστε και φιλτράρετε τα εκθέματα',
  'explore.search.placeholder': 'Αναζήτηση εκθεμάτων...',
  'explore.search.button': 'Αναζήτηση',
  'explore.filters.title': 'Φίλτρα',
  'explore.filters.collection': 'Συλλογή',
  'explore.filters.material': 'Υλικό',
  'explore.filters.place': 'Τοποθεσία',
  'explore.filters.usage': 'Χρήση',
  'explore.filters.clear': 'Καθαρισμός',
  'explore.sort.title': 'Ταξινόμηση',
  'explore.sort.title_asc': 'Τίτλος (Α-Ω)',
  'explore.sort.title_desc': 'Τίτλος (Ω-Α)',
  'explore.sort.date_desc': 'Νεότερα πρώτα',
  'explore.sort.date_asc': 'Παλαιότερα πρώτα',
  'explore.view.grid': 'Πλέγμα',
  'explore.view.list': 'Λίστα',
  'explore.results': 'αποτελέσματα',
  'explore.no_results': 'Δεν βρέθηκαν εκθέματα',
  'explore.no_results.desc': 'Δοκιμάστε διαφορετικά κριτήρια αναζήτησης',
  'explore.loading': 'Φόρτωση εκθεμάτων...',

  // Exhibit Detail
  'exhibit.back': 'Πίσω στη Συλλογή',
  'exhibit.metadata': 'Μεταδεδομένα',
  'exhibit.cidoc': 'CIDOC-CRM',
  'exhibit.media': 'Πολυμέσα',
  'exhibit.photos': 'Φωτογραφίες',
  'exhibit.videos': 'Βίντεο',
  'exhibit.model3d': 'Τρισδιάστατο Μοντέλο',
  'exhibit.material': 'Υλικό',
  'exhibit.period': 'Περίοδος / Συλλογή',
  'exhibit.place': 'Τοποθεσία',
  'exhibit.usage': 'Χρήση',
  'exhibit.hall': 'Αίθουσα',
  'exhibit.tour': 'Περιήγηση',
  'exhibit.related': 'Σχετικά Εκθέματα',
  'exhibit.view3d': 'Προβολή 3D',
  'exhibit.download': 'Λήψη',

  // Halls
  'halls.title': 'Αίθουσες Μουσείου',
  'halls.subtitle': 'Εξερευνήστε τις αίθουσες και τα εκθέματά τους',
  'halls.empty': 'Δεν υπάρχουν διαθέσιμες αίθουσες ακόμα',
  'halls.exhibits': 'Εκθέματα',
  'halls.view': 'Προβολή Αίθουσας',

  // Common
  'common.loading': 'Φόρτωση...',
  'common.error': 'Σφάλμα φόρτωσης',
  'common.retry': 'Επανάληψη',
  'common.view_all': 'Δείτε όλα',
  'common.close': 'Κλείσιμο',
  'common.next': 'Επόμενο',
  'common.prev': 'Προηγούμενο',
  'common.page': 'Σελίδα',
  'common.of': 'από',
  'common.items': 'αντικείμενα',
  'common.no_image': 'Χωρίς εικόνα',

  // Footer
  'footer.rights': 'Με επιφύλαξη παντός δικαιώματος',
  'footer.powered': 'Powered by DiPlaMus',
  'footer.contact': 'Επικοινωνία',
  'footer.privacy': 'Πολιτική Απορρήτου',
};

const en: Translations = {
  // Navigation
  'nav.home': 'Home',
  'nav.explore': 'Explore',
  'nav.collections': 'Collections',
  'nav.halls': 'Halls',
  'nav.about': 'About',

  // Home
  'home.hero.title': 'Digital Archive',
  'home.hero.subtitle': 'Museum Exhibit Documentation',
  'home.hero.description': 'Explore our collection of exhibits, photographs, videos and 3D objects based on the CIDOC-CRM standard.',
  'home.hero.cta': 'Explore Collection',
  'home.stats.exhibits': 'Exhibits',
  'home.stats.collections': 'Collections',
  'home.stats.places': 'Places',
  'home.stats.materials': 'Materials',
  'home.featured.title': 'Featured Exhibits',
  'home.featured.subtitle': 'Discover the most significant objects in the collection',
  'home.collections.title': 'Collections',
  'home.collections.subtitle': 'Browse by thematic collection',
  'home.materials.title': 'By Material',
  'home.materials.subtitle': 'Search exhibits by construction material',
  'home.3d.title': '3D Documentation',
  'home.3d.description': 'Explore exhibits in high-resolution three-dimensional representation',
  'home.3d.cta': 'View 3D Exhibits',

  // Explore
  'explore.title': 'Explore Collection',
  'explore.subtitle': 'Search and filter exhibits',
  'explore.search.placeholder': 'Search exhibits...',
  'explore.search.button': 'Search',
  'explore.filters.title': 'Filters',
  'explore.filters.collection': 'Collection',
  'explore.filters.material': 'Material',
  'explore.filters.place': 'Place',
  'explore.filters.usage': 'Usage',
  'explore.filters.clear': 'Clear All',
  'explore.sort.title': 'Sort By',
  'explore.sort.title_asc': 'Title (A-Z)',
  'explore.sort.title_desc': 'Title (Z-A)',
  'explore.sort.date_desc': 'Newest First',
  'explore.sort.date_asc': 'Oldest First',
  'explore.view.grid': 'Grid',
  'explore.view.list': 'List',
  'explore.results': 'results',
  'explore.no_results': 'No exhibits found',
  'explore.no_results.desc': 'Try different search criteria',
  'explore.loading': 'Loading exhibits...',

  // Exhibit Detail
  'exhibit.back': 'Back to Collection',
  'exhibit.metadata': 'Metadata',
  'exhibit.cidoc': 'CIDOC-CRM',
  'exhibit.media': 'Media',
  'exhibit.photos': 'Photos',
  'exhibit.videos': 'Videos',
  'exhibit.model3d': '3D Model',
  'exhibit.material': 'Material',
  'exhibit.period': 'Period / Collection',
  'exhibit.place': 'Place',
  'exhibit.usage': 'Usage',
  'exhibit.hall': 'Hall',
  'exhibit.tour': 'Tour',
  'exhibit.related': 'Related Exhibits',
  'exhibit.view3d': 'View 3D',
  'exhibit.download': 'Download',

  // Halls
  'halls.title': 'Museum Halls',
  'halls.subtitle': 'Explore the halls and their exhibits',
  'halls.empty': 'No halls available yet',
  'halls.exhibits': 'Exhibits',
  'halls.view': 'View Hall',

  // Common
  'common.loading': 'Loading...',
  'common.error': 'Loading error',
  'common.retry': 'Retry',
  'common.view_all': 'View all',
  'common.close': 'Close',
  'common.next': 'Next',
  'common.prev': 'Previous',
  'common.page': 'Page',
  'common.of': 'of',
  'common.items': 'items',
  'common.no_image': 'No image',

  // Footer
  'footer.rights': 'All rights reserved',
  'footer.powered': 'Powered by DiPlaMus',
  'footer.contact': 'Contact',
  'footer.privacy': 'Privacy Policy',
};

const translations: Record<Lang, Translations> = { el, en };

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'el',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('diplamus-lang');
    return (stored === 'en' || stored === 'el') ? stored : 'el';
  });

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('diplamus-lang', newLang);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[lang][key] || translations['el'][key] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
