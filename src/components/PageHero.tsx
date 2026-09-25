import type { ReactNode } from "react";

type PageHeroProps = {
  title: string;
  description: string;
  image: string;
  children: ReactNode;
};

export default function PageHero({ title, description, image, children }: Readonly<PageHeroProps>) {
  return (
    <div className="mx-auto grid w-full min-w-0 max-w-5xl items-center justify-center gap-4 sm:gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,36rem)] lg:gap-x-10 lg:gap-y-2">
      <div className="w-full min-w-0 max-w-md lg:max-w-xs">
        <h1 className="text-xl font-bold text-yas-navy sm:text-2xl">{title}</h1>
        <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-600">{description}</p>
        <div className="mt-3 h-1.5 w-24 rounded-full bg-yas-yellow sm:mt-4" />
      </div>
      <div className="hidden lg:block" />
      <img
        src={image}
        alt=""
        className="mx-auto hidden h-auto w-full max-w-[200px] object-contain sm:block sm:max-w-xs lg:max-w-sm"
      />
      <div className="w-full min-w-0">{children}</div>
    </div>
  );
}
