import { useMemo, useState } from 'react';
import { Document, Page } from 'react-pdf';
import '@/lib/pdfWorker.js';

// PDF 한 쪽 미리보기 (S4 근거). 파일이 없거나 그 쪽이 없으면 회색 자리 화면을 보여줘요.
export default function PdfThumb({ file, page, label, width = 150 }) {
  const [numPages, setNumPages] = useState(null);
  const [failed, setFailed] = useState(false);
  const source = useMemo(() => file, [file]);
  const placeholder = (
    <div
      className="flex aspect-[1/1.32] flex-col gap-2 rounded-sm border border-line bg-surface p-3"
      style={{ width }}
    >
      <span className="h-2 w-3/4 rounded bg-surface-2" />
      <span className="h-1.5 w-full rounded bg-surface-2" />
      <span className="h-1.5 w-5/6 rounded bg-surface-2" />
      <span className="h-1.5 w-2/3 rounded bg-surface-2" />
    </div>
  );
  return (
    <figure className="flex flex-col items-center gap-1.5">
      {!source || failed || (numPages && page > numPages) ? (
        placeholder
      ) : (
        <Document
          file={source}
          onLoadSuccess={(d) => setNumPages(d.numPages)}
          onLoadError={() => setFailed(true)}
          loading={placeholder}
          error={placeholder}
        >
          <Page
            pageNumber={page}
            width={width}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="overflow-hidden rounded-sm border border-line"
            loading={placeholder}
          />
        </Document>
      )}
      <figcaption className="num text-xs text-fg-2">{label}</figcaption>
    </figure>
  );
}
