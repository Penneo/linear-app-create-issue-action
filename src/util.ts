export const parseEmbed = (inputEmbed: string) => {
  if (inputEmbed === "" || inputEmbed === undefined) {
    return undefined;
  }
  const recordedEmbed: { [x: string]: string } = {};
  const regex = /([^,=]+)=((?:"[^"]+"|'[^']+'|[^,]+))/g;

  const matches = inputEmbed.match(regex);

  if (matches) {
    for (const match of matches) {
      const [_, key, value] =
        match.match(/([^,=]+)=("[^"]+"|'[^']+'|[^,]+)/) || [];

      if (key !== undefined && value !== undefined) {
        recordedEmbed[key] = value.replace(/["']/g, "");
      }
    }
  }

  return recordedEmbed;
};
