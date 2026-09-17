import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GetCallDetail | Yas",
  description: "Interface GetCallDetail Yas",
  icons: {
    icon: "/logo-yas.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" data-theme="light" suppressHydrationWarning>
      <body className={`${montserrat.variable} min-h-full font-sans antialiased`} suppressHydrationWarning>
        <Script id="theme-boot" strategy="beforeInteractive">
          {`(function(){try{localStorage.removeItem("gcd-theme");var r=document.documentElement;r.setAttribute("data-theme","light");r.classList.remove("dark");}catch(e){}})();`}
        </Script>
        <Script id="strip-extension-attrs" strategy="beforeInteractive">
          {`(function(){function clean(el){if(!el||!el.attributes)return;var drop=[];for(var i=0;i<el.attributes.length;i++){var n=el.attributes[i].name;if(n==="data-theme")continue;if(n.indexOf("data-")===0||n.indexOf("crx")===0)drop.push(n);}for(var j=0;j<drop.length;j++)el.removeAttribute(drop[j]);}clean(document.documentElement);clean(document.body);})();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
