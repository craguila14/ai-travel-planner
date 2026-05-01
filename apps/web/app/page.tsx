import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="font-bold text-gray-800 text-lg">Travel Planner</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">
              Proyecto de portafolio · Next.js + NestJS
            </span>
            <Link
              href="/trips/new"
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold px-5 py-2.5 rounded-xl hover:scale-105 transition-transform text-sm"
            >
              Crear viaje
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-orange-500 via-pink-500 to-red-500">
        <div className="max-w-3xl mx-auto text-center text-white">
          <div className="text-6xl mb-6">✈️</div>
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
            Planifica viajes grupales,{' '}
            <span className="text-yellow-300">sin el caos</span>
          </h1>
          <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
            Cada amigo comparte sus preferencias y presupuesto. La IA genera
            el itinerario perfecto para todo el grupo. Votan, ajustan y listo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/trips/new"
              className="px-8 py-4 bg-white text-orange-500 font-bold text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform"
            >
              🗺️ Crear un viaje gratis
            </Link>
            <a
              href="https://github.com/craguila14"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold text-lg rounded-2xl hover:bg-white/30 transition-colors"
            >
              Ver código →
            </a>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-orange-500 font-bold uppercase tracking-widest text-sm mb-3">
            Cómo funciona
          </p>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Cuatro pasos, sin fricciones
          </h2>
          <div className="flex flex-col gap-8">
            {[
              {
                step: '1',
                title: 'Crea el viaje',
                desc: 'El organizador crea el viaje con destino, fechas y moneda. Se genera un link único para compartir con el grupo.',
                emoji: '🗺️',
                color: 'from-orange-500 to-pink-500',
              },
              {
                step: '2',
                title: 'Cada uno comparte sus preferencias',
                desc: 'Cada amigo entra al link, se une con su nombre y llena su propuesta: presupuesto, estilo de viaje, lugares que quiere visitar y qué quiere evitar.',
                emoji: '📝',
                color: 'from-pink-500 to-red-500',
              },
              {
                step: '3',
                title: 'La IA genera el itinerario',
                desc: 'Cuando todos enviaron su propuesta, la IA analiza las preferencias, detecta conflictos de presupuesto y genera un itinerario que maximiza la satisfacción del grupo.',
                emoji: '🤖',
                color: 'from-violet-600 to-blue-500',
              },
              {
                step: '4',
                title: 'Votan y ajustan',
                desc: 'El grupo vota cada actividad con 👍 o 👎. El organizador puede regenerar el itinerario y la IA incorpora el feedback automáticamente.',
                emoji: '🗳️',
                color: 'from-blue-500 to-cyan-400',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className={`bg-gradient-to-br ${item.color} text-white font-bold text-xl w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                  {item.step}
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                    {item.emoji} {item.title}
                  </h3>
                  <p className="text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mockup del itinerario */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-violet-600 font-bold uppercase tracking-widest text-sm mb-3">
            Itinerario generado por IA
          </p>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Un plan completo para todo el grupo
          </h2>

          <div className="bg-gray-50 rounded-3xl p-6 shadow-xl border border-gray-100 max-w-lg mx-auto">

            <div className="bg-gradient-to-r from-violet-600 to-blue-500 rounded-2xl p-5 text-white mb-4">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
                Itinerario v2 · Barcelona
              </p>
              <h3 className="text-xl font-bold mb-1">🗓️ Tu viaje planificado</h3>
              <p className="text-white/80 text-sm">5 días · EUR 850 por persona</p>
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {['Día 1', 'Día 2', 'Día 3'].map((d, i) => (
                  <div
                    key={d}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold ${
                      i === 0 ? 'bg-white text-violet-600' : 'bg-white/20 text-white'
                    }`}
                  >
                    {d}
                  </div>
                ))}
                <div className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/20 text-white">
                  ···
                </div>
              </div>
            </div>

            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span>🤖</span>
                <span className="font-bold text-violet-700 text-xs uppercase tracking-wide">
                  Por qué este itinerario
                </span>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                Combiné las preferencias culturales de Ana y Pedro con el presupuesto más ajustado del grupo. Reemplacé la discoteca del v1 (rechazada por 3/4) por un paseo nocturno por el Gótico.
              </p>
            </div>

            {[
              {
                time: '09:00 - 11:30',
                title: 'Sagrada Família',
                category: '🏛️ museo',
                cost: '€26',
                up: 4,
                down: 0,
                total: 4,
                categoryColor: 'bg-blue-100 text-blue-700',
              },
              {
                time: '13:00 - 14:30',
                title: 'Bodega La Cova Fumada',
                category: '🍽️ restaurante',
                cost: '€22',
                up: 3,
                down: 1,
                total: 4,
                categoryColor: 'bg-orange-100 text-orange-700',
              },
              {
                time: '20:00 - 22:00',
                title: 'Paseo nocturno por el Gótico',
                category: '🎭 entretenimiento',
                cost: '€0',
                up: 4,
                down: 0,
                total: 4,
                categoryColor: 'bg-purple-100 text-purple-700',
              },
            ].map((activity) => (
              <div key={activity.title} className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${activity.categoryColor}`}>
                    {activity.category}
                  </span>
                  <span className="text-xs text-gray-400">🕐 {activity.time}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-auto ${
                    activity.up / activity.total >= 0.6
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    👍 {activity.up}/{activity.total}
                  </span>
                </div>
                <p className="font-bold text-gray-800 text-sm mb-1">{activity.title}</p>
                <p className="text-xs font-semibold text-orange-500">{activity.cost} por persona</p>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <div className="flex-1 bg-green-50 text-green-700 font-bold py-1.5 rounded-xl text-xs text-center">
                    👍 Me gusta ({activity.up})
                  </div>
                  <div className="flex-1 bg-red-50 text-red-700 font-bold py-1.5 rounded-xl text-xs text-center">
                    👎 No me gusta ({activity.down})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features técnicas */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-orange-500 font-bold uppercase tracking-widest text-sm mb-3">
            Características técnicas
          </p>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Lo que hace interesante este proyecto
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                emoji: '🧠',
                title: 'Pipeline híbrido IA + código',
                desc: 'El consenso del grupo se agrega con TypeScript puro antes de llamar al LLM. La aritmética final también. Solo se usa IA donde aporta valor real.',
              },
              {
                emoji: '🔁',
                title: 'Feedback loop con votación',
                desc: 'Los votos del grupo se pasan como contexto al LLM al regenerar. El itinerario v2 sabe qué gustó y qué no del v1.',
              },
              {
                emoji: '✅',
                title: 'Salida estructurada con Zod',
                desc: 'La respuesta del LLM se valida con un schema Zod. Si no cumple el formato, se reintenta automáticamente con el error como feedback.',
              },
              {
                emoji: '📊',
                title: 'Observabilidad de llamadas LLM',
                desc: 'Cada llamada a Claude se loggea con tokens, latencia y costo. Panel admin para ver métricas y comparar versiones de prompt.',
              },
              {
                emoji: '🗺️',
                title: 'Sin registro requerido',
                desc: 'Acceso por link compartido. El participantId se guarda en localStorage. Sin cuentas, sin passwords, sin fricción.',
              },
              {
                emoji: '🏗️',
                title: 'Monorepo con pnpm workspaces',
                desc: 'Next.js y NestJS en un mismo repo con tipos compartidos. Docker Compose para desarrollo local con un solo comando.',
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-3xl mb-3">{f.emoji}</div>
                <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-400 font-bold uppercase tracking-widest text-sm mb-8">
            Stack tecnológico
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Next.js 15', desc: 'Frontend · App Router' },
              { label: 'NestJS', desc: 'Backend · API REST' },
              { label: 'PostgreSQL', desc: 'Base de datos' },
              { label: 'Prisma', desc: 'ORM' },
              { label: 'Claude API', desc: 'IA · Anthropic' },
              { label: 'Zod', desc: 'Validación LLM' },
              { label: 'BullMQ', desc: 'Colas asíncronas' },
              { label: 'Docker', desc: 'Contenedores' },
            ].map((tech) => (
              <div key={tech.label} className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-center">
                <p className="font-bold text-gray-800 text-sm">{tech.label}</p>
                <p className="text-gray-400 text-xs">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-center">
        <p className="text-gray-400 text-sm">
          Construido por{' '}
          <a
            href="https://github.com/craguila14"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-semibold hover:text-orange-400 transition-colors"
          >
            Constanza Águila
          </a>
          · Proyecto de portafolio ·{' '}
          <a
            href="https://github.com/craguila14"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-semibold hover:text-orange-400 transition-colors"
          >
            GitHub
          </a>
        </p>
      </footer>

    </main>
  )
}