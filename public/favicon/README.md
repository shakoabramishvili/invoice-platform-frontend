# Favicon Directory

This directory contains all favicon and icon files for the application.

## File Structure

Place your favicon files here with the following naming convention:

- `favicon.ico` - Standard ICO favicon (16x16, 32x32, 48x48)
- `favicon-16x16.png` - 16x16 PNG favicon
- `favicon-32x32.png` - 32x32 PNG favicon
- `favicon-192x192.png` - 192x192 PNG for Android
- `favicon-512x512.png` - 512x512 PNG for high-res displays
- `apple-touch-icon.png` - 180x180 PNG for iOS devices

## How to Generate Favicons

1. Use a tool like [Favicon Generator](https://realfavicongenerator.net/)
2. Upload your logo/image
3. Download the generated package
4. Place all files in this directory

## Usage

The favicons are automatically referenced in `app/layout.tsx` and will be used by browsers and devices.
