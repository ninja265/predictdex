export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-charcoal">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-mist lg:flex-row lg:items-center lg:justify-between">
        <p className="uppercase tracking-[0.35em] text-xs text-mist">
          AfricaPredicts — Pan-African Prediction Exchange
        </p>
        <div className="flex gap-6 text-xs uppercase tracking-[0.25em]">
          <span>© {new Date().getFullYear()}</span>
          <a href="mailto:hello@africapredicts.xyz" className="hover:text-white">
            Contact
          </a>
          <a href="https://rainbowkit.com" target="_blank" rel="noreferrer" className="hover:text-white">
            Wallet Support
          </a>
        </div>
      </div>
    </footer>
  );
}

