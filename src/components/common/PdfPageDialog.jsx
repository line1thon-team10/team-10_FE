import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import '@/lib/pdfWorker.js';
import { useMaterialFile } from '@/hooks/usePlan.js';
import { MockBadge } from './Badge.jsx';
import Button from './Button.jsx';
import Modal from './Modal.jsx';
import { ErrorState, LoadingState } from './StateView.jsx';

const escapeHtml = (t) =>
  t.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

// PDF 보기 팝업 (디자인 PdfPageDialog). 자료와 쪽을 받아 그 쪽을 열고,
// quote가 있으면 글자 층에서 그 문장을 찾아 하이라이트해요 (QZ-13)
// TODO(확인필요): [기획 확인] 시연 PDF(김현민) — 지금은 목업 PDF예요
export default function PdfPageDialog({
  materialId,
  page,
  quote,
  title = '근거 원본',
  note,
  onClose,
}) {
  const { data: file, isPending, isError, error, refetch } = useMaterialFile(materialId);
  const [now, setNow] = useState(page);
  const [numPages, setNumPages] = useState(null);
  const [found, setFound] = useState(null);
  const pageRef = useRef(null);
  const highlight = now === page && quote;

  // 문장이 한 글자 조각 안에 있으면 <mark>로 감싸요
  const renderText = useCallback(
    ({ str }) => {
      if (!highlight || !str.includes(quote)) return escapeHtml(str);
      const [a, ...rest] = str.split(quote);
      return `${escapeHtml(a)}<mark class="pdf-mark">${escapeHtml(quote)}</mark>${escapeHtml(rest.join(quote))}`;
    },
    [highlight, quote],
  );

  return (
    <Modal
      title={title}
      wide
      onClose={onClose}
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button size="sm" disabled={now <= 1} onClick={() => setNow((n) => n - 1)}>
              <ChevronLeft size={13} aria-hidden="true" />
              이전 쪽
            </Button>
            <Button
              size="sm"
              disabled={!numPages || now >= numPages}
              onClick={() => setNow((n) => n + 1)}
            >
              다음 쪽
              <ChevronRight size={13} aria-hidden="true" />
            </Button>
          </div>
          {now !== page && (
            <Button size="sm" onClick={() => setNow(page)}>
              근거 쪽으로 (p.{page})
            </Button>
          )}
        </div>
      }
    >
      <p className="num -mt-2 flex flex-wrap items-center gap-2 text-[12.5px] text-fg-2">
        p.{now}
        {numPages && ` / ${numPages}`}
        <MockBadge />
      </p>
      {highlight && (
        <p className="rounded-xl border border-brand-line bg-brand-tint px-3.5 py-2 text-[12.5px] text-fg-soft">
          {found === false ? '이 쪽에서 문장을 찾지 못했어요 · ' : ''}근거 문장: “{quote}”
        </p>
      )}
      {isPending && <LoadingState title="PDF를 불러오는 중이에요" />}
      {isError && (
        <ErrorState title="PDF를 열지 못했어요" description={error.message} onRetry={refetch} />
      )}
      {file && (
        <div
          ref={pageRef}
          className="grid place-items-center overflow-auto rounded-xl bg-white/[0.04] p-3"
        >
          <Document
            file={file}
            onLoadSuccess={(d) => setNumPages(d.numPages)}
            loading={<LoadingState title="PDF를 여는 중이에요" />}
            error={<ErrorState title="PDF를 열지 못했어요" />}
          >
            <Page
              key={now}
              pageNumber={now}
              width={620}
              renderAnnotationLayer={false}
              customTextRenderer={renderText}
              onRenderTextLayerSuccess={() =>
                highlight && setFound(Boolean(pageRef.current?.querySelector('.pdf-mark')))
              }
              loading={<LoadingState title="쪽을 그리는 중이에요" />}
            />
          </Document>
        </div>
      )}
      {note && <p className="text-[11.5px] text-fg-2">{note}</p>}
    </Modal>
  );
}
