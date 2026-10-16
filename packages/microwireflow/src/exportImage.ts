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
  const restoreInlineStyles: Array<() => void> = [];
  const inlineSvgEdgeStyles = (): void => {
    const paths = viewport.querySelectorAll(
      ".react-flow__edges path.react-flow__edge-path",
    );
    paths.forEach((path) => {
      const element = path as unknown as SVGElement & HTMLElement;
      const computed = window.getComputedStyle(element);
      const previous = element.style.cssText;
      element.style.stroke = computed.getPropertyValue("stroke");
      element.style.strokeWidth = computed.getPropertyValue("stroke-width");
      element.style.strokeLinecap = computed.getPropertyValue("stroke-linecap");
      element.style.fill = computed.getPropertyValue("fill");
      const dasharray = computed.getPropertyValue("stroke-dasharray");
      if (dasharray !== "" && dasharray !== "none") {
        element.style.strokeDasharray = dasharray;
      }
      restoreInlineStyles.push(() => {
        element.style.cssText = previous;
      });
    });
    const labels = viewport.querySelectorAll(".react-flow__edge-text");
    labels.forEach((label) => {
      const element = label as unknown as SVGElement & HTMLElement;
      const computed = window.getComputedStyle(element);
      const previous = element.style.cssText;
      element.style.fill = computed.getPropertyValue("fill");
      element.style.fontSize = computed.getPropertyValue("font-size");
      element.style.fontFamily = computed.getPropertyValue("font-family");
      restoreInlineStyles.push(() => {
        element.style.cssText = previous;
      });
    });
    const labelBackgrounds = viewport.querySelectorAll(
      ".react-flow__edge-textbg",
    );
    labelBackgrounds.forEach((background) => {
      const element = background as unknown as SVGElement & HTMLElement;
      const computed = window.getComputedStyle(element);
      const previous = element.style.cssText;
      element.style.fill = computed.getPropertyValue("fill");
      element.style.stroke = computed.getPropertyValue("stroke");
      element.style.strokeWidth = computed.getPropertyValue("stroke-width");
      restoreInlineStyles.push(() => {
        element.style.cssText = previous;
      });
    });
    const edgeSvgs = viewport.querySelectorAll(".react-flow__edges svg");
    edgeSvgs.forEach((svg) => {
      const element = svg as unknown as SVGElement & HTMLElement;
      const previous = element.style.cssText;
      element.style.position = "absolute";
      element.style.overflow = "visible";
      element.style.pointerEvents = "none";
      element.style.top = "0px";
      element.style.left = "0px";
      restoreInlineStyles.push(() => {
        element.style.cssText = previous;
      });
    });
  };

  inlineSvgEdgeStyles();

  const container = document.createElement("div");
  container.className = "mw react-flow";
  container.style.position = "fixed";
  container.style.left = "0px";
  container.style.top = "0px";
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.zIndex = "-99999";
  container.style.pointerEvents = "none";
  container.style.boxSizing = "border-box";
  container.style.overflow = "hidden";

  const viewportParent = viewport.parentNode;
  const viewportSibling = viewport.nextSibling;
  const prevViewportCss = viewport.style.cssText;

  viewport.style.width = `${width}px`;
  viewport.style.height = `${height}px`;
  viewport.style.transform = `translate(${-bounds.x + MW_EXPORT_PADDING}px,${-bounds.y + MW_EXPORT_PADDING}px) scale(1)`;
  viewport.style.border = "none";
  viewport.style.background = "transparent";

  container.appendChild(viewport);
  document.body.appendChild(container);

  const includeStyleProperties = Array.from(
    window.getComputedStyle(container),
    (property) => property,
  );

  let dataUrl: string;
  try {
    const common = {
      backgroundColor: "transparent",
      cacheBust: true,
      width,
      height,
      style: {
        position: "relative",
        left: "0px",
        top: "0px",
        zIndex: "0",
        width: `${width}px`,
        height: `${height}px`,
      },
      includeStyleProperties,
    };
    dataUrl =
      format === "png"
        ? await toPng(container, {
            ...common,
            pixelRatio: MW_EXPORT_PIXEL_RATIO,
          })
        : await toSvg(container, common);
  } finally {
    if (viewportParent) {
      viewportParent.insertBefore(viewport, viewportSibling);
    }
    viewport.style.cssText = prevViewportCss;
    container.remove();
    while (restoreInlineStyles.length > 0) {
      restoreInlineStyles.pop()?.();
    }
  }
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
