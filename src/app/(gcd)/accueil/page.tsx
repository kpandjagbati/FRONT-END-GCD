export default function AccueilPage() {
  return (
    <section className="overflow-hidden rounded-sm bg-white p-6 shadow-sm">
      <h1 className="yas-title mb-4">
        Bienvenue sur l&apos;interface de GetCallDetail
      </h1>
      <div className="flex justify-center rounded-sm bg-white px-4 py-6">
        {/* Illustration unDraw — Working — Katerina Limpitsouni, undraw.co */}
        <img
          src="/illustrations/working.svg"
          alt="Personne travaillant à un bureau"
          className="h-auto w-full max-w-4xl object-contain"
        />
      </div>
    </section>
  );
}
