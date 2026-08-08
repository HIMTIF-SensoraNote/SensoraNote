import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
  iconBg?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient = 'from-secondary to-white',
  iconBg = 'bg-primary',
}: FeatureCardProps) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-3xl p-8 border border-border hover:shadow-xl transition-all hover:-translate-y-1`}
    >
      <div className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center mb-6`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
