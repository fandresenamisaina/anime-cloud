import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
    {
        icon: "M12 16V4m0 0L7 9m5-5l5 5M4 20h16",
        title: "Importez, puis libérez votre PC",
        desc: "Vos épisodes restent en ligne. Supprimez-les de votre disque sans rien perdre.",
    },
    {
        icon: "M4 6h16M4 6a2 2 0 012-2h12a2 2 0 012 2M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6M10 10l4 2-4 2v-4z",
        title: "Streaming HTML5 + sous-titres",
        desc: "Lecteur intégré avec support des fichiers .srt et .vtt.",
    },
    {
        icon: "M9 17V7a2 2 0 012-2h2a2 2 0 012 2v10M4 20h16",
        title: "Multi-appareils",
        desc: "Progression synchronisée entre Android, Windows et Linux.",
    },
    {
        icon: "M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z",
        title: "Recherche instantanée",
        desc: "Filtrez par titre, genre ou année en un instant.",
    },
    {
        icon: "M12 21s-7-4.35-9.5-8.5C.5 8.5 2.5 5 6 5c2 0 3.5 1.2 6 4 2.5-2.8 4-4 6-4 3.5 0 5.5 3.5 3.5 7.5C19 16.65 12 21 12 21z",
        title: "Favoris & à regarder",
        desc: "Organisez par séries, saisons et épisodes, marquez ce qui est vu.",
    },
    {
        icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-5.13a4 4 0 11-4-4 4 4 0 014 4zm6 0a4 4 0 11-4-4",
        title: "Partage communautaire",
        desc: "Partagez gratuitement vos animes avec les autres membres.",
    },
];

export default function Home() {
    const { token } = useAuth();

    return (
        <div className="text-white">
            {/* HERO */}
            <section className="relative overflow-hidden min-h-[720px] flex items-center justify-center text-center px-6">
                <div className="absolute inset-0 bg-gradient-to-b from-dark-900/20 via-dark-900/40 to-dark-900" />

                <div className="relative z-10 max-w-4xl mx-auto pt-16 pb-20">
                    <span className="inline-block px-4 py-1.5 rounded-full text-xs tracking-widest uppercase text-purple-200/90 bg-white/5 border border-white/10 mb-8">
                        Cloud personnel d'animes
                    </span>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
                        Vos animes, en ligne.
                    </h1>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 via-purple-400 to-cyan-300 mt-1">
                        Votre disque dur, libéré.
                    </h2>

                    <p className="mt-6 text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
                        Téléversez vos épisodes, partagez-les gratuitement avec la communauté
                        et regardez-les en streaming depuis n'importe quel appareil.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to={token ? "/catalogue" : "/register"}
                            className="px-8 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 hover:opacity-90 transition shadow-lg shadow-purple-900/40"
                        >
                            {token ? "Ouvrir le catalogue" : "Commencer gratuitement"}
                        </Link>
                        <Link
                            to="/series/new"
                            className="px-8 py-3.5 rounded-xl font-semibold bg-dark-800/80 border border-white/10 hover:bg-dark-700 transition backdrop-blur"
                        >
                            Importer un épisode
                        </Link>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="px-6 py-20 max-w-6xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-14">
                    Tout ce qu'il faut pour votre bibliothèque
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((f) => (
                        <div
                            key={f.title}
                            className="rounded-2xl border border-white/10 bg-dark-800/60 p-6 hover:border-purple-500/40 transition"
                        >
                            <svg
                                className="w-7 h-7 text-purple-400 mb-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d={f.icon} />
                            </svg>
                            <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            {!token && (
                <section className="px-6 py-20 text-center border-t border-white/5">
                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                        Prêt à faire de la place ?
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto mb-8">
                        Créez votre compte, importez votre premier épisode et retrouvez-le
                        partout.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block px-8 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 hover:opacity-90 transition shadow-lg shadow-purple-900/40"
                    >
                        Créer mon compte
                    </Link>
                </section>
            )}
        </div>
    );
}