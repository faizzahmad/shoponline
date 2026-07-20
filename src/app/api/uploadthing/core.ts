import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(async ({ metadata, file }) => {
    return {
      fileUrl: file.url,
      fileKey: file.key,
      metadata,
    };
  }),

  /** Product gallery — select multiple images in one upload */
  productImages: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 8,
    },
  }).onUploadComplete(async ({ file }) => ({
    fileUrl: file.url,
    fileKey: file.key,
  })),

  reviewImages: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 4,
    },
  }).onUploadComplete(async ({ file }) => ({
    fileUrl: file.url,
    fileKey: file.key,
  })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
