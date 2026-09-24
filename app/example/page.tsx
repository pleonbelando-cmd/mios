import Link from "next/link";
export default function ExamplePage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-5 py-8">
      <Link href="/" className="text-sm text-brand-300 underline">
        ← Volver a MIOS
      </Link>
      <p className="text-xs font-semibold uppercase tracking-widest text-teal-300">
        Ejemplo ilustrativo · Datos ficticios
      </p>
      <h1 className="text-3xl font-bold">Así se desbloquearía un beneficio.</h1>
      <p className="text-sm leading-relaxed text-zinc-300">
        Este ejemplo explica el producto. No representa tu cartera, no consulta
        saldos y no emite un cupón firmado.
      </p>
      <ol className="space-y-6 border-l border-teal-500 pl-5 text-sm">
        <li>
          <h2 className="font-semibold">01 · Una posición de ejemplo</h2>
          <p className="mt-2 text-zinc-300">
            Imagina una posición en NVDAx valorada en 2.000 USD. Es una cifra
            ficticia, no una cotización ni una recomendación de inversión.
          </p>
        </li>
        <li>
          <h2 className="font-semibold">02 · Una campaña hipotética</h2>
          <p className="mt-2 text-zinc-300">
            Un comercio podría ofrecer un 10 % de descuento a titulares que
            alcancen ese valor. El umbral se aplica a ese activo, no a toda la
            cartera.
          </p>
        </li>
        <li>
          <h2 className="font-semibold">03 · Un precio ilustrativo</h2>
          <p className="mt-2 text-zinc-300">
            Un producto de 100 USD quedaría en 90 USD. No existe oferta
            comercial ni pago en esta demostración.
          </p>
        </li>
      </ol>
      <p className="text-sm text-zinc-300">
        En el recorrido con wallet, MIOS exige tu firma y vuelve a comprobar
        saldo y precio antes de acreditar el beneficio de demostración.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-brand-600 px-4 py-3 text-center font-semibold"
      >
        Consultar mi posición real
      </Link>
    </main>
  );
}
