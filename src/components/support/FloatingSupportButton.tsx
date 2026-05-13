import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

import { SupportDialog } from '@/components/support/SupportDialog';

const hiddenPathPrefixes = ['/admin'];

const shouldHideSupportWidget = (pathname: string) => {
  const lowerPath = pathname.toLowerCase();

  if (
    hiddenPathPrefixes.some((prefix) =>
      lowerPath.startsWith(prefix)
    )
  ) {
    return true;
  }

  return /(\/checkout|\/payment|payment-processing)/.test(
    lowerPath
  );
};

export const FloatingSupportButton = () => {
  const location = useLocation();

  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] =
    useState(false);

  const isHidden = useMemo(
    () => shouldHideSupportWidget(location.pathname),
    [location.pathname]
  );

  if (isHidden) {
    return null;
  }

  const handleLearnMore = () => {
    setIsDialogOpen(false);

    navigate('/support-harman');
  };

  return (
    <>
      <SupportDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onLearnMore={handleLearnMore}
      />

      <button
  type="button"
  onClick={() => setIsDialogOpen(true)}
  aria-label="Open Support Harman dialog"
  className="
    fixed bottom-4 right-4 md:bottom-5 md:right-5
    z-[35]
    inline-flex items-center gap-2
    overflow-hidden
    rounded-full
    border border-[#c79b48]/40
    bg-[linear-gradient(135deg,#3b1408_0%,#5a1f0c_18%,#7a3415_40%,#9b5a21_68%,#d2a35f_100%)]
    px-4 py-2.5
    text-[13px]
    font-semibold
    text-[#f6e7c8]
    shadow-[0_10px_28px_rgba(60,20,8,0.45)]
    backdrop-blur-md
    transition-all duration-300
    hover:-translate-y-0.5
    hover:shadow-[0_16px_36px_rgba(60,20,8,0.58)]
    hover:border-[#d6b06b]/50
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-[#c79b48]
    focus-visible:ring-offset-2
    before:absolute
    before:inset-[1px]
    before:rounded-full
    before:bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]
    before:content-['']
  "
>
  {/* subtle glow */}
  <span
    className="
      absolute inset-0 opacity-20
      bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_45%)]
    "
  />

  {/* Icon */}
  <span
    className="
      relative
      inline-flex h-6 w-6
      items-center justify-center
      rounded-full
      bg-[#f3d08f]/12
      ring-1 ring-[#f3d08f]/20
    "
  >
    <Heart
      size={13}
      className="fill-current text-[#f3d08f]"
    />
  </span>

  {/* Text */}
  <span
    className="
      relative
      font-semibold
      tracking-[0.01em]
    "
  >
    Support Harman
  </span>
</button>
    </>
  );
};