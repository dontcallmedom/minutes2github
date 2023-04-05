// PDFExtract isn't available as an ES module, so we replace it to avoid unrecoverable failure in the browser version

export class PDFExtract {
  extractBuffer() {
    throw "Unimplemented";
  };
};
