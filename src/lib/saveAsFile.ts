export default async function SaveAsFile(extractTable: string) {
  try {
    const blob = new Blob([extractTable], {
      type: "application/vnd.ms-excel",
    });
    const defaultFilename = "filename.xls";
    const file = new File([blob], defaultFilename);
    const fileHandle = await (window as any).showSaveFilePicker({
      suggestedName: defaultFilename,
    });
    const writableStream = await fileHandle.createWritable();
    await writableStream.write(file);
    await writableStream.close();
  } catch (error) {
    console.error("Error saving file:", error);
  }
}
