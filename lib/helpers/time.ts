export const isoToPretty = (iso: string) => {
  return iso.slice(0, 10).split("-").reverse().join(".");
};
