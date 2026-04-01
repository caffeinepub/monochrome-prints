export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <p className="font-display text-base font-bold uppercase tracking-widest text-foreground mb-3">
              ACHROMIS
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Curated greyscale fine art prints for collectors who appreciate
              the drama of light and shadow.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
              Shop
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/collections"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  All Prints
                </a>
              </li>
              <li>
                <a
                  href="/collections"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Collections
                </a>
              </li>
              <li>
                <a
                  href="/#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  New Arrivals
                </a>
              </li>
              <li>
                <a
                  href="/#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Gift Cards
                </a>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
              Information
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a
                  href="/#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Print Quality
                </a>
              </li>
              <li>
                <a
                  href="/#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {year}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            All prints on archival museum-grade paper.
          </p>
        </div>
      </div>
    </footer>
  );
}
