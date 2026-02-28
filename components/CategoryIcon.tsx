import { UtensilsCrossed, Car, Film, ShoppingBag, Zap, Package, LucideProps } from 'lucide-react';

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Food: UtensilsCrossed,
  Transportation: Car,
  Entertainment: Film,
  Shopping: ShoppingBag,
  Bills: Zap,
  Other: Package,
};

interface Props extends LucideProps {
  category: string;
}

export default function CategoryIcon({ category, ...props }: Props) {
  const Icon = ICONS[category] ?? Package;
  return <Icon {...props} />;
}
