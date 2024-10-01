export function getTableCellHeight(
  tempCell: HTMLTableCellElement,
  content: string,
  columnWidth: string,
  contentElment: Element,
  tempTable: HTMLTableElement
) {
  tempCell.style.width = columnWidth;
  tempCell.textContent = content;
  contentElment.appendChild(tempTable);
}

export function defaultArrangeDataCore({
  data,
  column,
  beforeArrangeData,
  adjustMaxHeight,
  fontSize = "11px",
  summaryHeight = 0,
}: {
  data: any;
  column: Array<any>;
  beforeArrangeData: (itm: any) => any;
  adjustMaxHeight: number;
  fontSize: string;
  summaryHeight?: number;
}) {
  const newData: Array<any> = [];
  let trHeight = 0;
  let temp: Array<any> = [];
  const contentElment = document.querySelector(".content") as Element;
  const maxHeight =
    contentElment.getBoundingClientRect().height - adjustMaxHeight;

  data.forEach((itm: any, idx: number) => {
    itm = beforeArrangeData(itm);
    const contentElment = document.querySelector(".content") as Element;
    const tempTable = document.createElement("table");
    const tempRow = tempTable.insertRow();

    if (itm.summaryReport) {
      if (maxHeight - trHeight <= summaryHeight + 20) {
        trHeight += maxHeight - trHeight;
      }
    }
    column.forEach((col) => {
      const tempCell = tempRow.insertCell();
      tempTable.style.visibility = "hidden";
      tempTable.style.width = `100%`;
      tempTable.style.fontSize = fontSize;

      getTableCellHeight(
        tempCell,
        itm[col.datakey],
        col.width,
        contentElment,
        tempTable
      );
    });
    trHeight += tempRow.getBoundingClientRect().height;
    contentElment.removeChild(tempTable);
    temp.push(itm);
    if (
      trHeight >= maxHeight ||
      (idx === data.length - 1 && trHeight < maxHeight)
    ) {
      newData.push(temp);
      trHeight = 0;
      temp = [];
    }
  });

  return newData;
}
export const arrangeData = async ({
  data,
  column,
  beforeArrangeData,
  adjustMaxHeight,
  cb,
  fontSize = "11px",
  summaryHeight,
}: {
  data: any;
  column: Array<any>;
  beforeArrangeData: (itm: any) => any;
  adjustMaxHeight: number;
  cb?: ({
    data,
    column,
    beforeArrangeData,
    adjustMaxHeight,
  }: {
    data: any;
    column: Array<any>;
    beforeArrangeData: (itm: any) => any;
    adjustMaxHeight: number;
  }) => any[];
  fontSize?: string;
  summaryHeight?: number;
}) => {
  if (data === undefined) return [];
  if (cb) {
    return cb({
      data,
      column,
      beforeArrangeData,
      adjustMaxHeight,
    });
  }

  return defaultArrangeDataCore({
    data,
    column,
    beforeArrangeData,
    adjustMaxHeight,
    fontSize,
    summaryHeight,
  });
};
