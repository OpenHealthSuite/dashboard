export const fnYesterDate = () => {
  const yesterDate = new Date();
  yesterDate.setDate(yesterDate.getDate() - 1);
  return yesterDate;
};

export const fnLastWeekDate = () => {
  const lastWeekDate = new Date();
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  return lastWeekDate;
};
