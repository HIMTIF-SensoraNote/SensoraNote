import { useTranslation } from '../hooks/useTranslation';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MobileLayout } from '../components/MobileLayout';
import { ArrowRight } from 'lucide-react';

const onboardingSlides = [
  {
    title: 'Bagikan Catatanmu',
    description: 'Berbagi catatan belajar dengan teman-teman se-Indonesia dan bantu mereka belajar lebih baik',
    image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=600&fit=crop'
  },
  {
    title: 'Belajar Dari Yang Terbaik',
    description: 'Akses ribuan catatan terverifikasi dari pelajar dan pakar terpercaya',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop'
  },
  {
    title: 'Mulai Sekarang',
    description: 'Bergabung dengan komunitas pelajar Indonesia dan raih prestasi terbaikmu',
    image: 'https://images.unsplash.com/photo-1758270705317-3ef6142d306f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwc3R1ZGVudHMlMjBjb21tdW5pdHklMjBjb2xsYWJvcmF0aW9ufGVufDF8fHx8MTc3Mjk4NzQ1N3ww&ixlib=rb-4.1.0&q=80&w=1080'
  }
];

export default function Onboarding() {
    const { t } = useTranslation();
    useDocumentTitle(t('titles.onboarding'));
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/login');
    }
  };

  const handleSkip = () => {
    navigate('/login');
  };

  return (
    <MobileLayout showBottomNav={false}>
      <div className="h-screen flex flex-col bg-white">
        {/* Skip button */}
        {currentSlide < onboardingSlides.length - 1 && (
          <button
            onClick={handleSkip}
            className="absolute top-8 right-6 text-muted-foreground font-['Manrope'] font-medium text-sm z-10"
          >
            Lewati
          </button>
        )}

        {/* Image */}
        <div className="relative h-[55%] overflow-hidden">
          <img
            src={onboardingSlides[currentSlide].image}
            alt={onboardingSlides[currentSlide].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 pt-8 pb-12 flex flex-col">
          <div className="flex-1">
            <h1 className="font-['Lexend_Deca'] text-3xl font-bold text-foreground mb-4">
              {onboardingSlides[currentSlide].title}
            </h1>
            <p className="font-['Manrope'] text-base text-muted-foreground leading-relaxed">
              {onboardingSlides[currentSlide].description}
            </p>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {onboardingSlides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Button */}
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-full font-['Lexend_Deca'] font-semibold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:shadow-xl transition-all"
          >
            {currentSlide < onboardingSlides.length - 1 ? 'Lanjut' : 'Mulai Sekarang'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}