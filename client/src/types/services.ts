export interface ServiceItem {
  title: string;
  image: string;
  shortDescription: string;
  description: string;
  duration: string;
}

export type ServicesData = Record<string, ServiceItem[]>;
