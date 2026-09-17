type PageHeroProps = {
  title: string;
  description: string;
  image: string;
  imageClassName?: string;
};

export default function PageHero({ title, description, image, imageClassName }: PageHeroProps) {
  return (
    <div className="grid items-center gap-6 rounded-3xl bg-white px-8 py-6 shadow-[0_12px_32px_rgba(1,55,125,0.06)] md:grid-cols-[1fr_1fr]">
      <div>
        <h1 className="text-2xl font-bold text-yas-navy">{title}</h1>
        <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-neutral-600">
          {description}
        </p>
        <div className="mt-4 h-1.5 w-24 rounded-full bg-yas-yellow" />
      </div>
      <div className="flex justify-center md:justify-end">
        <span className="yas-illustration-well flex h-44 w-full max-w-md items-center justify-center rounded-2xl bg-[#eef4ff] px-4">
          <img
            src={image}
            alt=""
            className={imageClassName ?? "yas-illustration h-40 w-auto max-w-full object-contain"}
          />
        </span>
      </div>
    </div>
  );
}
