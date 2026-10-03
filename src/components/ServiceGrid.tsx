import { useCallback, useState } from 'react';
import type { Service } from '../types';
import { ServiceCard } from './ServiceCard';
import { ServiceDialog } from './ServiceDialog';

export function ServiceGrid({ services }: { services: Service[] }) {
  const [selected, setSelected] = useState<Service | null>(null);
  const close = useCallback(() => setSelected(null), []);
  return <><div className="service-grid">{services.map((service) => <ServiceCard key={service.domain} service={service} onDetails={setSelected} />)}</div>{selected && <ServiceDialog service={selected} onClose={close} />}</>;
}
