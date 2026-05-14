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

      {/* HERO SECTION */}
      <section className="px-4 pt-10 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="py-5 lg:py-7">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">

              {/* LEFT TEXT */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ddb978]/50 bg-[#fffaf0] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#b87724]">
                  <HeartHandshake size={12} />
                  Community Support Initiative
                </div>

                <h1 className="mt-5 max-w-[600px] text-[42px] font-semibold leading-[1.05] tracking-[-0.02em] text-[#3a1f11] lg:text-[50px] xl:text-[54px]">
                  Support Harman
                </h1>

                <p className="mt-5 max-w-[560px] text-[15.5px] leading-[1.8] text-[#9a6d47]">
                  A respectful and transparent community support initiative
                  dedicated to ongoing legal and community assistance efforts.
                </p>

                <p className="mt-4 max-w-[560px] text-[15px] leading-[1.8] text-[#5f3c27]/85">
                  This section exists independently from restaurant reservations,
                  food orders, and table deposit payments.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-[#e2c695] bg-[#fffaf3] px-4 py-2.5 text-[13px] font-medium text-[#9b672f]">
                    <ShieldCheck size={15} />
                    Voluntary Contributions
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-xl border border-[#e2c695] bg-[#fffaf3] px-4 py-2.5 text-[13px] font-medium text-[#9b672f]">
                    <Users size={15} />
                    Transparent & Community Driven
                  </div>
                </div>
              </div>

              {/* RIGHT HERO IMAGE */}
              <div className="w-full">
                <div className="relative overflow-hidden rounded-[24px] border border-[#e1c89d] shadow-[0_18px_40px_rgba(80,45,16,0.1)]">
                  <div className="aspect-[1.15/0.75]">
                    <img
                      src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=900&fit=crop"
                      alt="Community support"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />

                  <div className="absolute bottom-5 left-5 rounded-[18px] border border-white/10 bg-[#4d2818]/85 px-4 py-3 backdrop-blur-xl sm:bottom-6 sm:left-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d7ab6c] bg-[#5b311d] text-[#efc57d]">
                        <Play size={17} className="ml-0.5 fill-current" />
                      </div>
                      <div>
                        <h3 className="text-[17px] font-medium leading-none text-[#fff5df]">
                          Watch Our Story
                        </h3>
                        <p className="mt-1.5 text-[12px] leading-[1.3] text-[#ead8be]/90">
                          Care, respect & support
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* SECOND BLOCK */}
            <div className="mt-16 grid items-center gap-10 lg:mt-24 lg:grid-cols-[0.9fr_1fr] lg:gap-14 xl:gap-20">
              <div className="relative mx-auto w-full max-w-[500px] lg:mx-0">
                <div className="absolute -left-4 top-8 grid grid-cols-4 gap-1.5 opacity-35">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} className="h-[3px] w-[3px] rounded-full bg-[#d5a15d]" />
                  ))}
                </div>
                <div className="relative overflow-hidden rounded-[24px] border border-[#ead8ba] bg-white shadow-[0_12px_30px_rgba(60,31,12,0.08)]">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=700&h=900&fit=crop"
                    alt="Community support"
                    className="h-[360px] w-full object-cover sm:h-[420px]"
                  />
                </div>
                <div className="absolute -bottom-6 left-[-15px] overflow-hidden rounded-[18px] border-[5px] border-[#f7f2ea] bg-white shadow-[0_10px_24px_rgba(50,25,10,0.12)] sm:-bottom-8 sm:-left-8">
                  <img
                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=500&fit=crop"
                    alt="Community gathering"
                    className="h-[130px] w-[180px] object-cover sm:h-[150px] sm:w-[200px]"
                  />
                </div>
              </div>

              <div className="w-full">
                <div className="flex items-center gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c0822f]">
                    Why This Initiative Exists
                  </p>
                  <div className="h-[1px] w-12 bg-[#d9b47f]" />
                </div>

                <h2 className="mt-4 max-w-[620px] text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] text-[#3b1f12] lg:text-[46px] xl:text-[50px]">
                  Built Through Community Goodwill
                </h2>

                <div className="mt-6 max-w-[640px] space-y-4">
                  <p className="text-[15.5px] leading-[1.8] text-[#5f3d29]/85 sm:text-[16px]">
                    This initiative was created to help provide structured
                    community and legal assistance during a difficult period.
                  </p>
                  <p className="text-[15.5px] leading-[1.8] text-[#5f3d29]/85 sm:text-[16px]">
                    Support from the wider community helps maintain practical
                    resources, coordination efforts, and ongoing assistance in a
                    transparent and respectful way.
                  </p>
                </div>

                <div className="mt-8 max-w-[640px] rounded-[20px] border border-[#eed6ac] bg-[#fbf2df] px-5 py-6 shadow-[0_8px_24px_rgba(120,82,26,0.06)] sm:px-7 sm:py-7">
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e0af53] text-white shadow-sm sm:h-14 sm:w-14">
                      <HeartHandshake size={20} />
                    </div>
                    <div>
                      <p className="text-[18px] font-medium leading-[1.4] text-[#6d4223] sm:text-[20px]">
                        There is absolutely no pressure to contribute.
                      </p>
                      <p className="mt-2 text-[14px] leading-[1.7] text-[#8c6544] sm:text-[15px]">
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
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#c48735]">
              <BadgeCheck size={13} />
              Community Support Areas
            </div>
            <div className="h-[1px] w-24 bg-[#d7b27c]" />
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {supportAreas.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[20px] border border-[#e8d4b5] bg-[#fbf8f2] px-6 py-7 shadow-[0_10px_24px_rgba(70,40,16,0.04)]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4d1f0f] text-[#efc46e]">
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-6 text-[22px] font-medium leading-none text-[#3b1f12]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-[1.7] text-[#6d4b35]/85">
                    {item.description}
                  </p>
                  <div className="mt-6 h-[2px] w-10 bg-[#d5a25f]" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* IMPACT SECTION */}
      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="overflow-hidden rounded-[24px] bg-gradient-to-r from-[#2a0f07] via-[#4a1f0d] to-[#2d1108] px-6 py-8 shadow-[0_18px_40px_rgba(40,15,5,0.18)] sm:px-10 sm:py-10">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#e2b267]">
                    <BadgeCheck size={11} />
                    Our Impact So Far
                  </div>
                  <div className="h-[1px] w-10 bg-[#d2a056]" />
                </div>
                <div className="mt-7 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
                  {impactStats.map((item) => (
                    <div key={item.label}>
                      <div className="text-[36px] font-semibold leading-none text-[#f2c373] xl:text-[42px]">
                        {item.number}
                      </div>
                      <p className="mt-3 text-[12px] leading-[1.4] text-[#ead5bf]">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#f0c57a]">
                  <ShieldCheck size={12} />
                  Transparency & Trust
                </div>
                <div className="mt-6 space-y-4">
                  {[
                    'Separate from restaurant business operations',
                    'Voluntary support contributions only',
                    'Transparent community-driven initiative',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#d6aa64] text-[#f0c57a]">
                        <Check size={12} />
                      </div>
                      <p className="text-[14px] leading-[1.6] text-[#edd9c3]">
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

      {/* GALLERY SECTION (MOBILE OPTIMIZED) */}
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#c48735]">
              <BadgeCheck size={13} />
              Our Community In Action
            </div>
            <div className="h-[1px] w-20 bg-[#d7b27c]" />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={image}
                className={`group relative overflow-hidden rounded-[16px] ${
                  index === 4 ? 'col-span-2 sm:col-span-1' : ''
                }`}
              >
                <img
                  src={image}
                  alt="Community"
                  className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                    index === 4 ? 'aspect-[2/1] sm:aspect-square' : 'aspect-square'
                  }`}
                />
                <div className="absolute inset-0 bg-black/10 transition-all duration-500 group-hover:bg-black/35" />

                {index === 3 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3e1e12]/90 text-[#f2c678] backdrop-blur-md sm:h-14 sm:w-14">
                      <Play size={20} className="ml-1 fill-current" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BANK DETAILS */}
      <section className="px-4 py-10 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#c48735]">
              <Landmark size={13} />
              Contribution Information
            </div>
            <div className="h-[1px] w-24 bg-[#d7b27c]" />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.55fr] xl:gap-8">
            <div className="rounded-[22px] border border-[#ecdcbf] bg-[#fcfaf6] px-6 py-7 shadow-[0_10px_24px_rgba(70,40,15,0.04)] sm:px-8">
              <div className="flex items-center gap-3">
                <div className="text-[#8b5d2d]">
                  <Landmark size={26} />
                </div>
                <h3 className="text-[22px] font-semibold text-[#4a2815]">
                  UK Bank Details
                </h3>
              </div>

              <div className="mt-6 overflow-hidden rounded-[16px] border border-[#ead8b8] bg-[#fffdfa]">
                <div className="grid grid-cols-2 md:grid-cols-4">
                  {[
                    ['Account Name', 'Harman Community Support'],
                    ['Sort Code', '12-34-56'],
                    ['Account Number', '12345678'],
                    ['Reference', 'HARMAN SUPPORT'],
                  ].map(([title, value], index) => (
                    <div
                      key={title}
                      className={`px-5 py-5 ${
                        index !== 3 ? 'md:border-r border-[#ead8b8]' : ''
                      } ${index < 2 ? 'border-b border-[#ead8b8] md:border-b-0' : ''}`}
                    >
                      <p className="text-[12px] font-medium leading-none text-[#9d7a55]">
                        {title}
                      </p>
                      <p className="mt-2.5 text-[15.5px] font-medium leading-[1.4] text-[#5b3823]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center rounded-[22px] border border-[#ecdcbf] bg-[#fbf3e4] px-6 py-7 shadow-[0_10px_24px_rgba(70,40,15,0.04)] sm:px-8">
              <div className="flex items-start gap-5">
                <div className="flex h-[100px] w-[100px] shrink-0 items-center justify-center rounded-[12px] bg-white shadow-sm">
                  <div className="h-[76px] w-[76px] bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%)] bg-[length:12px_12px] bg-[position:0_0,6px_6px]" />
                </div>
                <div>
                  <h4 className="text-[18px] font-semibold leading-[1.3] text-[#5a321a]">
                    Scan QR to Contribute
                  </h4>
                  <p className="mt-2 text-[14px] leading-[1.6] text-[#805838]">
                    Support easily and securely through our dedicated support channel.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[20px] border border-[#e4cfaa] bg-[#fcf8f1] px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#4d1f0f] text-[#f0c36d]">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-[17px] font-medium text-[#5a311a]">
                  Disclaimer
                </h4>
                <p className="mt-2 text-[14.5px] leading-[1.7] text-[#6e4b35]">
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