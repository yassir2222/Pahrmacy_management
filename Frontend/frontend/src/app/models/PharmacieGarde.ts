export interface PharmacieGarde {
    id?: number;
    nomPharmacie?: string;
    ville?: string;
    adresse?: string;
    telephone?: string;
    periode?: 'MATIN' | 'NUIT' | 'JOURNÉE';
    dateDebut?: Date | string;
    dateFin?: Date | string;
    isActive?: boolean;
}

export interface VilleMaroc {
    nom: string;
    region: string;
}

// Liste des principales villes du Maroc
export const villesMaroc: VilleMaroc[] = [
    { nom: 'Casablanca', region: 'Casablanca-Settat' },
    { nom: 'Rabat', region: 'Rabat-Salé-Kénitra' },
    { nom: 'Marrakech', region: 'Marrakech-Safi' },
    { nom: 'Fès', region: 'Fès-Meknès' },
    { nom: 'Tanger', region: 'Tanger-Tétouan-Al Hoceima' },
    { nom: 'Meknès', region: 'Fès-Meknès' },
    { nom: 'Oujda', region: 'Oriental' },
    { nom: 'Kénitra', region: 'Rabat-Salé-Kénitra' },
    { nom: 'Agadir', region: 'Souss-Massa' },
    { nom: 'Tétouan', region: 'Tanger-Tétouan-Al Hoceima' },
    { nom: 'Safi', region: 'Marrakech-Safi' },
    { nom: 'Mohammedia', region: 'Casablanca-Settat' },
    { nom: 'El Jadida', region: 'Casablanca-Settat' },
    { nom: 'Khouribga', region: 'Béni Mellal-Khénifra' },
    { nom: 'Béni Mellal', region: 'Béni Mellal-Khénifra' },
    { nom: 'Nador', region: 'Oriental' },
    { nom: 'Taza', region: 'Fès-Meknès' },
    { nom: 'Khémisset', region: 'Rabat-Salé-Kénitra' },
    { nom: 'Larache', region: 'Tanger-Tétouan-Al Hoceima' },
    { nom: 'Ksar El Kébir', region: 'Tanger-Tétouan-Al Hoceima' }
];