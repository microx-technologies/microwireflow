import { toPng, toSvg } from "html-to-image";
import { MW_EXPORT_PADDING, MW_EXPORT_PIXEL_RATIO } from "@/constants.ts";

export type NodesBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function exportImage(
  wrapper: HTMLElement,
  getBounds: (nodeIds: string[]) => NodesBounds,
  nodeIds: string[],
  format: "png" | "svg",
  filename: string,
): Promise<void> {
  const viewport = wrapper.querySelector(
    ".react-flow__viewport",
  ) as HTMLElement | null;
  if (!viewport) {
    throw new Error("[microwireflow] export failed: viewport not found");
  }
  const bounds = getBounds(nodeIds);
  const width = Math.ceil(bounds.width + MW_EXPORT_PADDING * 2);
  const height = Math.ceil(bounds.height + MW_EXPORT_PADDING * 2);
  const style = {
    width: `${width}px`,
    height: `${height}px`,
    transform: `translate(${-bounds.x + MW_EXPORT_PADDING}px,${-bounds.y + MW_EXPORT_PADDING}px) scale(1)`,
  };
  const dataUrl =
    format === "png"
      ? await toPng(viewport, {
          backgroundColor: "#ffffff",
          cacheBust: true,
          pixelRatio: MW_EXPORT_PIXEL_RATIO,
          width,
          height,
          style,
        })
      : await toSvg(viewport, {
          backgroundColor: "#ffffff",
          cacheBust: true,
          width,
          height,
          style,
        });
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
