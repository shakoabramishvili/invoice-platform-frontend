'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

interface FaviconPreviewProps {
  className?: string;
}

export default function FaviconPreview({ className }: FaviconPreviewProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Application Icon</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Large Preview */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 border rounded-lg overflow-hidden bg-muted">
              <Image
                src="/favicon/favicon-32x32.png"
                alt="App Icon"
                width={64}
                height={64}
                className="object-contain"
                onError={(e) => {
                  // Fallback to placeholder if favicon doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">IP</div>';
                  }
                }}
              />
            </div>
            <div>
              <p className="font-medium">Invoice Platform</p>
              <p className="text-sm text-muted-foreground">Application Icon</p>
            </div>
          </div>

          {/* Different Sizes */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Icon Sizes:</p>
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 border rounded overflow-hidden bg-muted">
                <Image
                  src="/favicon/favicon-16x16.png"
                  alt="16x16"
                  width={16}
                  height={16}
                  className="object-contain w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">16×16</span>

              <div className="relative w-8 h-8 border rounded overflow-hidden bg-muted ml-2">
                <Image
                  src="/favicon/favicon-32x32.png"
                  alt="32x32"
                  width={32}
                  height={32}
                  className="object-contain w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">32×32</span>

              <div className="relative w-12 h-12 border rounded overflow-hidden bg-muted ml-2">
                <Image
                  src="/favicon/apple-touch-icon.png"
                  alt="180x180"
                  width={48}
                  height={48}
                  className="object-contain w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">Apple Touch</span>
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
            <p className="text-muted-foreground">
              To update the favicon, place your icon files in <code className="bg-background px-1 rounded">/public/favicon/</code>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
