export const parseEmbed = (inputEmbed: string) => {
  if (inputEmbed === "" || inputEmbed === undefined) {
    return undefined;
  }
  const recordedEmbed: { [x: string]: string } = {};
  const regex = /([^,=]+)=((?:"[^"]+"|'[^']+'|[^,]+))/g;

  inputEmbed.match(regex)?.forEach((match) => {
    const [fullMatch, key, value] = match.match(/([^,=]+)=((?:"[^"]+"|'[^']+'|[^,]+))/) || [];
    if (key !== undefined && value !== undefined) {
      recordedEmbed[key] = value.replace(/["']/g, '');
    }
  });

  return recordedEmbed;
};
