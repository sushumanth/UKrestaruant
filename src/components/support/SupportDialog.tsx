import { HeartHandshake, Info, X, Landmark } from 'lucide-react';

type SupportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onLearnMore: () => void;
};

export const SupportDialog = ({
  isOpen,
  onClose,
  onLearnMore,
}: SupportDialogProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-3 sm:right-4 z-[70] w-[min(22rem,calc(100vw-1.5rem))]">
      
      <div className="relative overflow-hidden rounded-2xl border border-[#d7b06a]/30 bg-[linear-gradient(180deg,rgba(30,16,10,0.96),rgba(58,31,18,0.96))] p-5 shadow-[0_22px_46px_rgba(0,0,0,0.42)] backdrop-blur-xl">

        {/* top glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,214,120,0.14),transparent_42%)]" />

        {/* close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-[#f3d08f]/75 transition hover:bg-white/10 hover:text-[#f7ddb0]"
          aria-label="Close support dialog"
        >
          <X size={15} />
        </button>

        {/* badge */}
        <div className="relative mb-3 inline-flex items-center gap-2 rounded-full border border-[#d7b06a]/30 bg-[#f3d08f]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#f3d08f]">
          <HeartHandshake size={13} />
          Community Initiative
        </div>

        {/* heading */}
        <h3 className="relative text-[18px] font-semibold leading-tight text-[#fff2d4]">
          Support Harman Community Initiative
        </h3>

        {/* text */}
        <p className="relative mt-3 text-[13px] leading-6 text-[#f7e6c1]/85">
          All contributions are completely voluntary and help support ongoing
          community and legal assistance initiatives.
        </p>

        {/* bank section */}
        <div className="relative mt-4 rounded-xl border border-[#d7b06a]/20 bg-black/15 p-3">
          
          <div className="mb-2 flex items-center gap-2 text-[#f3d08f]">
            <Landmark size={15} />
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em]">
              UK Bank Transfer
            </span>
          </div>

          <div className="space-y-1.5 text-[12px] text-[#f8ecd2]/90">
            <p>
              <span className="font-semibold text-[#f3d08f]">
                Bank:
              </span>{' '}
              Barclays UK
            </p>

            <p>
              <span className="font-semibold text-[#f3d08f]">
                Account Name:
              </span>{' '}
              Harman Community Support
            </p>

            <p>
              <span className="font-semibold text-[#f3d08f]">
                Sort Code:
              </span>{' '}
              20-45-18
            </p>

            <p>
              <span className="font-semibold text-[#f3d08f]">
                Account No:
              </span>{' '}
              30458291
            </p>
          </div>
        </div>

        {/* disclaimer */}
        <p className="relative mt-3 text-[11px] leading-5 text-[#f3d08f]/70">
          All contributions are voluntary community support contributions.
        </p>

        {/* action */}
        <div className="relative mt-5">
          <button
            type="button"
            onClick={onLearnMore}
            className="
              inline-flex w-full items-center justify-center gap-2
              rounded-full
              border border-[#d7b06a]/30
              bg-[linear-gradient(135deg,#8b4a16,#c4882d,#e1b766)]
              px-4 py-2.5
              text-[13px]
              font-semibold
              text-[#2f1807]
              shadow-[0_10px_24px_rgba(0,0,0,0.28)]
              transition-all duration-300
              hover:-translate-y-[1px]
              hover:shadow-[0_14px_32px_rgba(0,0,0,0.36)]
            "
          >
            <Info size={14} />
            Learn More & Contribute
          </button>
        </div>
      </div>
    </div>
  );
};