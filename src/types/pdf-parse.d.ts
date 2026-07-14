declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }
  function parse(dataBuffer: Buffer, options?: any): Promise<PDFData>;
  export default parse;
}

declare module 'pdf-parse/lib/pdf-parse.js' {
  import parse from 'pdf-parse';
  export default parse;
}
