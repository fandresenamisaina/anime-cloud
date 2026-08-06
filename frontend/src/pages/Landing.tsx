import { Link } from "react-router-dom";

const features = [
  {
    icon: "📤",
    title: "Importez, puis liberez votre PC",
    text: "Vos episodes restent en ligne. Supprimez-les de votre disque sans rien perdre.",
  },
  {
    icon: "🎬",
    title: "Streaming HTML5 + sous-titres",
    text: "Lecteur integre avec support des fichiers .srt.",
  },
  {
    icon: "📱",
    title: "Multi-appareils",
    text: "Retrouvez votre bibliotheque sur Android, Windows et Linux.",
  },
  {
    icon: "🔍",
    title: "Recherche instantanee",
    text: "Filtrez par titre ou genre en un instant.",
  },
  {
    icon: "❤️",
    title: "Favoris et a regarder",
    text: "Organisez par series, saisons et episodes, marquez ce qui est vu.",
  },
  {
    icon: "☁️",
    title: "Cloud prive",
    text: "Vos videos restent accessibles uniquement a vous, en streaming securise.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/hero.png"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-900/60 via-dark-900/80 to-dark-900" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-32 flex flex-col items-center text-center">
          <img src="/assets/logo.png" alt="AnimeShare Logo" className="w-16 h-16 mb-6" />
          <span className="text-xs uppercase tracking-widest text-red-500 font-semibold mb-4">
            Cloud personnel AnimeShare
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight max-w-3xl">
            Vos animes, en ligne.
            <br />
            Votre disque dur, libere.
          </h1>
          <p className="mt-6 text-gray-300 max-w-xl text-lg">
            Televersez vos episodes, conservez-les en ligne et regardez-les en
            streaming depuis n importe quel appareil.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              to="/register"
              className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition font-semibold"
            >
              Commencer gratuitement
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-lg bg-dark-700 border border-red-900/30 hover:bg-dark-700/70 transition font-semibold"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
          Tout ce qu il faut pour votre bibliotheque
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-dark-800 border border-dark-700 rounded-2xl p-6 hover:border-red-600/50 transition"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-dark-700">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Pret a faire de la place ?
          </h2>
          <p className="text-gray-400 mb-8">
            Creez votre compte, importez votre premier episode et
            retrouvez-le partout.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition font-semibold"
          >
            Creer mon compte
          </Link>
        </div>
      </section>

      <footer className="text-center text-gray-500 text-sm py-8 border-t border-dark-700">
        AnimeShare - votre cloud personnel de streaming
      </footer>
    </div>
  );
}
