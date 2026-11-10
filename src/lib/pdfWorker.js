import { pdfjs } from 'react-pdf';

// react-pdf 워커 설정 (PDF 미리보기 · PDF 보기 팝업이 같이 써요)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();
