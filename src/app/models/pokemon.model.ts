export interface Encounter {
  location_area: { name: string };
  version_details: {
    version: { name: string };
    max_chance: number;
  }[];
}

export interface Pokemon {
  name: string;
  url: string;
}


export interface NavItem {
  label: string;
  route?: string;
  exact?: boolean;
}