export type MediaAssetInput = {
  url: string;
  type: "image" | "video";
};

export async function saveMediaAsset(input: MediaAssetInput) {
  return {
    provider: process.env.MEDIA_PROVIDER ?? "url-reference",
    url: input.url,
    type: input.type
  };
}
