import type { ReactNode } from "react";

type PageHeroProps = {
  title: string;
  description: string;
  image: string;
  children: ReactNode;
};

export default function PageHero({ title, description, image, children }: Readonly<PageHeroProps>) {
  return (
    <div className="mx-auto grid w-full max-w-5xl items-center justify-center gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,36rem)] lg:gap-x-10 lg:gap-y-2">
      <div className="w-full max-w-xs">
        <h1 className="text-xl font-bold text-yas-navy sm:text-2xl">{title}</h1>
        <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-600">{description}</p>
        <div className="mt-4 h-1.5 w-24 rounded-full bg-yas-yellow" />
      </div>
      <div className="hidden lg:block" />
      <img src={image} alt="" className="h-auto w-full max-w-xs object-contain lg:max-w-sm" />
      {children}
    </div>
  );
}
