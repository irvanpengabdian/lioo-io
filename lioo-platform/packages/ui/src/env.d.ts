/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module '*.png' {
  const content: import('next/dist/shared/lib/image-external').StaticImageData;
  export default content;
}

declare module '*.jpg' {
  const content: import('next/dist/shared/lib/image-external').StaticImageData;
  export default content;
}

declare module '*.svg' {
  const content: import('next/dist/shared/lib/image-external').StaticImageData;
  export default content;
}
