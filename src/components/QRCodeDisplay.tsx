import { QRCodeSVG } from 'qrcode.react';

export function QRCodeDisplay({ url }: { url: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm inline-flex">
      <QRCodeSVG value={url} size={200} level="M" />
    </div>
  );
}
