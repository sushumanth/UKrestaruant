import {
  HeartHandshake,
  Landmark,
  ShieldCheck,
  Scale,
  Users,
  HandHeart,
  BadgeCheck,
  Play,
  Check,
  ArrowRight,
} from 'lucide-react';

const supportAreas = [
  {
    icon: Scale,
    title: 'Legal Assistance',
    description:
      'Support directed toward legal representation, case documentation, and ongoing legal coordination.',
  },
  {
    icon: Users,
    title: 'Community Welfare',
    description:
      'Helping maintain practical and community-centered support resources.',
  },
  {
    icon: HandHeart,
    title: 'Outreach & Advocacy',
    description:
      'Supporting communication, awareness, and community outreach initiatives.',
  },
];

const impactStats = [
  {
    number: '300+',
    label: 'Community Outreach',
  },
  {
    number: '120+',
    label: 'Legal Assistance',
  },
  {
    number: '250+',
    label: 'Families Supported',
  },
  {
    number: '100%',
    label: 'Transparency Focused',
  },
];

const galleryImages = [
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500&h=500&fit=crop',
];

export const SupportHarmanPage = () => {
  return (
    <div className="bg-[#f7f2ea] pt-[110px] text-[#412313] lg:pt-[70px]">

      {/* HERO */}
      <section className="px-4 pt-10 pb-8 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-6xl">

          <div className="rounded-[26px] border border-[#e7d6ba] bg-[#fcfaf6] px-5 py-5 shadow-[0_14px_40px_rgba(86,52,21,0.05)] lg:px-8 lg:py-7">

            <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.9fr]">

              {/* LEFT */}
              <div>

                <div className="inline-flex items-center gap-2 rounded-full border border-[#ddb978]/50 bg-[#fffaf0] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#b87724]">
                  <HeartHandshake size={12} />
                  Community Support Initiative
                </div>

                <h1 className="mt-5 max-w-xl text-[42px] font-semibold leading-[1] tracking-[-0.03em] text-[#3a1f11] lg:text-[50px]">
                  Support Harman
                </h1>

                <p className="mt-5 max-w-lg text-[15px] leading-[1.9] text-[#9a6d47]">
                  A respectful and transparent community support initiative
                  dedicated to ongoing legal and community assistance efforts.
                </p>

               

                <p className="mt-5 max-w-lg text-[15px] leading-[1.9] text-[#5f3c27]/85">
                  This section exists independently from restaurant reservations,
                  food orders, and table deposit payments.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">

                  <div className="inline-flex items-center gap-2 rounded-xl border border-[#e2c695] bg-[#fffaf3] px-4 py-2 text-[13px] font-medium text-[#9b672f]">
                    <ShieldCheck size={14} />
                    Voluntary Contributions
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-xl border border-[#e2c695] bg-[#fffaf3] px-4 py-2 text-[13px] font-medium text-[#9b672f]">
                    <Users size={14} />
                    Transparent & Community Driven
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div>

                <div className="relative overflow-hidden rounded-[24px] border border-[#e1c89d] shadow-[0_18px_40px_rgba(80,45,16,0.1)]">

                  <div className="aspect-[1.08/0.72]">

                    <img
                      src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=900&fit=crop"
                      alt="Community support"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

                  {/* VIDEO CARD */}
                  <div className="absolute bottom-4 left-4 rounded-[18px] border border-white/10 bg-[#4d2818]/80 px-4 py-3 backdrop-blur-xl">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7ab6c] bg-[#5b311d] text-[#efc57d]">
                        <Play size={16} className="ml-0.5 fill-current" />
                      </div>

                      <div>
                        <h3 className="text-[18px] font-medium leading-none text-[#fff5df]">
                          Watch Our Story
                        </h3>

                        <p className="mt-1 text-[12px] leading-[1.5] text-[#ead8be]/90">
                          Care, respect & support
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECOND BLOCK */}
            <div className="mt-10 grid items-center gap-8 lg:grid-cols-[0.72fr_1fr]">

              {/* LEFT SIDE */}
              <div className="relative mx-auto w-full max-w-[430px]">

                {/* decorative dots */}
                <div className="absolute -left-4 top-8 grid grid-cols-4 gap-1.5 opacity-35">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[3px] w-[3px] rounded-full bg-[#d5a15d]"
                    />
                  ))}
                </div>

                {/* MAIN IMAGE */}
                <div className="relative overflow-hidden rounded-[24px] border border-[#ead8ba] bg-white shadow-[0_12px_30px_rgba(60,31,12,0.08)]">

                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=700&h=900&fit=crop"
                    alt="Community support"
                    className="h-[320px] w-full object-cover"
                  />
                </div>

                {/* FLOATING IMAGE */}
                <div className="absolute -bottom-5 left-[-10px] overflow-hidden rounded-[18px] border-[4px] border-[#fcfaf6] bg-white shadow-[0_10px_24px_rgba(50,25,10,0.12)]">

                  <img
                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=500&fit=crop"
                    alt="Community gathering"
                    className="h-[110px] w-[150px] object-cover"
                  />
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="max-w-[760px]">

                {/* SECTION LABEL */}
                <div className="flex items-center gap-3">

                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c0822f]">
                    Why This Initiative Exists
                  </p>

                  <div className="h-[1px] w-12 bg-[#d9b47f]" />
                </div>

                {/* HEADING */}
                <h2 className="mt-4 max-w-[620px] text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-[#3b1f12] lg:text-[46px]">
                  Built Through Community Goodwill
                </h2>

                {/* DESCRIPTION */}
                <div className="mt-5 max-w-[700px] space-y-4">

                  <p className="text-[15px] leading-[1.9] text-[#5f3d29]/82">
                    This initiative was created to help provide structured
                    community and legal assistance during a difficult period.
                  </p>

                  <p className="text-[15px] leading-[1.9] text-[#5f3d29]/82">
                    Support from the wider community helps maintain practical
                    resources, coordination efforts, and ongoing assistance in a
                    transparent and respectful way.
                  </p>
                </div>

                {/* HIGHLIGHT BOX */}
                <div className="mt-6 max-w-[700px] rounded-[20px] border border-[#eed6ac] bg-[#fbf2df] px-5 py-5 shadow-[0_8px_24px_rgba(120,82,26,0.06)]">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e0af53] text-white shadow-sm">
                      <HeartHandshake size={18} />
                    </div>

                    <div>

                      <p className="text-[18px] font-medium leading-[1.5] text-[#6d4223]">
                        There is absolutely no pressure to contribute.
                      </p>

                      <p className="mt-1 text-[14px] leading-[1.8] text-[#8c6544]">
                        Dining, visiting the restaurant, and reservations remain
                        fully independent from this initiative.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT AREAS */}
<section className="px-4 py-10 sm:px-6 lg:px-8">

  <div className="mx-auto max-w-6xl">

    {/* TITLE */}
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#c48735]">
        <BadgeCheck size={13} />
        Community Support Areas
      </div>

      <div className="h-[1px] w-24 bg-[#d7b27c]" />
    </div>

    {/* CARDS */}
    <div className="mt-7 grid gap-4 lg:grid-cols-3">

      {supportAreas.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-[20px] border border-[#e8d4b5] bg-[#fbf8f2] px-5 py-5 shadow-[0_10px_24px_rgba(70,40,16,0.04)]"
          >

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4d1f0f] text-[#efc46e]">
              <Icon size={20} />
            </div>

            <h3 className="mt-5 text-[24px] font-medium leading-none text-[#3b1f12]">
              {item.title}
            </h3>

            <p className="mt-3 text-[14px] leading-[1.8] text-[#6d4b35]/80">
              {item.description}
            </p>

            <div className="mt-5 h-[2px] w-10 bg-[#d5a25f]" />
          </div>
        );
      })}
    </div>
  </div>
</section>

{/* IMPACT SECTION */}
<section className="px-4 pb-10 sm:px-6 lg:px-8">

  <div className="mx-auto max-w-6xl">

    <div className="overflow-hidden rounded-[24px] bg-gradient-to-r from-[#2a0f07] via-[#4a1f0d] to-[#2d1108] px-6 py-6 shadow-[0_18px_40px_rgba(40,15,5,0.18)]">

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">

        {/* LEFT SIDE */}
        <div>

          <div className="flex items-center gap-2">

            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#e2b267]">
              <BadgeCheck size={11} />
              Our Impact So Far
            </div>

            <div className="h-[1px] w-10 bg-[#d2a056]" />
          </div>

          {/* STATS */}
          <div className="mt-5 grid grid-cols-4 gap-5">

            {impactStats.map((item) => (
              <div key={item.label}>

                <div className="text-[30px] font-semibold leading-none text-[#f2c373]">
                  {item.number}
                </div>

                <p className="mt-2 text-[11px] leading-[1.5] text-[#ead5bf]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div>

          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#f0c57a]">
            <ShieldCheck size={12} />
            Transparency & Trust
          </div>

          <div className="mt-5 space-y-3">

            {[
              'Separate from restaurant business operations',
              'Voluntary support contributions only',
              'Transparent community-driven initiative',
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2.5"
              >

                <div className="mt-[2px] flex h-4 w-4 items-center justify-center rounded-full border border-[#d6aa64] text-[#f0c57a]">
                  <Check size={9} />
                </div>

                <p className="text-[12px] leading-[1.6] text-[#edd9c3]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  </div>
</section>

      {/* GALLERY */}
      <section className="px-4 py-10 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-6xl">

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#c48735]">
              <BadgeCheck size={13} />
              Our Community In Action
            </div>

            <div className="h-[1px] w-20 bg-[#d7b27c]" />
          </div>

          <div className="mt-7 grid gap-3 lg:grid-cols-5">

            {galleryImages.map((image, index) => (
              <div
                key={image}
                className="group relative overflow-hidden rounded-[16px]"
              >

                <img
                  src={image}
                  alt="Community"
                  className="aspect-square h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-black/10 transition-all duration-500 group-hover:bg-black/35" />

                {index === 3 && (
                  <div className="absolute inset-0 flex items-center justify-center">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3e1e12]/90 text-[#f2c678] backdrop-blur-md">
                      <Play size={18} className="ml-0.5 fill-current" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          
        </div>
      </section>

      {/* BANK DETAILS */}
<section className="px-4 py-10 sm:px-6 lg:px-8">

  <div className="mx-auto max-w-6xl">

    {/* SECTION TITLE */}
    <div className="flex items-center gap-3">

      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#c48735]">
        <Landmark size={13} />
        Contribution Information
      </div>

      <div className="h-[1px] w-24 bg-[#d7b27c]" />
    </div>

    {/* MAIN GRID */}
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_0.55fr]">

      {/* BANK CARD */}
      <div className="rounded-[22px] border border-[#ecdcbf] bg-[#fcfaf6] px-6 py-5 shadow-[0_10px_24px_rgba(70,40,15,0.04)]">

        {/* HEADING */}
        <div className="flex items-center gap-3">

          <div className="text-[#8b5d2d]">
            <Landmark size={24} />
          </div>

          <h3 className="text-[20px] font-semibold text-[#4a2815]">
            UK Bank Details
          </h3>
        </div>

        {/* DETAILS */}
        <div className="mt-5 overflow-hidden rounded-[16px] border border-[#ead8b8] bg-[#fffdfa]">

          <div className="grid grid-cols-2 md:grid-cols-4">

            {[
              ['Account Name', 'Harman Community Support'],
              ['Sort Code', '12-34-56'],
              ['Account Number', '12345678'],
              ['Reference', 'HARMAN SUPPORT'],
            ].map(([title, value], index) => (
              <div
                key={title}
                className={`
                  px-5 py-4
                  ${index !== 3 ? 'md:border-r border-[#ead8b8]' : ''}
                `}
              >

                <p className="text-[11px] font-medium leading-none text-[#9d7a55]">
                  {title}
                </p>

                <p className="mt-2 text-[15px] font-medium leading-[1.45] text-[#5b3823]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR CARD */}
      <div className="rounded-[22px] border border-[#ecdcbf] bg-[#fbf3e4] px-5 py-5 shadow-[0_10px_24px_rgba(70,40,15,0.04)]">

        <div className="flex items-start gap-4">

          {/* QR */}
          <div className="flex h-[94px] w-[94px] shrink-0 items-center justify-center rounded-[10px] bg-white shadow-sm">

            <div className="h-[72px] w-[72px] bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%)] bg-[length:12px_12px] bg-[position:0_0,6px_6px]" />
          </div>

          {/* TEXT */}
          <div>

            <h4 className="text-[17px] font-semibold leading-[1.4] text-[#5a321a]">
              Scan QR to Contribute
            </h4>

            <p className="mt-2 text-[13px] leading-[1.7] text-[#805838]">
              Support easily and securely through our dedicated support channel.
            </p>
          </div>
        </div>
      </div>
    </div>
  

          {/* DISCLAIMER */}
          <div className="mt-6 rounded-[20px] border border-[#e4cfaa] bg-[#fcf8f1] px-5 py-5">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4d1f0f] text-[#f0c36d]">
                <ShieldCheck size={16} />
              </div>

              <div>

                <h4 className="text-[16px] font-medium text-[#5a311a]">
                  Disclaimer
                </h4>

                <p className="mt-2 text-[13px] leading-[1.8] text-[#6e4b35]">
                  All contributions are voluntary community support
                  contributions. This initiative remains fully separate from
                  restaurant reservations, table deposits, and food order
                  payments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};