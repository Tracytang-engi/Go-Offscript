export default function Footer() {
  return (
    <footer className="bg-dark text-white py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-orange font-black text-lg">go off script</p>
          <p className="text-white/40 text-sm mt-1">
            &copy; {new Date().getFullYear()} Go Off Script. All rights reserved.
          </p>
        </div>

        <div className="flex gap-6">
          <a href="mailto:hello@gooffscript.app" className="text-white/60 text-sm hover:text-white transition-colors">
            contact
          </a>
          <a href="#" className="text-white/60 text-sm hover:text-white transition-colors">
            privacy
          </a>
          <a href="#waitlist" className="text-orange text-sm font-bold hover:text-orange/80 transition-colors">
            join waitlist
          </a>
        </div>
      </div>
    </footer>
  );
}
