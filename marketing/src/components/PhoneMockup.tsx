import type { ImgHTMLAttributes } from "react";

type Props = {
  alt: string;
  src: string;
  priority?: boolean;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "alt" | "src">;

/**
 * Framed marketing screenshot — assets already include the device chrome.
 */
export function PhoneMockup({ alt, src, priority, className = "", ...rest }: Props) {
  return (
    <figure className={`marketing-shot ${className}`.trim()}>
      <img
        src={src}
        alt={alt}
        width={520}
        height={980}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        {...rest}
      />
    </figure>
  );
}
