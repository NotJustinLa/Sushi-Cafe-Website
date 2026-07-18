
const btnBase =
    'inline-flex items-center rounded-full px-[26px] py-4 font-mono text-[12px] ' +
    'uppercase tracking-[0.14em] text-bg no-underline transition-colors duration-200'

export default function Visit() {
    return (
        <section
            id="visit"
            className="relative z-[4] flex min-h-screen flex-col bg-[#100d0b] px-[var(--pad-x)] pb-[60px] pt-[140px] text-bg"
        >
            {/* flex-1 absorbs the leftover height → centres content AND pins the footer */}
            <div className="mx-auto grid w-full max-w-[var(--container-maxw)] flex-1 grid-cols-[1.1fr_1fr] items-center gap-20 max-[920px]:grid-cols-1 max-[920px]:gap-10 max-[920px]:pt-10">

                {/* LEFT — headline + conversion */}
                <div>

                    {/* Exactly one red italic accent word — the site's signature move */}
                    <h2 className="mb-9 mt-6 font-display text-[clamp(48px,7vw,104px)] font-bold leading-[0.95] tracking-[-0.015em]">
                        Come sit at<br />the <em className="italic text-red">counter</em>.
                    </h2>

                    <div className="mt-10 flex flex-wrap gap-[14px]">
                        <a
                            href="tel:+61398570000"
                            className={`${btnBase} border border-red bg-red hover:border-red-deep hover:bg-red-deep`}
                        >
                            Call to Order
                        </a>
                        <a
                            href="https://maps.google.com/?q=292+Doncaster+Rd+Balwyn+North+VIC+3104"
                            target="_blank"
                            rel="noopener"
                            className={`${btnBase} border border-bg/30 bg-transparent hover:border-bg`}
                        >
                            Get Directions
                        </a>
                    </div>
                </div>

                {/* RIGHT — the facts, as a 2×2 grid that stacks below 920px */}
                <div className="grid grid-cols-2 gap-9 max-[920px]:grid-cols-1 max-[920px]:gap-7">
                    <div>
                        <h4 className="mb-[14px] font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-bg/45">
                            Address
                        </h4>
                        <p className="mb-1 font-display text-[clamp(18px,1.5vw,22px)] leading-[1.4]">292 Doncaster Rd</p>
                        <p className="mb-1 font-display text-[clamp(18px,1.5vw,22px)] leading-[1.4]">Balwyn North VIC 3104</p>
                    </div>

                    <div>
                        <h4 className="mb-[14px] font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-bg/45">
                            Hours
                        </h4>
                        <p className="mb-1 font-display text-[clamp(18px,1.5vw,22px)] leading-[1.4]">Mon – Sat</p>
                        <p className="mb-1 font-body text-[14px] leading-[1.4] text-bg/65">
                            10am – 5pm · Closed Sundays
                        </p>
                    </div>

                    <div>
                        <h4 className="mb-[14px] font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-bg/45">
                            Phone
                        </h4>
                        <p className="mb-1 font-display text-[clamp(18px,1.5vw,22px)] leading-[1.4]">
                            <a
                                href="tel:+61398570000"
                                className="border-b border-bg/30 text-inherit no-underline hover:border-bg"
                            >
                                (03) 9857 0000
                            </a>
                        </p>
                    </div>

                    <div>
                        <h4 className="mb-[14px] font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-bg/45">
                            Since
                        </h4>
                        <p className="mb-1 font-display text-[clamp(18px,1.5vw,22px)] leading-[1.4]">2013</p>
                        <p className="mb-1 font-body text-[14px] leading-[1.4] text-bg/65">Hand-rolled fresh daily</p>
                    </div>
                </div>
            </div>

            {/* Footer bar — pinned to the bottom by the flex-1 grid above */}
            <div className="mt-20 flex flex-wrap justify-between gap-3 border-t border-bg/[0.12] pt-7 font-mono text-[11px] uppercase tracking-[0.14em] text-bg/45">
                <span>Sushi Cafe · 寿司カフェ</span>
                <span>Balwyn North</span>
                <span>© 2013–2025</span>
            </div>
        </section>
    )
}
